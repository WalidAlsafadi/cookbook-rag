from typing import List

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.config import get_settings
from app.rag.retrieval import retrieve_docs, VectorStoreNotReadyError
from app.rag.llm import generate_answer


app = FastAPI(title="Cookbook RAG API (LangChain)")

# CORS (for when you add a frontend)
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "https://cookbook-rag.vercel.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # for dev; later you can tighten this
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class HistoryItem(BaseModel):
    question: str
    answer: str


class AskRequest(BaseModel):
    question: str
    k: int = 5
    history: List[HistoryItem] = []


class AskResponse(BaseModel):
    answer: str


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/ask", response_model=AskResponse)
def ask(req: AskRequest):
    # 1) Check API key
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
        # 2) retrieve relevant docs using LangChain retriever
        docs = retrieve_docs(req.question, k=req.k)

        # Prepare history payload (plain dicts) for the LLM
        history_payload = [
            {"question": h.question, "answer": h.answer}
            for h in req.history
        ]

        # 3) generate answer with LangChain ChatOpenAI, using short history
        answer = generate_answer(
            question=req.question,
            docs=docs,
            history=history_payload,
        )
        return AskResponse(answer=answer)

    except VectorStoreNotReadyError as e:
        # No vector store / empty → tell user to run ingestion
        raise HTTPException(status_code=500, detail=str(e))
