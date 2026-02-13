from fastapi import APIRouter
from fastapi import FastAPI, WebSocket, Request

router = APIRouter(prefix="/note", tags=["note"])

@router.get("/")
def note ():
    pass