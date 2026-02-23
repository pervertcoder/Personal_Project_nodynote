from fastapi import FastAPI, WebSocket, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from auth.auth import router as auth_router
from note.note import router as note_router

app = FastAPI()

app.include_router(auth_router)
app.include_router(note_router)

connections : list[WebSocket] = []
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
    return FileResponse("./statics/welcome_page.html", media_type="text/html")

@app.get("/dashboard/{user_id}", include_in_schema=False)
async def dashboard_page(request: Request, user_id:int):
    return FileResponse("./statics/index.html")

@app.get("/note/{user_id}", include_in_schema=False)
async def note_page(request: Request):
    return FileResponse("./statics/note_page.html")
	

# 使用者API設計
# dashboard應該要在使用者名稱底下 網址要像/{username}/dashboard /{username}/{note ID}之類的