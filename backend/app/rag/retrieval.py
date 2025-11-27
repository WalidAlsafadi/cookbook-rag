from typing import List
from pathlib import Path

from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_core.documents import Document

from app.config import VECTORSTORE_DIR, get_settings

_settings = get_settings()


class VectorStoreNotReadyError(RuntimeError):
    """Raised when the Chroma vector store has not been built yet."""
    pass

def _ensure_vectorstore_ready() -> None:
    """
    Check if the vectorstore directory exists and is non-empty.
    If not, raise a clear error telling the user to run ingestion.
    """
    path = Path(VECTORSTORE_DIR)
    if not path.exists() or not any(path.iterdir()):
        raise VectorStoreNotReadyError(
            "Vector store is empty or missing. "
            "Run `python -m scripts.run_ingest` from the backend/ folder first."
        )

def _get_vectorstore() -> Chroma:
    _ensure_vectorstore_ready()

    embeddings = OpenAIEmbeddings(
        model=_settings.embedding_model,
        api_key=_settings.openai_api_key,
    )

    vectorstore = Chroma(
        embedding_function=embeddings,
        persist_directory=str(VECTORSTORE_DIR),
        collection_name=_settings.chroma_collection,
    )
    return vectorstore


def retrieve_docs(question: str, k: int = 5) -> List[Document]:
    vectorstore = _get_vectorstore()
    retriever = vectorstore.as_retriever(search_kwargs={"k": k})
    docs: List[Document] = retriever.invoke(question)
    return docs

