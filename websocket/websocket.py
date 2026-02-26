from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Cookie
from auth.auth_func import User
import jwt
from env_settings.env import ALGORITHM, SECRET_KEY

websocket_router = APIRouter()

active_connections = {}

# 驗證
# access_token : str = Cookie(None)
def get_current_user(token):
    if not token:
        return {
            "message" : "沒有編輯權限"
        }
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    user_email = payload["email"]
    user = User(user_email)
    check_data = user.get_user_data()
    user_id = check_data[0][0]
    pass


@websocket_router.websocket("/ws/note/{note_id}")
async def websocket_endpoint(websocket : WebSocket, note_id : str, user = Depends()):
    await websocket.accept()
    pass