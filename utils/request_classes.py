from pydantic import BaseModel


class RetriveRequest(BaseModel):
    query: str

class GetProduct(BaseModel):
    id: int

class Collection(BaseModel):
    id: int

class AddProduct(BaseModel):
    name: str
    color: str
    price: float
    description: str

class Chatbot(BaseModel):
    text: str