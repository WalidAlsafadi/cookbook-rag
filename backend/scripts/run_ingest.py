import os
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "2"

from app.rag.ingest import run_ingestion

if __name__ == "__main__":
    run_ingestion()
