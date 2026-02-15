from fastapi import APIRouter
from fastapi.responses import JSONResponse
from fastapi import FastAPI, Request, Depends
from api_class.api_class import registRequest, loginRequest, authResponse, loginResponse, errorResponse
from auth.auth_func import User, create_jwt, check_format

router = APIRouter(prefix="/api/auth", tags=["auth"])

@router.post("/regist", response_model=authResponse, responses={400:{'model' : errorResponse, 'description' : '註冊失敗，重複的 Email 或其他原因'}, 500: {'model' : errorResponse, 'description' : '伺服器內部錯誤'}})
def register(request:registRequest):
    email = request.email
    user_name = request.user_name
    user = User(user_name, email)
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
    token = create_jwt(request)
    pass
    

@router.get("/login")
def get_user_data():
    pass


# 頁面載入都要先驗證 method:"GET" 取得在localStorage的token去後端檢查
# 登入程序 是把輸入的帳號密碼帶到後端生成token 並把回傳的token存到localStorage 本身就是這樣 帶資料生token 把token放到localStorage 登入後跳到主畫面
# 空白輸入防呆 重複帳號、密碼檢查 要有錯誤提示