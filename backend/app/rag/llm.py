from typing import List

from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.documents import Document

from app.config import get_settings

_settings = get_settings()

# LangChain Chat model
_llm = ChatOpenAI(
    model=_settings.chat_model,
    api_key=_settings.openai_api_key,
)


# Prompt template for RAG
_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful cooking assistant that ONLY answers using the provided cookbook context.\n"
            "You must format your answer in clean Markdown.\n"
            "- Use headings\n"
            "- Use bullet points or numbered lists when appropriate\n"
            "- Do NOT invent information not in the cookbook\n"
            "If the answer is not found in the context, say you don't know.",
        ),
        (
            "user",
            "Question: {question}\n\n"
            "Context:\n{context}",
        ),
    ]
)


def generate_answer(question: str, docs: List[Document]) -> str:
    """Use LangChain ChatOpenAI + prompt template to answer from documents."""
    if not docs:
        context_text = "No relevant context found in the cookbook."
    else:
        context_text = "\n\n".join(d.page_content for d in docs)

    chain = _prompt | _llm
    result = chain.invoke({"question": question, "context": context_text})
    return result.content
