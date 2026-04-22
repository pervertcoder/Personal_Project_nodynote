from fastapi import APIRouter
from fastapi.responses import JSONResponse
from fastapi import Response, Cookie, HTTPException
from api_class.api_class import registRequest, authResponse, errorResponse, registResponse, colorUpdateResponse, colorUpdateResquest
from auth.auth_func import User, create_jwt
from db_control.db_controller import delete_token_DB
import jwt
from env_settings.env import ALGORITHM, SECRET_KEY

router = APIRouter(prefix="/api/users", tags=["users"])

@router.post("/", response_model=registResponse, responses={400:{'model' : errorResponse, 'description' : '註冊失敗，重複的 Email 或其他原因'}, 500: {'model' : errorResponse, 'description' : '伺服器內部錯誤'}})
def register(request:registRequest):
    email = request.email
    user_name = request.user_name
    user = User(email)
    check_data = user.get_user_data()
    if check_data == []:
        user.write_user_data(user_name=user_name, user_email=request.email, user_password=request.password)
        return registResponse(ok=True)
    else:
        return JSONResponse(status_code=409,content={
            'error' : True,
            'message' : "帳號重複",
        })
       
@router.get("/me", response_model=authResponse, responses={400:{'model' : errorResponse, 'description' : 'Email或密碼不正確'}})
def get_user_data(access_token:str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="未登入")
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email = payload["email"]
        user = User(user_email)
        check_data = user.get_user_data()
        if check_data and access_token == check_data[0][5]:
            return  authResponse(ok=True, member_data=check_data)
        else:
            return JSONResponse(status_code=401, content={
                "error" : True,
                "message" : "帳號或密碼發生錯誤"
            })
    except jwt.ExpiredSignatureError:
        delete_token_DB(user_email)
        return JSONResponse(status_code=401, content={
			'error': True,
			'message': 'Token 已過期，請重新登入'
		})
    except jwt.InvalidTokenError:
        delete_token_DB(user_email)
        return JSONResponse(status_code=401, content={
			'error': True,
			'message': 'Token 無效，請重新登入'
        })
    
@router.patch("/me", response_model=colorUpdateResponse)
def color_updating(request:colorUpdateResquest):
    email = request.user_email
    color = request.color
    user = User(email)
    check_data = user.get_user_data()
    user_id = check_data[0][0]
    user.color_edit(user_id, color)
    return colorUpdateResponse(ok=True)
    