from fastapi import APIRouter
from fastapi import FastAPI, Request, Depends
from api_class.api_class import registRequest, loginRequest, authResponse
from auth.auth_func import User

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/regist", response_model=authResponse)
def register(request:registRequest):
    user_name = request.user_name
    user = User(user_name)
    user.write_user_data(user_name=user_name, user_email=request.email, user_password=request.password)
    return authResponse(ok=True)

@router.put("/auth")
def login():
    pass

@router.get("/login")
def get_user_data():
    pass


# 頁面載入都要先驗證 method:"GET" 取得在localStorage的token去後端檢查
# 登入程序 是把輸入的帳號密碼帶到後端生成token 並把回傳的token存到localStorage 本身就是這樣 帶資料生token 把token放到localStorage 登入後跳到主畫面
# 空白輸入防呆 重複帳號、密碼檢查 要有錯誤提示