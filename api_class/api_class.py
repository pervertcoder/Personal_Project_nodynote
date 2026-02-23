from pydantic import BaseModel

class registRequest(BaseModel):
    user_name : str
    email : str
    password : str

class loginRequest(BaseModel):
    email : str
    password : str

class loginData(BaseModel):
    email : str    

class authResponse(BaseModel):
    ok : bool
    user_id : int
    user_name : str
    user_email : str

class loginResponse(BaseModel):
    ok : bool
    token : str
    user_id : int

class errorResponse(BaseModel):
    error : bool
    message : str