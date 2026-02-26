from fastapi import FastAPI, WebSocket, Request
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from auth.auth import router as auth_router
from note.note import router as note_router
from websocket.websocket import websocket_router

app = FastAPI()

app.include_router(auth_router)
app.include_router(note_router)
app.include_router(websocket_router)


app.mount("/statics", StaticFiles(directory="statics"))
# Static Pages
@app.get("/")
async def index(request: Request):
    return FileResponse("./statics/welcome_page.html", media_type="text/html")

@app.get("/dashboard", include_in_schema=False)
async def dashboard_page(request: Request):
    return FileResponse("./statics/index.html")

@app.get("/note/{note_id}", include_in_schema=False)
async def note_page(request: Request):
    return FileResponse("./statics/note_page.html")
	