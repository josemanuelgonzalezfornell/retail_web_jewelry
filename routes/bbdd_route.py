from fastapi import APIRouter, Request, Form, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse, Response, FileResponse
from utils.database_manager import BBDD_MANAGEMENT
from utils.rag_manager import RAGManager
from utils.request_classes import *


bbdd_manager_route = APIRouter()

templates = Jinja2Templates(directory="templates")

@bbdd_manager_route.get("/read_bbdd", response_class=HTMLResponse)
async def read_bbdd(request: Request): 
    return templates.TemplateResponse("read_bbdd.html", {"request": request})

@bbdd_manager_route.post("/create_table", response_class=HTMLResponse)
async def create_table(request: Request, table_name: str = Form(...), columns: dict = Form(...), relationships: dict = Form(...), primary_key: str = Form(...), ddbb_manager: BBDD_MANAGEMENT = Depends()):
    ddbb_manager.create_table(table_name, columns, relationships, primary_key)
    return templates.TemplateResponse("read_bbdd.html", {"request": request})

@bbdd_manager_route.post("/drop_table", response_class=HTMLResponse)
async def drop_table(request: Request, table_name: str = Form(...), ddbb_manager: BBDD_MANAGEMENT = Depends()):
    ddbb_manager.drop_table(table_name)
    return templates.TemplateResponse("read_bbdd.html", {"request": request})

@bbdd_manager_route.post("/drop_data", response_class=HTMLResponse)
async def drop_data(request: Request, table_name: str = Form(...), filters: dict = Form(...), ddbb_manager: BBDD_MANAGEMENT = Depends()):
    ddbb_manager.drop_data(table_name, filters)
    return templates.TemplateResponse("read_bbdd.html", {"request": request})

@bbdd_manager_route.post("/add_data", response_class=HTMLResponse)
async def add_data(request: Request, table_name: str = Form(...), data: dict = Form(...), ddbb_manager: BBDD_MANAGEMENT = Depends()):
    ddbb_manager.add_data(table_name, data)
    return templates.TemplateResponse("read_bbdd.html", {"request": request})

@bbdd_manager_route.post("/modify_data", response_class=HTMLResponse)
async def modify_data(request: Request, table_name: str = Form(...), filters: dict = Form(...), data: dict = Form(...), ddbb_manager: BBDD_MANAGEMENT = Depends()):
    ddbb_manager.modify_data(table_name, filters, data)
    return templates.TemplateResponse("read_bbdd.html", {"request": request})

@bbdd_manager_route.post("/get_data_filtered", response_class=HTMLResponse)
async def get_data_filtered(request: Request, table_name: str = Form(...), filters: dict = Form(...), ddbb_manager: BBDD_MANAGEMENT = Depends()):
    data = ddbb_manager.get_data_filtered(table_name, filters)
    return templates.TemplateResponse("read_bbdd.html", {"request": request, "data": data})

@bbdd_manager_route.post("/get_all_data", response_class=HTMLResponse)
async def get_all_data(request: Request, table_name: str = Form(...), ddbb_manager: BBDD_MANAGEMENT = Depends()):
    data = ddbb_manager.get_all_data(table_name)
    return templates.TemplateResponse("read_bbdd.html", {"request": request, "data": data})

@bbdd_manager_route.post("/get_columns", response_class=JSONResponse)
async def get_columns(request: Request, table_name: str = Form(...), ddbb_manager: BBDD_MANAGEMENT = Depends()):
    data = ddbb_manager.get_columns(table_name)
    return JSONResponse(status_code=200, content={"data": data})

@bbdd_manager_route.get("/search", response_class=JSONResponse)
async def search(request: RetriveRequest, rag_manager: RAGManager = Depends()):
    id_list, texts_list = rag_manager.retrieve_data(request.query)
    return JSONResponse(status_code=200, content={"ids_lists": id_list, "texts_list": texts_list})


@bbdd_manager_route.get("/product", response_class=JSONResponse)
async def product(request: GetProduct, ddbb_manager: BBDD_MANAGEMENT = Depends()):
    data_filtered = ddbb_manager.get_data_filtered("products", {"id": request.id})
    return JSONResponse(status_code=200, content={"data": data_filtered})

@bbdd_manager_route.get("/collection", response_class=JSONResponse)
async def read_bbdd_manager(request: Collection, ddbb_manager: BBDD_MANAGEMENT = Depends()): 
    data_filtered = ddbb_manager.get_data_filtered("collections", {"collection": request.id})
    return JSONResponse(status_code=200, content={"data": data_filtered})

@bbdd_manager_route.post("/product", response_class=JSONResponse)
async def product(request: AddProduct, ddbb_manager: BBDD_MANAGEMENT = Depends()):
    ddbb_manager.add_data("products", {"name": request.name, "color": request.color, "price": request.price, "description": request.description})
    return JSONResponse(status_code=200, content={"message": f"Product {request.name} added successfully"})

@bbdd_manager_route.post("/chatbot", response_class=JSONResponse)
async def chatbot(request: Chatbot, ddbb_manager: RAGManager = Depends()):
    response = ddbb_manager.chatbot(request.text)
    return JSONResponse(status_code=200, content={"response": response})