import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from core.database import db_client
from core.config import settings
from routes import dashboard, planner, analytics

app = FastAPI(title=settings.APP_NAME)

# CORS Setup - Allow your React App (Vite) to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In production, replace with your actual domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routes
app.include_router(dashboard.router)
app.include_router(planner.router)
app.include_router(analytics.router)

@app.on_event("startup")
async def startup_event():
    await db_client.connect()

@app.on_event("shutdown")
async def shutdown_event():
    await db_client.close()

@app.get("/")
async def root():
    return {"message": "AgroAI Backend is Running", "status": "Healthy"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)