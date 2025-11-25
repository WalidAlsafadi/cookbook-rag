'use client';

import { useState } from 'react';
import { BookOpen, Database, Sparkles, Send, Loader2, AlertCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface QAPair {
  id: string;
  question: string;
  answer: string;
  timestamp: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function Home() {
  const [question, setQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [history, setHistory] = useState<QAPair[]>([]);

  const scrollToQA = () => {
    document.getElementById('qa-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setIsLoading(true);
    setError('');
    setCurrentAnswer('');

    try {
      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: question.trim(),
          k: 5,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Request failed with status ${response.status}`);
      }

      const data = await response.json();

      setCurrentAnswer(data.answer);
      setCurrentQuestion(question);

      const newQAPair: QAPair = {
        id: Date.now().toString(),
        question: question.trim(),
        answer: data.answer,
        timestamp: Date.now(),
      };

      setHistory((prev) => [newQAPair, ...prev.slice(0, 4)]);
      setQuestion('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const showHistoryAnswer = (pair: QAPair) => {
    setCurrentQuestion(pair.question);
    setCurrentAnswer(pair.answer);
    document.getElementById('answer-panel')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4">
            <BookOpen className="h-12 w-12 text-amber-700" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Cookbook RAG Assistant
          </h1>
          <p className="text-xl text-amber-800 mb-4 max-w-2xl mx-auto">
            Ask questions about The Low-Cost Cookbook using a LangChain + Chroma RAG backend
          </p>
          <p className="text-gray-600 mb-8 max-w-3xl mx-auto">
            This application uses Retrieval-Augmented Generation (RAG) with LangChain, Chroma vector database,
            FastAPI, and OpenAI to answer questions grounded in a cookbook PDF. Get accurate, contextual answers
            backed by real cookbook content.
          </p>
          <Button
            onClick={scrollToQA}
            size="lg"
            className="bg-amber-700 hover:bg-amber-800 text-white"
          >
            Start Asking
          </Button>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-amber-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <BookOpen className="h-6 w-6 text-amber-700" />
                  </div>
                  <CardTitle>1. Ingest</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  The cookbook PDF is split into chunks and embedded using OpenAI embeddings,
                  creating a searchable knowledge base.
                </p>
              </CardContent>
            </Card>

            <Card className="border-amber-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <Database className="h-6 w-6 text-amber-700" />
                  </div>
                  <CardTitle>2. Retrieve</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  When you ask a question, ChromaDB finds the most relevant chunks
                  from the cookbook using semantic search.
                </p>
              </CardContent>
            </Card>

            <Card className="border-amber-200">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-100 rounded-lg">
                    <Sparkles className="h-6 w-6 text-amber-700" />
                  </div>
                  <CardTitle>3. Answer</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  The LLM generates a comprehensive Markdown answer grounded in
                  the retrieved content, ensuring accuracy.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="qa-section" className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Ask Your Question
          </h2>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-amber-200">
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <Textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="What are some budget-friendly recipes for breakfast? (Press Enter to submit, Shift+Enter for new line)"
                        className="min-h-[100px] resize-none focus-visible:ring-amber-500"
                        disabled={isLoading}
                      />
                    </div>

                    {error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <Button
                      type="submit"
                      disabled={isLoading || !question.trim()}
                      className="w-full bg-amber-700 hover:bg-amber-800"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Searching cookbook...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Ask Question
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {currentAnswer && (
                <Card id="answer-panel" className="border-amber-200">
                  <CardHeader>
                    <CardTitle className="text-lg">Question:</CardTitle>
                    <p className="text-gray-700 font-normal">{currentQuestion}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="prose prose-amber max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {currentAnswer}
                      </ReactMarkdown>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <div className="lg:col-span-1">
              <Card className="border-amber-200 sticky top-4">
                <CardHeader>
                  <CardTitle>Recent Questions</CardTitle>
                  <p className="text-sm text-gray-600 font-normal">
                    Last 5 questions asked
                  </p>
                </CardHeader>
                <CardContent>
                  {history.length === 0 ? (
                    <p className="text-sm text-gray-500 text-center py-8">
                      No questions yet. Start by asking something about the cookbook!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {history.map((pair) => (
                        <button
                          key={pair.id}
                          onClick={() => showHistoryAnswer(pair)}
                          className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-amber-300 hover:bg-amber-50 transition-colors"
                        >
                          <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                            {pair.question}
                          </p>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {pair.answer.substring(0, 100)}...
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Team
          </h2>
          <div className="max-w-3xl mx-auto">
            <Card className="border-amber-200">
              <CardContent className="pt-6">
                <p className="text-center text-gray-600 mb-6">Project Contributors</p>
                <div className="grid md:grid-cols-3 gap-6 text-center">
                  <div>
                    <div className="w-16 h-16 bg-amber-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-2xl font-bold text-amber-700">W</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">Walid Alsafadi</h3>
                    <p className="text-sm text-gray-600">Developer</p>
                  </div>
                  <div>
                    <div className="w-16 h-16 bg-amber-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-2xl font-bold text-amber-700">F</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">Fares Alnamla</h3>
                    <p className="text-sm text-gray-600">Developer</p>
                  </div>
                  <div>
                    <div className="w-16 h-16 bg-amber-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                      <span className="text-2xl font-bold text-amber-700">A</span>
                    </div>
                    <h3 className="font-semibold text-gray-900">Ahmed Alyazuri</h3>
                    <p className="text-sm text-gray-600">Developer</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <footer className="text-center py-8 border-t border-amber-200">
          <p className="text-gray-600 mb-2">
            Built with FastAPI, LangChain, Chroma, and OpenAI
          </p>
          <p className="text-sm text-gray-500">
            <a href="#" className="hover:text-amber-700 transition-colors">
              View on GitHub
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
}
