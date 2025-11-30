from typing import List

import time
import logging

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from app.config import get_settings
from app.rag.retrieval import retrieve_docs, VectorStoreNotReadyError
from app.rag.llm import stream_answer  # <- only streaming

logger = logging.getLogger("uvicorn")

app = FastAPI(title="RecipaAI API (LangChain, streaming)")


# CORS (frontend: local + Vercel)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://recipaai.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HistoryItem(BaseModel):
    question: str
    answer: str


class AskRequest(BaseModel):
    question: str
    k: int = 3
    history: List[HistoryItem] = Field(default_factory=list)


def warmup_vectorstore():
    from app.rag.retrieval import _get_vectorstore  # local import to avoid cycles
    try:
        _get_vectorstore()
    except Exception as e:
        logging.getLogger("uvicorn").warning(
            "Vectorstore warmup failed: %s", e
        )


@app.on_event("startup")
def on_startup():
    warmup_vectorstore()


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/ask")
def ask(req: AskRequest):
    """
    Single streaming endpoint.
    Returns a plain-text stream of tokens as they are generated.
    """
    t0 = time.monotonic()

    settings = get_settings()
    if not settings.openai_api_key:
        raise HTTPException(
            status_code=500,
            detail=(
                "Server misconfigured: OPENAI_API_KEY is not set. "
                "Add it to backend/.env and restart the server."
            ),
        )

    try:
        # Retrieval happens once before streaming
        t1 = time.monotonic()
        docs = retrieve_docs(req.question, k=req.k)
        t2 = time.monotonic()

        history_payload = [
            {"question": h.question, "answer": h.answer}
            for h in req.history
        ]

        def token_generator():
            t_llm_start = time.monotonic()
            for chunk in stream_answer(
                question=req.question,
                docs=docs,
                history=history_payload,
            ):
                yield chunk
            t_llm_end = time.monotonic()

            logger.info(
                "ASK(stream) timings: total=%.2fs, retrieve=%.2fs, llm=%.2fs",
                t_llm_end - t0,
                t2 - t1,
                t_llm_end - t_llm_start,
            )

        # For basic streaming, text/plain is enough.
        # If you want SSE, change to "text/event-stream" and format events.
        return StreamingResponse(token_generator(), media_type="text/plain")

    except VectorStoreNotReadyError as e:
        raise HTTPException(status_code=500, detail=str(e))
