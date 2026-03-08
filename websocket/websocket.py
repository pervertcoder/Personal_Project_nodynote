from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Cookie, HTTPException

from db_control.db_controller import check_permission, get_note_data, get_verifiy_thirty, update_note_websocket

from auth.auth_func import User
import jwt
from env_settings.env import ALGORITHM, SECRET_KEY

import json
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


    
def update_via_websocket(note_title:str, note_content:list, note_id:int):
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
    
    if note_id not in active_notes:
        notes = get_note_data(note_id)
        raw_content = notes[0][2]
        try:
            lines = json.loads(raw_content)
        except json.JSONDecodeError:
            lines = [{"text": raw_content, "version": 0}]

        active_notes[note_id] = {"name": notes[0][1], "content" : lines, "connection" : set()}
        asyncio.create_task(save_DB(note_id))
    
    active_notes[note_id]["connection"].add(websocket)
    
    await websocket.send_json({
        "type" : "content",
        "name" : active_notes[note_id]["name"],
        "content" : active_notes[note_id]["content"]
    })
    
    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data["type"]
            content = data["content"]
            if msg_type == "name":
                active_notes[note_id]["name"] = data["content"]["newName"]
            elif msg_type == "updated_line":
                line_index = content["lineIndex"]
                new_text = content["newText"]
                client_version = content["version"]

                note = active_notes[note_id]
                while len(note["content"]) <= line_index:
                    note["content"].append({"text" : "", "version" : 0})

                server_line = note["content"][line_index]

                if client_version == server_line["version"]:
                    server_line["text"] = new_text
                    server_line["version"] += 1

                    await websocket.send_json({
                        "type" : "ack",
                        "content" : {
                            "lineIndex" : line_index,
                            "version" : server_line["version"]
                        }
                    })
            
                    for conn in note["connection"]:
                        if conn != websocket:
                            await conn.send_json({
                                "type" : "updated_line",
                                "content" : {
                                    "lineIndex" : line_index,
                                    "newText" : new_text,
                                    "version" : server_line["version"]
                                }
                            })
                else:
                    await websocket.send_json({
                        "type" : "conflict",
                        "content" : {
                            "lineIndex": line_index,
                            "serverText": server_line["text"],
                            "serverVersion": server_line["version"]
                        }
                    })
            elif msg_type == "insert_line":
                index = content["lineIndex"]
                text = content["text"]
                # if text.strip() == "":
                #     continue

                note = active_notes[note_id]
                note["content"].insert(index, {
                    "text" : text,
                    "version" : 0
                })
                
                await websocket.send_json({
                    "type" : "ack_insert",
                    "content" : {
                        "lineIndex" : index
                    }
                })

                for conn in note["connection"]:
                    if conn != websocket:
                        await conn.send_json({
                            "type" : "insert_line",
                            "content" : {
                                "lineIndex" : index,
                                "text" : text,
                                "version" : 0
                            }
                        })
            elif msg_type == "delete_line":
                index = content["lineIndex"]

                note = active_notes[note_id]

                if index < len(note["content"]):
                    note["content"].pop(index)
                
                await websocket.send_json({
                    "type" : "ack_delete",
                    "content" : {
                        "lineIndex" : index
                    }
                })

                for conn in note["connection"]:
                    if conn != websocket:
                        await conn.send_json({
                            "type" : "delete_line",
                            "content" : {
                                "lineIndex" : index
                            }
                        })
                    
    except WebSocketDisconnect:
        print("使用者斷線")
    finally:
        note = active_notes.get(note_id)
        if note:
            active_notes[note_id]["connection"].discard(websocket)

            if len(active_notes[note_id]["connection"]) == 0:
                print("最後一人離開，存檔")
                note = active_notes[note_id]
                for line in note["content"]:
                    line["version"] = 0
                await run_in_threadpool(update_via_websocket, note["name"], note["content"], note_id)

                del active_notes[note_id]
                print("記憶體已清除")
