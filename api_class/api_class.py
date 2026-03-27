from pydantic import BaseModel
from typing import Optional, List

class registRequest(BaseModel):
    user_name : str
    email : str
    password : str

class registResponse(BaseModel):
    ok : bool

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
    # token : str
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
    user_data : list
    note : list

class note_update_request(BaseModel):
    name : str
    content : str

class note_update_response(BaseModel):
    ok : bool

class note_render_data_detail(BaseModel):
    note_id : int
    title : str

class note_render_data_response(BaseModel):
    data : list

class note_delete(BaseModel):
    ok : bool
    note_id : int

class sharedNoteRequest(BaseModel):
    email : str
    role : str

class sharedNoteResponse(BaseModel):
    ok : bool

class logoutResponse(BaseModel):
    ok : bool
    message : str

class colorUpdateResponse(BaseModel):
    ok : bool

class colorUpdateResquest(BaseModel):
    user_email : str
    color : str

class notification(BaseModel):
    id : int
    note_id : int
    message : str
    created_at: str

class notificationResponse(BaseModel):
    data : Optional[List[notification]] = None