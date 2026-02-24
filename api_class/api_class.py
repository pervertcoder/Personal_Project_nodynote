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
    member_data : list

class loginResponse(BaseModel):
    ok : bool
    token : str
    user_id : int

class errorResponse(BaseModel):
    error : bool
    message : str

class note_addResponse(BaseModel):
    note_id : int

class note_data_request(BaseModel):
    title : str
    content : str

class note_render_request(BaseModel):
    note : list

class note_update_request(BaseModel):
    name : str
    content : str

class note_update_response(BaseModel):
    ok : bool