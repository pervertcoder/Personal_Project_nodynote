from fastapi import APIRouter
from fastapi.responses import JSONResponse
from fastapi import Response, Cookie, HTTPException
from api_class.api_class import registRequest, loginRequest, authResponse, loginResponse, errorResponse, logoutResponse, registResponse, colorUpdateResponse, colorUpdateResquest
from auth.auth_func import User, create_jwt
from db_control.db_controller import check_token_DB, token_insert, delete_token_DB
import jwt
from env_settings.env import ALGORITHM, SECRET_KEY

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/regist", response_model=registResponse, responses={400:{'model' : errorResponse, 'description' : '註冊失敗，重複的 Email 或其他原因'}, 500: {'model' : errorResponse, 'description' : '伺服器內部錯誤'}})
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

@router.put("/authen", response_model=loginResponse)
def login(request:loginRequest, response:Response):
    email = request.email
    user = User(email)
    check_data = user.get_user_data()
    user_id = check_data[0][0]
    if check_data != [] and check_data[0][3] == request.password:
        token = create_jwt({'id' : check_data[0][0], 'email' : check_data[0][2]})
        check = check_token_DB(email)
        if check[0]:
            return JSONResponse(status_code=401, content={
                "error" : True,
                "message" : "此帳號重複登入"
            })
        else:
            token_insert(token, email)

            response.set_cookie(
                key="access_token",
                value=token,
                httponly=True,
                secure=False,
                samesite="lax"
            )
            return loginResponse(ok=True, user_id=user_id)
    else:
        return JSONResponse(status_code=400, content={
            'error' : True,
            'message' : '帳號或密碼不存在'
        })
       

@router.get("/login", response_model=authResponse, responses={400:{'model' : errorResponse, 'description' : 'Email或密碼不正確'}})
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
    
@router.get("/check_token")
def check_token(access_token:str = Cookie(None)):
    if not access_token:
        raise HTTPException(status_code=401, detail="未登入")
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        exp_time = payload["exp"]
        return {"ok" : True, "exp_time" : exp_time}
    except jwt.ExpiredSignatureError:
        delete_token_DB(payload["email"])
        raise HTTPException(status_code=401, detail="token已過期")
    except jwt.ExpiredSignatureError:
        delete_token_DB(payload["email"])
        raise HTTPException(status_code=401, detail="token無效")
    
@router.post("/color", response_model=colorUpdateResponse)
def color_updating(request:colorUpdateResquest):
    email = request.user_email
    color = request.color
    user = User(email)
    check_data = user.get_user_data()
    user_id = check_data[0][0]
    user.color_edit(user_id, color)
    return colorUpdateResponse(ok=True)
    
@router.post("/logout")
def logout(response:Response, access_token:str = Cookie(None)):
    if not access_token:
        return JSONResponse(status_code=401, content={
            "error" : True,
            "message" : "cookie not found"
        })
    try:
        payload = jwt.decode(access_token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email = payload["email"]
    except jwt.ExpiredSignatureError:
        return JSONResponse(status_code=401, content={
            "error" : True,
            "message" : "token expired"
        })
    except jwt.InvalidTokenError:
        return JSONResponse(status_code=401, content={
            "error" : True,
            "message" : "token invalid"
        })
    delete_token_DB(user_email)
    response.delete_cookie("access_token")
    return logoutResponse(ok=True, message="已登出")
    