from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from routes.read_bbdd_route import bbdd_manager_route
import uvicorn

app = FastAPI()

app.mount("/static", StaticFiles(directory="static"), name="static")


app.include_router(bbdd_manager_route, prefix="/bbdd_manager")

if __name__ == "__main__":
    uvicorn.run(app, port=8000)