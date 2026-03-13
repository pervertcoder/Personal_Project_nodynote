from fastapi import APIRouter
from fastapi.responses import JSONResponse
from fastapi import Cookie, HTTPException
from auth.auth_func import User
import jwt
from env_settings.env import ALGORITHM, SECRET_KEY
from db_control.db_controller import put_note_name, check_permission, update_note, render_note_data, delete_note, check_role, check_shared_user, add_permission
from api_class.api_class import note_addResponse, note_data_request, note_render_request, note_update_request, note_update_response, note_render_data_response, note_delete, sharedNoteRequest, sharedNoteResponse

router = APIRouter(prefix="/api/note", tags=["note"])

@router.post("/note_add", response_model=note_addResponse)
def note_add (request:note_data_request, access_token : str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="未登入")
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
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
    

@router.get("/note_content_render/{note_id}", response_model=note_render_request)
def note_content_render (note_id, access_token : str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="未登入")
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email = payload["email"]
        user = User(user_email)
        check_data = user.get_user_data()
        user_data = check_data[0]
        note_data = check_permission(note_id, user_data[0])
        if note_data:
            if note_data[0][2] == "owner" or note_data[0][2] == "editor":
                return note_render_request(user_data=user_data, note=note_data)
        else:
            return JSONResponse(status_code=403, content={
                "error" : True,
                "message" : "權限不足"
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
def note_update (note_id, request:note_update_request, access_token : str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="未登入")
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email = payload["email"]
        user = User(user_email)
        check_data = user.get_user_data()
        user_id = check_data[0][0]
        if check_data:
            rows = update_note(request.name, request.content, note_id, user_id)
            if rows == 0 :
                return JSONResponse(status_code=403, content={
                "error" : True,
                "message" : "權限不足"
                })
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
    
@router.get("/note_data_render/{role}", response_model=note_render_data_response)
def note_data_render (role : str, access_token : str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="未登入")
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email = payload["email"]
        user = User(user_email)
        check_data = user.get_user_data()
        user_id = check_data[0][0]
        # role = "owner"
        notes = render_note_data(user_id, role)
        if check_data and notes:
            return note_render_data_response(data=notes)
        return JSONResponse(status_code=403, content={
			'error': True,
			'message': '權限不足'
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


@router.delete("/note_delete/{note_id}", response_model=note_delete)
def note_data_render (note_id, access_token : str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="未登入")
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email = payload["email"]
        user = User(user_email)
        check_data = user.get_user_data()
        user_id = check_data[0][0]
        permission = check_permission(note_id, user_id)
        if check_data and permission[0][2] == "owner":
            deleted_note_id = delete_note(note_id)
            return note_delete(ok=True, note_id=deleted_note_id)
        return JSONResponse(status_code=403, content={
			'error': True,
			'message': '權限不足'
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
    
@router.post("/share_note/{note_id}", response_model=sharedNoteResponse)
def share_note (note_id, request:sharedNoteRequest, access_token : str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="未登入")
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email = payload["email"]
        user = User(user_email)
        check_data = user.get_user_data()
        user_id = check_data[0][0]
        role = check_role(note_id, user_id)

        share_user_id = check_shared_user(request.email)
        if role == "owner" and share_user_id:
            add_permission(note_id, share_user_id)
            return sharedNoteResponse(ok=True)
        return JSONResponse(status_code=403, content={
			'error': True,
			'message': '權限不足'
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