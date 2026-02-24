from fastapi import APIRouter
from fastapi.responses import JSONResponse
from fastapi import FastAPI, Request, Depends
from api_class.api_class import registRequest, loginRequest, authResponse, loginResponse, errorResponse, loginData
from auth.auth_func import User, create_jwt, check_format
from db_control.db_controller import get_member_name
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from env_settings.env import ALGORITHM, SECRET_KEY

router = APIRouter(prefix="/api/auth", tags=["auth"])
security = HTTPBearer()

@router.post("/regist", response_model=authResponse, responses={400:{'model' : errorResponse, 'description' : '註冊失敗，重複的 Email 或其他原因'}, 500: {'model' : errorResponse, 'description' : '伺服器內部錯誤'}})
def register(request:registRequest):
    email = request.email
    user_name = request.user_name
    user = User(email)
    check_data = user.get_user_data()
    if check_data == []:
        user.write_user_data(user_name=user_name, user_email=request.email, user_password=request.password)
        return authResponse(ok=True)
    else:
        return JSONResponse(status_code=409,content={
            'error' : True,
            'message' : "帳號重複",
        })

@router.put("/authen", response_model=loginResponse)
def login(request:loginRequest):
    email = request.email
    user = User(email)
    check_data = user.get_user_data()
    user_id = check_data[0][0]
    if check_data != [] and check_data[0][3] == request.password:
        token = create_jwt({'id' : check_data[0][0], 'email' : check_data[0][2]})
        return loginResponse(ok=True, token=token, user_id=user_id)
    else:
        return JSONResponse(status_code=400, content={
            'error' : True,
            'message' : '帳號或密碼不存在'
        })
    

@router.get("/login", response_model=authResponse, responses={400:{'model' : errorResponse, 'description' : 'Email或密碼不正確'}})
def get_user_data(credentials:HTTPAuthorizationCredentials=Depends(security)):
    try:
        token = credentials.credentials.replace('Bearer ', '')
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_email = payload["email"]
        user = User(user_email)
        check_data = user.get_user_data()
        if check_data:
            return  authResponse(ok=True, member_data=check_data)
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
    


# 頁面載入都要先驗證 method:"GET" 取得在localStorage的token去後端檢查
# 登入程序 是把輸入的帳號密碼帶到後端生成token 並把回傳的token存到localStorage 本身就是這樣 帶資料生token 把token放到localStorage 登入後跳到主畫面
# 空白輸入防呆 重複帳號、密碼檢查 要有錯誤提示