from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from routes.bbdd_route import bbdd_manager_route
from routes.index_route import index_route
import uvicorn
from utils.database_manager import BBDD_MANAGEMENT
from utils.rag_manager import RAGManager

app = FastAPI()

rag_manager = RAGManager()

bbdd_manager = BBDD_MANAGEMENT("retail_web_jewelry.db", rag_manager)

app.mount("/assets", StaticFiles(directory="assets"), name="assets")


app.include_router(bbdd_manager_route, prefix="/database")
app.include_router(index_route)