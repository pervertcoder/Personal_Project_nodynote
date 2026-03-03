from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Cookie, HTTPException

from db_control.db_controller import check_permission, get_note_data, get_verifiy_thirty, update_note_websocket

from auth.auth_func import User
import jwt
from env_settings.env import ALGORITHM, SECRET_KEY

import time

from fastapi.concurrency import run_in_threadpool
import asyncio

websocket_router = APIRouter()

active_notes = {}


# 驗證
def get_current_user(access_token : str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="未登入")
    payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
    user_email = payload["email"]
    user = User(user_email)
    check_data = user.get_user_data()
    if check_data:
        user_id = check_data[0][0]
        return user_id
    else:
        raise HTTPException(status_code=401, detail="Token 無效")
    
def verify_note_permission(note_id : str, user = Depends(get_current_user)):
    note = check_permission(note_id, user)
    if not note:
        raise HTTPException(status_code=401, detail="權限不足")
    answer = {
        "note" : note,
        "user_id" : user
    }
    return answer

# last_time_verify = {}
# def time_to_verify(note_id):
#     now = time.time()
#     if note_id not in last_time_verify:
#         last_time_verify[note_id] = now
#         return True
#     if now - last_time_verify[note_id] >= 30:
#         last_time_verify[note_id] = now
#         return True
#     return False

# def verify_current_user_cookie(websocket:WebSocket):
#     cookies = websocket.cookies
#     token = cookies.get("access_token")
#     if not token:
#         return None
#     payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
#     user_email = payload["email"]
#     user = User(user_email)
#     check_data = user.get_user_data()
#     if check_data:
#         user_id = check_data[0][0]
#         return user_id
#     else:
#         return None

# def get_note_permission(note_id:str):
#     note = get_verifiy_thirty(note_id)
#     if note:
#         return note
#     else:
#         return None
    
def update_via_websocket(note_title:str, note_content:str, note_id:int):
    # noteId = int(note_id)
    result = update_note_websocket(note_title, note_content, note_id)
    return result

async def save_DB (note_id:int):
    while note_id in active_notes and active_notes[note_id]["connection"]:
        note = active_notes[note_id]
        await run_in_threadpool(update_via_websocket, note["name"], note["content"], note_id)
        await asyncio.sleep(30)

@websocket_router.websocket("/ws/note/{note_id}")
async def websocket_endpoint(websocket : WebSocket, note_id : str, user_permission = Depends(verify_note_permission)):
 
    await websocket.accept()
    
    # user_id = user_state["user_id"]
    if note_id not in active_notes:
        notes = get_note_data(note_id)
        active_notes[note_id] = {"name": notes[0][1], "content" : notes[0][2], "connection" : set()}
        asyncio.create_task(save_DB(note_id))
    
    active_notes[note_id]["connection"].add(websocket)
    
    await websocket.send_json({
        "type" : "init",
        "name" : active_notes[note_id]["name"],
        "content" : active_notes[note_id]["content"]
    })
    
    try:
        while True:

            # if time_to_verify(note_id):
            #     user = verify_current_user_cookie(websocket)
            #     note = get_note_permission(note_id)
            #     if not user or user not in note:
            #         await websocket.close(code=1008)
            #         break
            

            data = await websocket.receive_json()
            if data["type"] == "name":
                active_notes[note_id]["name"] = data["value"]
            elif data["type"] == "content":
                active_notes[note_id]["content"] = data["value"]
            
            for conn in active_notes[note_id]["connection"]:
                if conn != websocket:
                    await conn.send_json(data)
    except WebSocketDisconnect:
        print("使用者斷線")
        active_notes[note_id]["connection"].discard(websocket)

        if len(active_notes[note_id]["connection"]) == 0:
            print("最後一人離開，存檔")
            note = active_notes[note_id]
            await run_in_threadpool(update_via_websocket, note["name"], note["content"], note_id)

            del active_notes[note_id]
            print("記憶體已清除")


# 本來的規劃是做純文字的編輯，是否要加上表格功能 讓筆記功能更完整一點
# 目前正遇到如何解決同一行衝突的部分 在想要把利用版本去做區分 還是要使用專門技術OT/CRDT