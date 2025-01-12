from fastapi import APIRouter, Request, Form, Depends
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse, Response, FileResponse
from utils.database_manager import BBDD_MANAGEMENT
from utils.languages_bbdd_manager import LANGUAJE_BBDD_MANAGEMENT

index_route = APIRouter()

templates = Jinja2Templates(directory="views")

@index_route.get("/", response_class=HTMLResponse)
async def read_index(request: Request): 
    return templates.TemplateResponse("home.html", {"request": request})

@index_route.get("/collections", response_class=HTMLResponse)
async def read_collections(request: Request): 
    return templates.TemplateResponse("collections.hmtl", {"request": request})

@index_route.get("/about", response_class=HTMLResponse)
async def read_about(request: Request): 
    return templates.TemplateResponse("about.html", {"request": request})

@index_route.get("/cart", response_class=HTMLResponse)
async def read_cart(request: Request): 
    return templates.TemplateResponse("cart.html", {"request": request})

@index_route.get("/purchase", response_class=HTMLResponse)
async def read_purchase(request: Request): 
    return templates.TemplateResponse("purchase.html", {"request": request})

@index_route.get("/login", response_class=HTMLResponse)
async def read_login(request: Request): 
    return templates.TemplateResponse("login.html", {"request": request})

@index_route.get("/signup", response_class=HTMLResponse)
async def read_signup(request: Request): 
    return templates.TemplateResponse("signup.html", {"request": request})

@index_route.get("/profile", response_class=HTMLResponse)
async def read_profile(request: Request): 
    return templates.TemplateResponse("profile.html", {"request": request})

@index_route.get("/admin", response_class=HTMLResponse)
async def read_admin(request: Request): 
    return templates.TemplateResponse("admin.html", {"request": request})

@index_route.get("/stock", response_class=HTMLResponse)
async def read_stock(request: Request): 
    return templates.TemplateResponse("stock.html", {"request": request})

@index_route.get("/uploader", response_class=HTMLResponse)
async def read_uploader(request: Request): 
    return templates.TemplateResponse("uploader.html", {"request": request})

@index_route.get("/product", response_class=HTMLResponse)
async def read_product(request: Request): 
    return templates.TemplateResponse("product.html", {"request": request})

@index_route.get("/collection", response_class=HTMLResponse)
async def read_collection(request: Request): 
    return templates.TemplateResponse("collection.html", {"request": request})

@index_route.get("/bbdd_manager", response_class=HTMLResponse)
async def read_bbdd_manager(request: Request): 
    return templates.TemplateResponse("bbdd_manager.html", {"request": request})

@index_route.get("/string", response_class=JSONResponse)
async def read_languaje_string(request: Request, languaje_bbdd_manager: LANGUAJE_BBDD_MANAGEMENT = Depends()):
    strings = languaje_bbdd_manager.get_language_data()
    return JSONResponse(status_code=200, content={"strings": strings})