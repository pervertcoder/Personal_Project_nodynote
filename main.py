from fastapi import *
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI()

app.mount("/statics", StaticFiles(directory="statics"))

# Static Pages
@app.get("/")
async def index(request: Request):
    return FileResponse("./statics/index.html")