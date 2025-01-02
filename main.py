from fastapi import FastAPI, Depends
from fastapi.staticfiles import StaticFiles
from routes.read_bbdd_route import bbdd_manager_route
import uvicorn
from utils.database_manager import BBDD_MANAGEMENT
from utils.rag_manager import RAGManager

app = FastAPI()

rag_manager = RAGManager()

bbdd_manager = BBDD_MANAGEMENT("retail_web_jewelry.db", rag_manager)

app.mount("/static", StaticFiles(directory="static"), name="static", dependencies=[Depends(lambda: bbdd_manager)])


app.include_router(bbdd_manager_route, prefix="/bbdd_manager")

if __name__ == "__main__":
    uvicorn.run(app, port=8080)