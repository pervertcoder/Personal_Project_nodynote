from fastapi import APIRouter
from fastapi.responses import JSONResponse
from fastapi import Response, Cookie, HTTPException
from api_class.api_class import loginRequest, loginResponse, logoutResponse
from auth.auth_func import User, create_jwt
from db_control.db_controller import check_token_DB, token_insert, delete_token_DB
import jwt
from env_settings.env import ALGORITHM, SECRET_KEY

router = APIRouter(prefix="/api/sessions", tags=["sessions"])

@router.post("/", response_model=loginResponse)
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
                secure=True,
                samesite="lax"
            )
            return loginResponse(ok=True, user_id=user_id)
    else:
        return JSONResponse(status_code=400, content={
            'error' : True,
            'message' : '帳號或密碼不存在'
        })
    

@router.delete("/")
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

@router.get("/validate")
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
    except jwt.InvalidTokenError:
        delete_token_DB(payload["email"])
        raise HTTPException(status_code=401, detail="token無效")