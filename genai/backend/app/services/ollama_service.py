import httpx
import json
from typing import AsyncGenerator

OLLAMA_BASE = "http://localhost:11434"
DEFAULT_MODEL = "llama3.2:latest"

SYSTEM_PROMPT = """You are a senior Data Engineering assistant with deep expertise in:
- Apache Airflow DAGs and pipeline orchestration
- SQL query analysis and optimization
- Data lineage tracking and impact analysis
- Data quality monitoring and SLO adherence
- Python-based ETL pipelines

Answer concisely and technically. When showing code, use markdown code blocks.
Always be precise about table names, column names, and pipeline identifiers."""

async def generate(prompt: str, model: str = DEFAULT_MODEL, system: str = SYSTEM_PROMPT) -> str:
    payload = {
        "model": model,
        "prompt": prompt,
        "system": system,
        "stream": False,
        "options": {"temperature": 0.2, "num_ctx": 2048, "num_predict": 512}
    }
    async with httpx.AsyncClient(timeout=120.0) as client:
        resp = await client.post(f"{OLLAMA_BASE}/api/generate", json=payload)
        resp.raise_for_status()
        return resp.json().get("response", "")

async def stream_generate(prompt: str, model: str = DEFAULT_MODEL, system: str = SYSTEM_PROMPT) -> AsyncGenerator[str, None]:
    payload = {
        "model": model,
        "prompt": prompt,
        "system": system,
        "stream": True,
        "options": {"temperature": 0.2, "num_ctx": 2048, "num_predict": 512}
    }
    async with httpx.AsyncClient(timeout=120.0) as client:
        async with client.stream("POST", f"{OLLAMA_BASE}/api/generate", json=payload) as resp:
            async for line in resp.aiter_lines():
                if line:
                    try:
                        chunk = json.loads(line)
                        token = chunk.get("response", "")
                        if token:
                            yield token
                        if chunk.get("done"):
                            break
                    except json.JSONDecodeError:
                        continue

async def get_embedding(text: str, model: str = "nomic-embed-text") -> list:
    payload = {"model": model, "prompt": text}
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            resp = await client.post(f"{OLLAMA_BASE}/api/embeddings", json=payload)
            resp.raise_for_status()
            return resp.json().get("embedding", [])
    except Exception:
        return []

async def list_models() -> list:
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.get(f"{OLLAMA_BASE}/api/tags")
            resp.raise_for_status()
            return [m["name"] for m in resp.json().get("models", [])]
    except Exception:
        return []


async def check_ollama_health() -> dict:
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            resp = await client.get(f"{OLLAMA_BASE}/api/tags")
            resp.raise_for_status()
            models = [m["name"] for m in resp.json().get("models", [])]
            return {"ok": True, "models": models}
    except Exception as e:
        return {"ok": False, "error": str(e), "models": []}