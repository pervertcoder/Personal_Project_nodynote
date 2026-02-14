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

@router.post("/login")
def login():
    pass

@router.get("/login")
def get_user_data():
    pass