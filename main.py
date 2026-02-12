from fastapi import *
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
# from fastapi import websocket
from typing import List

app = FastAPI()

connections : List[WebSocket] = []

@app.websocket("/ws/note/{note_id}")
async def websocket_endpoint(websocket:WebSocket, note_id:int):
    await websocket.accept()
    connections.append(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            for conn in connections:
                if conn != websocket:
                    await conn.send_text(data)
    except:
        connections.remove(websocket)

app.mount("/statics", StaticFiles(directory="statics"))
# Static Pages
@app.get("/")
async def index(request: Request):
    return FileResponse("./statics/index.html")