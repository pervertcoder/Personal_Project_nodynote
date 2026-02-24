from fastapi import APIRouter
from fastapi.responses import JSONResponse
from fastapi import FastAPI, WebSocket, Request, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from auth.auth_func import User
import jwt
from env_settings.env import ALGORITHM, SECRET_KEY
from db_control.db_controller import put_note_name, check_permission, update_note
from api_class.api_class import note_addResponse, note_data_request, note_render_request, note_update_request, note_update_response

router = APIRouter(prefix="/api/note", tags=["note"])
security = HTTPBearer()

@router.post("/note_add", response_model=note_addResponse)
def note_add (request:note_data_request, credentials:HTTPAuthorizationCredentials=Depends(security)):
    try:
        token = credentials.credentials.replace('Bearer ', '')
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email = payload["email"]
        user = User(user_email)
        check_data = user.get_user_data()
        user_id = check_data[0][0]
        if check_data:
            note_id = put_note_name(user_id, request.title, request.content)
            return note_addResponse(note_id=note_id)
        else:
            return JSONResponse(status_code=401, content={
                "error" : True,
                "message" : "帳號或密碼發生錯誤"
            })
    except jwt.ExpiredSignatureError:
        return JSONResponse(status_code=401, content={
			'error': True,
			'message': 'Token 已過期，請重新登入'
		})
    except jwt.InvalidTokenError:
        return JSONResponse(status_code=401, content={
			'error': True,
			'message': 'Token 無效，請重新登入'
        })
    

@router.get("/note_render/{note_id}", response_model=note_render_request)
def note_add (note_id, credentials:HTTPAuthorizationCredentials=Depends(security)):
    try:
        token = credentials.credentials.replace('Bearer ', '')
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email = payload["email"]
        user = User(user_email)
        check_data = user.get_user_data()
        user_id = check_data[0][0]
        note_data = check_permission(note_id, user_id)
        if check_data and note_data:
            return note_render_request(note=note_data)
        else:
            return JSONResponse(status_code=401, content={
                "error" : True,
                "message" : "帳號或密碼發生錯誤"
            })
    except jwt.ExpiredSignatureError:
        return JSONResponse(status_code=401, content={
			'error': True,
			'message': 'Token 已過期，請重新登入'
		})
    except jwt.InvalidTokenError:
        return JSONResponse(status_code=401, content={
			'error': True,
			'message': 'Token 無效，請重新登入'
        })
    
@router.put("/note_update/{note_id}", response_model=note_update_response)
def note_update (note_id, request:note_update_request, credentials:HTTPAuthorizationCredentials=Depends(security)):
    try:
        token = credentials.credentials.replace('Bearer ', '')
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email = payload["email"]
        user = User(user_email)
        check_data = user.get_user_data()
        user_id = check_data[0][0]
        if check_data:
            update_note(request.name, request.content, note_id)
            return note_update_response(ok=True)
        else:
            return JSONResponse(status_code=401, content={
                "error" : True,
                "message" : "帳號或密碼發生錯誤"
            })
    except jwt.ExpiredSignatureError:
        return JSONResponse(status_code=401, content={
			'error': True,
			'message': 'Token 已過期，請重新登入'
		})
    except jwt.InvalidTokenError:
        return JSONResponse(status_code=401, content={
			'error': True,
			'message': 'Token 無效，請重新登入'
        })