from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import os
from routers import account, tag, expense, auth
from fastapi.middleware.cors import CORSMiddleware
from configs.config import settings
from middleware.auth_middleware import AuthorizeRequestMiddleware

# Ensure uploads directory exists
UPLOAD_DIR = "uploads/avatars"
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title="Expense Tracker Backend"
)

app.add_middleware(
    AuthorizeRequestMiddleware
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(','),
    allow_credentials=True,
    allow_methods=settings.CORS_METHODS.split(','),
    allow_headers=settings.CORS_HEADERS.split(','),
)


app.include_router(account.router)
app.include_router(tag.router)
app.include_router(expense.router)
app.include_router(auth.router)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/")
async def root():
    return {
        "message": "Welcome to Expense Tracker API",
        "docs" : "http://localhost:8000/docs"   
    }