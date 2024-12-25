from fastapi import APIRouter, Request, Form, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse, Response, FileResponse
from utils.database_manager import BBDD_MANAGEMENT



bbdd_manager_route = APIRouter()

templates = Jinja2Templates(directory="templates")

ddbb_manager = BBDD_MANAGEMENT("retail_web_jewelry.db")

@bbdd_manager_route.get("/read_bbdd", response_class=HTMLResponse)
async def read_bbdd(request: Request): 
    return templates.TemplateResponse("read_bbdd.html", {"request": request})

@bbdd_manager_route.post("/create_table", response_class=HTMLResponse)
async def create_table(request: Request, table_name: str = Form(...), columns: dict = Form(...), relationships: dict = Form(...), primary_key: str = Form(...)):
    ddbb_manager.create_table(table_name, columns, relationships, primary_key)
    return templates.TemplateResponse("read_bbdd.html", {"request": request})

@bbdd_manager_route.post("/drop_table", response_class=HTMLResponse)
async def drop_table(request: Request, table_name: str = Form(...)):
    ddbb_manager.drop_table(table_name)
    return templates.TemplateResponse("read_bbdd.html", {"request": request})

@bbdd_manager_route.post("/drop_data", response_class=HTMLResponse)
async def drop_data(request: Request, table_name: str = Form(...), filters: dict = Form(...)):
    ddbb_manager.drop_data(table_name, filters)
    return templates.TemplateResponse("read_bbdd.html", {"request": request})

@bbdd_manager_route.post("/upload_data", response_class=HTMLResponse)
async def upload_data(request: Request, table_name: str = Form(...), data: dict = Form(...)):
    ddbb_manager.upload_data(table_name, data)
    return templates.TemplateResponse("read_bbdd.html", {"request": request})

@bbdd_manager_route.post("/modify_data", response_class=HTMLResponse)
async def modify_data(request: Request, table_name: str = Form(...), filters: dict = Form(...), data: dict = Form(...)):
    ddbb_manager.modify_data(table_name, filters, data)
    return templates.TemplateResponse("read_bbdd.html", {"request": request})

@bbdd_manager_route.post("/get_data_filtered", response_class=HTMLResponse)
async def get_data_filtered(request: Request, table_name: str = Form(...), filters: dict = Form(...)):
    data = ddbb_manager.get_data_filtered(table_name, filters)
    return templates.TemplateResponse("read_bbdd.html", {"request": request, "data": data})

@bbdd_manager_route.post("/get_all_data", response_class=HTMLResponse)
async def get_all_data(request: Request, table_name: str = Form(...)):
    data = ddbb_manager.get_all_data(table_name)
    return templates.TemplateResponse("read_bbdd.html", {"request": request, "data": data})

@bbdd_manager_route.post("/get_columns", response_class=HTMLResponse)
async def get_columns(request: Request, table_name: str = Form(...)):
    data = ddbb_manager.get_columns(table_name)
    return templates.TemplateResponse("read_bbdd.html", {"request": request, "data": data})