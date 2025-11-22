from pathlib import Path

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma

from app.config import COOKBOOK_PDF, VECTORSTORE_DIR, get_settings

_settings = get_settings()


def load_pdf_docs(path: Path):
    """Use LangChain loader: returns a list of Document objects."""
    loader = PyPDFLoader(str(path))
    docs = loader.load()
    return docs


def split_docs(docs):
    """
    Basic LangChain text splitting.
    Later you can tune chunk_size/chunk_overlap.
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=800,
        chunk_overlap=100,
        separators=["\n\n", "\n", ".", " ", ""],
    )
    return splitter.split_documents(docs)


def build_vectorstore(splits):
    """Create/persist a Chroma vector store using LangChain."""
    embeddings = OpenAIEmbeddings(
        model=_settings.embedding_model,
        api_key=_settings.openai_api_key,
    )

    Chroma.from_documents(
        documents=splits,
        embedding=embeddings,
        persist_directory=str(VECTORSTORE_DIR),
        collection_name=_settings.chroma_collection,
    )


def run_ingestion() -> None:
    """
    Full ingestion pipeline (LangChain version):
    1) Load PDF as Documents
    2) Split into chunks
    3) Build/persist Chroma vectorstore
    """
    print(f"Loading PDF from {COOKBOOK_PDF} ...")
    docs = load_pdf_docs(COOKBOOK_PDF)
    print(f"Loaded {len(docs)} pages as documents.")

    splits = split_docs(docs)
    print(f"Split into {len(splits)} chunks.")

    build_vectorstore(splits)
    print("Ingestion done. Vectorstore persisted.")
