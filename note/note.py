from fastapi import APIRouter
from fastapi import FastAPI, WebSocket, Request

router = APIRouter(prefix="/api/note", tags=["note"])

@router.get("/note_render")
def note_render ():
    pass