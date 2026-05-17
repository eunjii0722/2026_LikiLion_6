from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
import db
from routes import parse, workflows, webhook, sheets

app = FastAPI(title="WIZE Demo")
db.init()

app.include_router(parse.router)
app.include_router(workflows.router)
app.include_router(webhook.router)
app.include_router(sheets.router)

app.mount("/", StaticFiles(directory="frontend", html=True), name="static")
