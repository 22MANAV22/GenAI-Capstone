from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import chat, catalog, lineage, health, repo, agent

app = FastAPI(
    title="Data Engineering AI Assistant",
    description="Local LLM-powered assistant for data engineering pipelines",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(repo.router,    prefix="", tags=["Repository"])
app.include_router(chat.router,    prefix="", tags=["Chat"])
app.include_router(catalog.router, prefix="", tags=["Catalog"])
app.include_router(lineage.router, prefix="", tags=["Lineage"])
app.include_router(health.router,  prefix="", tags=["Health"])
app.include_router(agent.router,   prefix="", tags=["Agent"])

@app.get("/")
async def root():
    return {"status": "success", "data": {"service": "DE AI Assistant", "version": "1.0.0"}, "message": "Running"}
