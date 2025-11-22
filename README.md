# Cookbook RAG Assistant

**Ask questions about _The Low-Cost Cookbook_ using a LangChain + Chroma RAG backend.**

This project provides a simple, clean, production-friendly backend demonstrating Retrieval-Augmented Generation (RAG) using:

- **FastAPI** — API layer
- **LangChain** — document loading, chunking, embeddings, retriever, and LLM chain
- **ChromaDB** — persistent local vector store
- **OpenAI models** — embedding + answer generation
- **Python 3.10+**

It is designed as a **portfolio-quality backend engineering example** that shows how to build, run, and query a real RAG pipeline end‑to‑end.

## 🚀 Features

- Ingests cookbook PDF → chunks → embeds → stores into Chroma
- Answers questions strictly from the book
- Markdown‑formatted responses
- Clear error handling (missing API key, missing vectorstore)
- CORS enabled for frontend integration
- Clean file structure for learning and reuse

## 📁 Project Structure

```
cookbook-rag/
├── backend/
│   ├── app/
│   │   ├── main.py                # FastAPI API (health + /ask)
│   │   ├── config.py              # Models, paths, env loader
│   │   └── rag/
│   │       ├── ingest.py          # Load → chunk → embed → save vectorstore
│       ├── retrieval.py       # Retrieve relevant chunks using LangChain
│       └── llm.py               # Markdown LLM answer generator
│
│   ├── data/
│   │   └── source/
│   │       └── COOKBOOK.pdf       # Original cookbook file
│   ├── vectorstore/               # Auto-created Chroma directory
│   ├── scripts/
│   │   └── run_ingest.py          # CLI: python -m scripts.run_ingest
│   ├── requirements.txt
│   └── .env.example               # Template env file
│
└── frontend/                      # (optional) UI can be added later
```

## 🔧 Installation & Setup

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/cookbook-rag.git
cd cookbook-rag/backend
```

### 2. Create virtual environment

```bash
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Create `.env` file

Create `backend/.env`:

```
OPENAI_API_KEY=your_api_key_here
```

(See `.env.example` for variable names.)

### 5. Run ingestion (build vectorstore)

```bash
python -m scripts.run_ingest
```

If successful, it will print:

```
Loaded N pages as documents.
Split into M chunks.
Ingestion done. Vectorstore persisted.
```

### 6. Start the server

```bash
uvicorn app.main:app --reload
```

## 📡 API Usage

### Health-check

```bash
GET http://127.0.0.1:8000/health
```

Response:

```json
{ "status": "ok" }
```

### Ask a question

```bash
POST http://127.0.0.1:8000/ask
Content-Type: application/json

{
  "question": "How do I make the chocolate mug cake?",
  "k": 5
}
```

Response (Markdown inside JSON):

```json
{
  "answer": "## Chocolate Mug Cake\n\n1. ..."
}
```

You can render Markdown on your frontend.

## 👥 Members

- **Walid Alsafadi**
- **Fares Alnamla**
- **Ahmed Alyazuri**

## ✅ Status

Backend MVP: **Complete and functional.**  
Ready for frontend integration or deployment.
