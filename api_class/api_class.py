from pydantic import BaseModel

class registRequest(BaseModel):
    user_name : str
    email : str
    password : str

class loginRequest(BaseModel):
    email : str
    password : str

class authResponse(BaseModel):
    ok : bool