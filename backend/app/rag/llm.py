from typing import List, Optional, Dict, Any

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

# Prompt template for RAG with short conversation history
_prompt = ChatPromptTemplate.from_messages(
    [
        (
            "system",
            "You are a helpful cooking assistant for the book 'The Low-Cost Cookbook'. "
            "You ONLY answer using the provided cookbook context.\n\n"
            "Conversation rules:\n"
            "- Each request you see may include up to a few previous Q&A pairs as history, "
            "  but you do NOT have long-term memory beyond what is shown.\n"
            "- Use the history to resolve references like 'the first one', 'that recipe', "
            "  'it', 'that one', or 'the previous one'.\n"
            "- If the reference is still ambiguous, explicitly ask the user to repeat the "
            "  recipe name or question instead of guessing.\n\n"
            "Answer style rules:\n"
            "- Default to concise answers (2–5 short sentences or a short bullet list).\n"
            "- Only give full step-by-step recipe instructions or complete ingredient lists "
            "  when the user clearly asks for a recipe or says things like 'how do I make…', "
            "  'give me the recipe', or 'step by step'.\n"
            "- If the user just greets you (e.g. 'hi', 'hello') or asks something very vague, "
            "  reply with one very short line and invite them to ask a specific question about "
            "  the cookbook. Do NOT output any recipe details in that case.\n"
            "- Do NOT invent information that is not in the provided context.\n"
            "- If the answer is not found in the context, say you don't know.\n"
            "- Format all answers in clean Markdown and use headings and bullet/numbered lists "
            "  only when they are genuinely helpful.",
        ),
        (
            "user",
            "Conversation history (most recent last):\n{history}\n\n"
            "User question: {question}\n\n"
            "Context:\n{context}",
        ),
    ]
)


def _build_history_text(history: Optional[List[Dict[str, Any]]]) -> str:
    """
    Convert a list of {question, answer} dicts into a short text block.
    Uses at most the last 3 pairs. If there is no usable history, returns
    a short placeholder sentence.
    """
    if not history:
        return "No previous conversation."

    # Take at most the last 3 entries (even if frontend already trimmed)
    recent = history[-3:]
    lines: List[str] = []

    for entry in recent:
        q = str(entry.get("question", "")).strip()
        a = str(entry.get("answer", "")).strip()
        if not q and not a:
            continue
        lines.append(f"Q: {q}\nA: {a}")

    if not lines:
        return "No previous conversation."

    return "\n\n".join(lines)


def generate_answer(
    question: str,
    docs: List[Document],
    history: Optional[List[Dict[str, Any]]] = None,
) -> str:
    """
    Use LangChain ChatOpenAI + prompt template to answer from documents,
    optionally using a short conversation history (for references like
    'the first one').
    """
    if not docs:
        context_text = "No relevant context found in the cookbook."
    else:
        context_text = "\n\n".join(d.page_content for d in docs)

    history_text = _build_history_text(history)

    chain = _prompt | _llm
    result = chain.invoke(
        {
            "question": question,
            "context": context_text,
            "history": history_text,
        }
    )
    return result.content
