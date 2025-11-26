'use client';

import { useState, useEffect } from 'react';
import { BookOpen, Database, Sparkles, Send, Loader2, AlertCircle, Copy, Check, Menu, X, ChefHat, Users, ArrowRight, Star, Search, Github, ArrowUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const SUGGESTED_QUESTIONS = [
  "What is a cheap meal for a family of 4?",
  "How do I make lentils taste good?",
  "Give me a recipe using only eggs and flour.",
  "What are good substitutes for butter?"
];

export default function Home() {
  const { toast } = useToast();
  const [question, setQuestion] = useState('');
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isCopied, setIsCopied] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // --- Scroll Logic ---
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false); // Close mobile menu if open
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  // --- Core Logic ---
  const handleCopy = () => {
    if (!currentAnswer) return;
    navigator.clipboard.writeText(currentAnswer);
    setIsCopied(true);
    toast({
      title: "Copied",
      description: "Recipe saved to clipboard.",
      className: "bg-white border-orange-200 text-orange-900"
    });
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSubmit = async (e?: React.FormEvent, manualQuestion?: string) => {
    if (e) e.preventDefault();
    const queryText = manualQuestion || question;

    if (!queryText.trim()) {
      setError('Please enter a question');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: queryText.trim(), k: 5 }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.detail || `Request failed: ${response.status}`);
      }

      const data = await response.json();
      setCurrentAnswer(data.answer);
      setQuestion('');
      
      setTimeout(() => {
        document.getElementById('answer-panel')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);

    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(errorMsg);
      toast({ variant: "destructive", title: "Error", description: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-900 relative">
      
      {/* --- 1. MOBILE MENU OVERLAY (New Feature) --- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-white animate-in slide-in-from-right-full duration-300 md:hidden flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <div className="flex items-center gap-2">
                <ChefHat className="h-8 w-8 text-orange-600" />
                <span className="font-bold text-2xl text-gray-900">Cookbook<span className="text-orange-600">AI</span></span>
            </div>
            <button onClick={() => setMobileMenuOpen(false)} className="p-2 text-gray-500 hover:bg-gray-100 rounded-full">
                <X className="h-8 w-8" />
            </button>
          </div>
          <div className="flex flex-col p-8 gap-6">
            {[
                { name: 'Home', id: 'hero' },
                { name: 'Architecture', id: 'how-it-works' },
                { name: 'Kitchen', id: 'qa-section' },
                { name: 'Team', id: 'team' }
            ].map((item) => (
                <button
                    key={item.name}
                    onClick={() => scrollToSection(item.id)}
                    className="text-left text-3xl font-bold text-gray-800 py-4 border-b border-gray-50 hover:text-orange-600 transition-colors"
                >
                    {item.name}
                </button>
            ))}
            <Button 
                onClick={() => scrollToSection('qa-section')}
                className="mt-8 bg-orange-600 hover:bg-orange-700 text-white h-16 text-xl font-bold w-full rounded-xl shadow-lg"
            >
                Start Cooking
            </Button>
          </div>
        </div>
      )}

      {/* --- NAVIGATION BAR --- */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-b ${
          scrolled 
            ? 'bg-white/95 backdrop-blur-xl border-gray-200 py-4 shadow-sm' 
            : 'bg-transparent border-transparent py-8'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center">
            
            {/* LEFT: Brand */}
            <div 
              className="flex items-center gap-4 cursor-pointer group w-64" 
              onClick={() => scrollToSection('hero')}
            >
              <div className={`p-3 rounded-xl border transition-all duration-300 shadow-sm ${
                scrolled 
                  ? 'bg-orange-50 border-orange-100' 
                  : 'bg-white/20 border-white/30 backdrop-blur-md'
              }`}>
                <ChefHat className={`h-8 w-8 ${scrolled ? 'text-orange-600' : 'text-white'}`} />
              </div>
              <div className="flex flex-col">
                <span className={`font-extrabold text-2xl tracking-tight leading-none transition-colors ${
                  scrolled ? 'text-gray-900' : 'text-white drop-shadow-md'
                }`}>
                  Cookbook<span className={`${scrolled ? 'text-orange-600' : 'text-orange-400'}`}>AI</span>
                </span>
                <span className={`text-xs uppercase tracking-widest font-bold mt-1 transition-colors ${
                  scrolled ? 'text-gray-500 group-hover:text-orange-500' : 'text-orange-100'
                }`}>
                  Pro Edition
                </span>
              </div>
            </div>

            {/* CENTER: Desktop Nav */}
            <div className="hidden md:flex items-center justify-center">
              <div className={`flex items-center gap-2 p-2 rounded-full border transition-all duration-300 ${
                scrolled ? 'bg-gray-50/80 border-gray-200' : 'bg-black/20 border-white/10 backdrop-blur-md'
              }`}>
                {[
                  { name: 'Home', id: 'hero' },
                  { name: 'Architecture', id: 'how-it-works' },
                  { name: 'Kitchen', id: 'qa-section' },
                  { name: 'Team', id: 'team' }
                ].map((item) => (
                  <button
                    key={item.name}
                    onClick={() => scrollToSection(item.id)}
                    className={`px-6 py-2.5 rounded-full text-lg font-bold transition-all duration-300 ${
                      activeSection === item.id 
                        ? 'bg-orange-500 text-white shadow-lg' 
                        : scrolled
                          ? 'text-gray-600 hover:text-gray-900 hover:bg-white'
                          : 'text-white/90 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>
            
            {/* RIGHT: Actions */}
            <div className="hidden md:flex items-center gap-5 w-64 justify-end">
              <button className={`transition-colors ${scrolled ? 'text-gray-500 hover:text-gray-900' : 'text-white/80 hover:text-white'}`}>
                <Github className="h-7 w-7" />
              </button>
              <Button 
                onClick={() => scrollToSection('qa-section')}
                className={`rounded-full px-8 h-12 font-bold text-base shadow-xl transition-transform hover:-translate-y-0.5 active:translate-y-0 ${
                    scrolled 
                    ? 'bg-gray-900 hover:bg-black text-white' 
                    : 'bg-white text-orange-600 hover:bg-orange-50'
                }`}
              >
                Start Cooking
              </Button>
            </div>

            {/* Mobile Menu Trigger (Now Functional) */}
            <div className="md:hidden">
                <button 
                    onClick={() => setMobileMenuOpen(true)} 
                    className={`p-2 rounded-lg transition-colors ${scrolled ? 'text-gray-900 hover:bg-gray-100' : 'text-white hover:bg-white/20'}`}
                >
                    <Menu className="h-9 w-9" />
                </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section 
        id="hero" 
        className="relative w-full h-screen flex items-center justify-center bg-cover bg-center"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop')"
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>
        
        <div className="relative z-10 text-center px-4 max-w-6xl mx-auto flex flex-col items-center">
          
          <div className="inline-flex items-center gap-3 mb-10 px-6 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white text-sm font-bold uppercase tracking-widest shadow-2xl animate-in fade-in zoom-in duration-1000">
             <Sparkles className="h-4 w-4 text-orange-400" />
             <span>AI-Powered Culinary Intelligence</span>
          </div>
          
          <h1 className="text-7xl md:text-9xl font-extrabold text-white mb-10 tracking-tight leading-none drop-shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Precision <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-orange-500">Cooking.</span>
          </h1>
          
          <p className="text-2xl md:text-3xl text-gray-100 mb-12 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000">
            A professional tool for exploring <strong className="text-white">The Low-Cost Cookbook</strong> with accuracy, speed, and ease.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <Button
              onClick={() => scrollToSection('qa-section')}
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-12 py-8 text-xl border-2 border-orange-500 shadow-2xl font-bold tracking-wide"
            >
              Start Search
            </Button>
            <Button
              onClick={() => scrollToSection('how-it-works')}
              variant="outline"
              size="lg"
              className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/40 rounded-xl px-12 py-8 text-xl backdrop-blur-sm font-bold tracking-wide"
            >
              System Architecture
            </Button>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section id="how-it-works" className="py-32 bg-white border-b border-gray-200 relative overflow-hidden">
        {/* 2. SUBTLE BACKGROUND TEXTURE (New Feature) */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-6">
              System Architecture
            </h2>
            <div className="w-32 h-2 bg-orange-500 mx-auto mb-8 rounded-full"></div>
            <p className="text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Leveraging vector embeddings and Large Language Models for precise information retrieval.
            </p>
          </div>

          <div className="flex justify-center mb-24">
            <div className="p-4 border border-gray-100 rounded-3xl shadow-lg bg-white ring-1 ring-black/5 hover:shadow-2xl transition-shadow duration-500">
               



            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {[
              { 
                icon: BookOpen, 
                title: "Ingestion Engine", 
                text: "Cookbook PDF is parsed and chunked into semantic segments for deep context understanding." 
              },
              { 
                icon: Database, 
                title: "Vector Retrieval", 
                text: "High-dimensional vector search identifies contextually relevant segments from the knowledge base." 
              },
              { 
                icon: Sparkles, 
                title: "Generative AI", 
                text: "LLM synthesizes retrieved data into structured, actionable, and formatted recipes." 
              }
            ].map((item, idx) => (
              <div key={idx} className="p-10 rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-xl transition-all duration-300 bg-white group">
                <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mb-8 border border-orange-100 group-hover:bg-orange-600 group-hover:border-orange-600 transition-colors">
                  <item.icon className="h-8 w-8 text-orange-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{item.title}</h3>
                <p className="text-slate-600 leading-relaxed text-lg font-medium">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Q&A SECTION --- */}
      <section id="qa-section" className="py-32 bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
          <div className="text-center mb-20">
            <span className="text-orange-600 font-bold tracking-widest uppercase text-sm mb-4 block">Query Engine</span>
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight">Ask The Chef</h2>
          </div>

          <div className="max-w-5xl mx-auto space-y-10">
            <Card className="border border-gray-200 shadow-xl bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow duration-500">
              <div className="h-3 bg-orange-500 w-full"></div>
              <CardContent className="p-10 md:p-12">
                <form onSubmit={(e) => handleSubmit(e)} className="space-y-8">
                  <div className="relative">
                    <Textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter ingredients or recipe query..."
                      className="min-h-[200px] resize-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 text-xl md:text-2xl p-6 bg-white border-gray-300 rounded-xl placeholder:text-gray-300 text-gray-900 font-medium"
                      disabled={isLoading}
                    />
                    <div className="absolute bottom-4 right-4 p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-gray-400">
                        <Search className="h-6 w-6" />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3">
                      {SUGGESTED_QUESTIONS.map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                              setQuestion(suggestion);
                              handleSubmit(undefined, suggestion);
                          }}
                          className="text-sm font-bold bg-gray-50 text-gray-600 px-5 py-2.5 rounded-lg border border-gray-200 hover:border-orange-400 hover:text-orange-700 hover:bg-white transition-all shadow-sm"
                        >
                          {suggestion}
                        </button>
                      ))}
                  </div>

                  {error && (
                    <Alert variant="destructive" className="rounded-xl border-red-200 bg-red-50">
                      <AlertCircle className="h-5 w-5" />
                      <AlertDescription className="text-base font-medium">{error}</AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || !question.trim()}
                    className="w-full bg-gray-900 hover:bg-black text-white h-20 rounded-xl shadow-lg transition-all font-bold tracking-wide text-2xl border border-gray-800 hover:shadow-orange-900/20"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-3 h-7 w-7 animate-spin text-orange-500" />
                        Processing Request...
                      </>
                    ) : (
                      <>
                        Generate Recipe
                        <ArrowRight className="ml-3 h-7 w-7 text-orange-500" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {currentAnswer && (
              <Card id="answer-panel" className="border border-gray-200 shadow-lg bg-white rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 ring-1 ring-black/5">
                <CardHeader className="bg-gray-50 border-b border-gray-200 py-6 px-10 flex flex-row justify-between items-center">
                  <div className="flex items-center gap-4">
                      <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm">
                        <ChefHat className="h-6 w-6 text-orange-600" />
                      </div>
                      <CardTitle className="text-2xl text-gray-900 font-bold">Generated Result</CardTitle>
                  </div>
                  <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleCopy} 
                      className="text-slate-600 hover:text-orange-700 border-slate-300 bg-white h-10 px-5 text-sm uppercase tracking-wide font-bold"
                  >
                      {isCopied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
                      {isCopied ? 'Saved' : 'Copy'}
                  </Button>
                </CardHeader>
                <CardContent className="p-10 md:p-14">
                  <div className="prose prose-xl prose-slate max-w-none 
                    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 
                    prose-p:leading-8 prose-p:text-slate-700
                    prose-li:text-slate-700 prose-strong:text-orange-700">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {currentAnswer}
                    </ReactMarkdown>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </section>

      {/* --- TEAM SECTION --- */}
      <section id="team" className="py-32 bg-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full relative z-10">
          <div className="text-center mb-24">
            <h2 className="text-5xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">Engineering Team</h2>
            <div className="w-24 h-1.5 bg-orange-500 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { name: 'Walid Alsafadi', initial: 'W', role: 'Full Stack Engineer' },
              { name: 'Fares Alnamla', initial: 'F', role: 'AI Specialist' },
              { name: 'Ahmed Alyazuri', initial: 'A', role: 'Backend Engineer' }
            ].map((member) => (
              <div key={member.name} className="group bg-white p-12 rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-xl transition-all duration-300 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
                
                <div className="w-24 h-24 bg-gray-50 rounded-full mx-auto mb-8 flex items-center justify-center border border-gray-200 group-hover:border-orange-200 group-hover:bg-orange-50 transition-colors shadow-inner">
                  <span className="text-3xl font-extrabold text-gray-400 group-hover:text-orange-600">{member.initial}</span>
                </div>
                <h3 className="font-bold text-gray-900 text-2xl mb-2 tracking-tight">{member.name}</h3>
                <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">{member.role}</p>
                
                <div className="mt-6 flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                    {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className="h-4 w-4 text-orange-400 fill-orange-400" />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center mb-6">
            <BookOpen className="h-8 w-8 text-orange-600 mr-3" />
            <span className="text-2xl font-bold text-gray-900 tracking-tight">Cookbook<span className="text-orange-600">AI</span></span>
          </div>
          <p className="text-slate-500 text-base max-w-lg mx-auto mb-10 leading-relaxed font-medium">
            A professional RAG demonstration built with precision engineering and culinary passion.
          </p>
          
          {/* 3. SCROLL TO TOP BUTTON (New Feature) */}
          <button 
            onClick={() => scrollToSection('hero')}
            className="mb-8 p-3 bg-gray-100 rounded-full hover:bg-orange-100 hover:text-orange-600 transition-colors inline-block"
          >
            <ArrowUp className="h-5 w-5" />
          </button>

          <div className="text-xs text-gray-400 font-bold uppercase tracking-widest">
            &copy; 2025 Cookbook AI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}