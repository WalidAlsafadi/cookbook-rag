"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  BookOpen,
  Database,
  Sparkles,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Menu,
  X,
  ArrowRight,
  Search,
  Github,
  ArrowUp,
  Linkedin,
  Mail,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

// --- CONSTANTS ---
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const GITHUB_URL = "https://github.com/WalidAlsafadi/recipa-rag-assistant";

const SUGGESTED_QUESTIONS = [
  "What is a cheap meal for a family of 4?",
  "How do I make lentils taste good?",
  "Give me a recipe using only eggs and flour.",
];

const TEAM_MEMBERS = [
  {
    name: "Walid Alsafadi",
    role: "AI Backend Engineer",
    image: "/walid.jpg",
    linkedin: "https://www.linkedin.com/in/walidalsafadi",
    github: "https://github.com/walidalsafadi",
    email: "mailto:walid.k.alsafadi@gmail.com",
  },
  {
    name: "Fares Alnamla",
    role: "QA & DevOps Engineer",
    image: "/fares.jpg",
    linkedin: "https://www.linkedin.com/in/faresalnamla",
    github: "https://github.com/FaresAlnamla",
    email: "mailto:faresalnam@gmail.com",
  },
  {
    name: "Ahmed Alyazuri",
    role: "Frontend Engineer",
    image: "/ahmed.jpg",
    linkedin: "https://www.linkedin.com/in/ahmed-alyazuri",
    github: "https://github.com/AhmedAl-Yazuri",
    email: "mailto:ahmedalyazuri@gmail.com",
  },
];

const SECTIONS = [
  { name: "Home", id: "hero" },
  { name: "Architecture", id: "how-it-works" },
  { name: "AI Assistant", id: "qa-section" },
  { name: "Team", id: "team" },
];

type HistoryEntry = {
  question: string;
  answer: string;
};

export default function Home() {
  const { toast } = useToast();

  // State
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Memoize markdown plugins to prevent re-renders during typing
  const markdownPlugins = useMemo(() => [remarkGfm], []);

  // --- Scroll Logic (Throttled) ---
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          // Update navbar background
          setScrolled(window.scrollY > 50);

          // Update active section spy
          const sectionIds = ["hero", "how-it-works", "qa-section", "team"];
          for (const id of sectionIds) {
            const element = document.getElementById(id);
            if (element) {
              const rect = element.getBoundingClientRect();
              // Adjust offset based on navbar height (~100px)
              if (rect.top <= 150 && rect.bottom >= 150) {
                setActiveSection(id);
                break;
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      // Manually set it immediately for better UX responsiveness
      setActiveSection(id);
    }
  }, []);

  // --- Core Logic ---
  const handleCopy = async () => {
    if (!currentAnswer) return;
    try {
      await navigator.clipboard.writeText(currentAnswer);
      setIsCopied(true);
      toast({
        title: "Copied",
        description: "Recipe saved to clipboard.",
        className: "bg-white border-orange-200 text-orange-900",
      });
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  const handleSubmit = async (e?: React.FormEvent, manualQuestion?: string) => {
    if (e) e.preventDefault();
    const queryText = manualQuestion || question;

    if (!queryText.trim()) {
      setError("Please enter a question");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/ask`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: queryText.trim(),
          k: 5,
          // Send at most the last 3 Q&A pairs
          history: history.slice(-3),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(
          errorData?.detail || `Request failed: ${response.status}`
        );
      }

      const data = await response.json();
      setCurrentAnswer(data.answer);
      setQuestion("");

      setHistory((prev) => {
        const updated = [
          ...prev,
          {
            question: queryText.trim(),
            answer: data.answer,
          },
        ];
        // Keep only last 5 in the UI history
        return updated.slice(-5);
      });

      // Allow DOM to update before scrolling
      setTimeout(() => {
        document
          .getElementById("answer-panel")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Something went wrong.";
      setError(errorMsg);
      toast({ variant: "destructive", title: "Error", description: errorMsg });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-orange-100 selection:text-orange-900 relative overflow-x-hidden">
      {/* --- MOBILE MENU OVERLAY --- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-white/95 backdrop-blur-xl animate-in slide-in-from-right-full duration-300 md:hidden flex flex-col">
          <div className="flex justify-between items-center p-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <span className="font-bold text-xl text-gray-900">
                Recip<span className="text-orange-600">a</span>
              </span>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="Close menu"
            >
              <X className="h-7 w-7" />
            </button>
          </div>
          <div className="flex flex-col p-6 gap-4 overflow-y-auto">
            {SECTIONS.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.id)}
                className={`text-left text-2xl font-bold py-4 border-b border-gray-50 transition-colors ${
                  activeSection === item.id
                    ? "text-orange-600"
                    : "text-gray-800 hover:text-orange-600"
                }`}
              >
                {item.name}
              </button>
            ))}

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 text-left text-2xl font-bold text-gray-800 py-4 border-b border-gray-50 hover:text-orange-600 transition-colors"
            >
              <Github className="h-6 w-6" />
              <span>GitHub Repo</span>
            </a>
          </div>
        </div>
      )}

      {/* --- NAVIGATION BAR --- */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out border-b ${
          scrolled
            ? "bg-white/90 backdrop-blur-xl border-gray-200 shadow-sm py-3" /* CHANGED: White background when scrolled */
            : "bg-transparent border-transparent py-4 md:py-8"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            {/* LEFT: Brand Identity */}
            <div
              className="flex items-center gap-3 cursor-pointer group w-auto md:w-64"
              onClick={() => scrollToSection("hero")}
            >
              <div className="flex flex-col">
                <span
                  className={`font-extrabold text-lg md:text-2xl tracking-tight leading-none drop-shadow-sm transition-colors duration-300 ${
                    scrolled
                      ? "text-slate-900"
                      : "text-white" /* CHANGED: Text turns dark when scrolled */
                  }`}
                >
                  Recipa
                </span>
              </div>
            </div>

            {/* CENTER: Navigation Links (Desktop) */}
            <div className="hidden md:flex items-center justify-center">
              <div
                className={`flex items-center gap-2 p-2 rounded-full border transition-all duration-300 ${
                  scrolled
                    ? "bg-gray-100/80 border-gray-200" /* CHANGED: Light pill background */
                    : "bg-black/20 border-white/10 backdrop-blur-md"
                }`}
              >
                {SECTIONS.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => scrollToSection(item.id)}
                    className={`px-5 py-2 rounded-full text-base font-bold transition-all duration-300 ${
                      activeSection === item.id
                        ? "bg-orange-600 text-white shadow-md"
                        : scrolled
                        ? "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50" /* CHANGED: Darker inactive links */
                        : "text-white/90 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* RIGHT: Actions (Desktop) */}
            <div className="hidden md:flex items-center gap-4 w-64 justify-end">
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border transition-all ${
                  scrolled
                    ? "text-slate-900 border-slate-200 hover:bg-slate-50" /* CHANGED: Dark button for white nav */
                    : "text-white border-white/30 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Github className="h-5 w-5" />
                <span className="font-bold text-sm">GitHub</span>
              </a>
            </div>

            {/* Mobile Menu Trigger */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className={`p-2 rounded-lg transition-colors ${
                  scrolled
                    ? "text-slate-900 hover:bg-slate-100"
                    : "text-white hover:bg-white/20"
                }`}
                aria-label="Open menu"
              >
                <Menu className="h-8 w-8" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section
        id="hero"
        className="relative w-full h-screen flex items-center justify-center bg-cover bg-center px-4"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=2053&auto=format&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-black/50 backdrop-blur-[1px]"></div>

        <div className="relative z-10 text-center max-w-6xl mx-auto flex flex-col items-center">
          <div className="inline-flex items-center gap-2 md:gap-3 mb-6 md:mb-10 px-4 md:px-6 py-2 md:py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/30 text-white text-xs md:text-sm font-bold uppercase tracking-widest shadow-2xl animate-in fade-in zoom-in duration-1000">
            <Sparkles className="h-3 w-3 md:h-4 md:w-4 text-orange-400" />
            <span>AI-Powered Culinary Intelligence</span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-8xl lg:text-9xl font-extrabold text-white mb-6 md:mb-10 tracking-tight leading-tight drop-shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
            Precision <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 to-orange-500">
              Cooking.
            </span>
          </h1>

          <p className="text-lg sm:text-xl md:text-3xl text-gray-100 mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed font-medium drop-shadow-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 px-2">
            A professional tool for exploring{" "}
            <strong className="text-white">The Low-Cost Cookbook</strong> with
            accuracy, speed, and ease.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-12 duration-1000">
            <Button
              onClick={() => scrollToSection("qa-section")}
              size="lg"
              className="bg-orange-600 hover:bg-orange-700 text-white rounded-xl px-8 md:px-12 py-6 md:py-8 text-lg md:text-xl border-2 border-orange-500 shadow-2xl font-bold tracking-wide w-full sm:w-auto"
            >
              Try It Now!
            </Button>
            <Button
              onClick={() => scrollToSection("how-it-works")}
              variant="outline"
              size="lg"
              className="bg-white/10 hover:bg-white/20 text-white border-2 border-white/40 rounded-xl px-8 md:px-12 py-6 md:py-8 text-lg md:text-xl backdrop-blur-sm font-bold tracking-wide w-full sm:w-auto"
            >
              System Architecture
            </Button>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS --- */}
      <section
        id="how-it-works"
        className="py-16 md:py-32 bg-white border-b border-gray-200 relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4 md:mb-6">
              System Architecture
            </h2>
            <div className="w-24 md:w-32 h-2 bg-orange-500 mx-auto mb-6 md:mb-8 rounded-full"></div>
            <p className="text-lg md:text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Leveraging vector embeddings and Large Language Models for precise
              information retrieval.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {[
              {
                icon: BookOpen,
                title: "Ingestion Engine",
                text: "Cookbook PDF is parsed and chunked into semantic segments for deep context understanding.",
              },
              {
                icon: Database,
                title: "Vector Retrieval",
                text: "High-dimensional vector search identifies contextually relevant segments from the knowledge base.",
              },
              {
                icon: Sparkles,
                title: "Generative AI",
                text: "LLM synthesizes retrieved data into structured, actionable, and formatted recipes.",
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="p-6 md:p-10 rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-xl transition-all duration-300 bg-white group"
              >
                <div className="w-12 h-12 md:w-16 md:h-16 bg-white rounded-2xl flex items-center justify-center mb-6 md:mb-8 border border-orange-100 group-hover:bg-orange-600 group-hover:border-orange-600 transition-colors">
                  <item.icon className="h-6 w-6 md:h-8 md:w-8 text-orange-600 group-hover:text-white transition-colors" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">
                  {item.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-base md:text-lg font-medium">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Q&A SECTION --- */}
      <section
        id="qa-section"
        className="py-16 md:py-32 bg-gray-50 border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-16 md:mb-20">
            <span className="text-orange-600 font-bold tracking-widest uppercase text-xs md:text-sm mb-4 block">
              Query Engine
            </span>
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight">
              Ask Recipa
            </h2>
          </div>

          <div className="max-w-5xl mx-auto space-y-10">
            <Card className="border border-gray-200 shadow-xl bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-shadow duration-500">
              <div className="h-3 bg-orange-500 w-full"></div>
              <CardContent className="p-6 md:p-12">
                <form
                  onSubmit={(e) => handleSubmit(e)}
                  className="space-y-6 md:space-y-8"
                >
                  <div className="relative">
                    <Textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Enter ingredients or recipe query..."
                      className="min-h-[160px] md:min-h-[200px] resize-none focus-visible:ring-2 focus-visible:ring-orange-500 focus-visible:border-orange-500 text-lg md:text-2xl p-4 md:p-6 bg-white border-gray-300 rounded-xl placeholder:text-gray-300 text-gray-900 font-medium"
                      disabled={isLoading}
                    />
                    <div className="absolute bottom-4 right-4 p-2 md:p-2.5 bg-gray-50 rounded-lg border border-gray-200 text-gray-400 hidden sm:block">
                      <Search className="h-5 w-5 md:h-6 md:w-6" />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 md:gap-3">
                    {SUGGESTED_QUESTIONS.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          setQuestion(suggestion);
                          handleSubmit(undefined, suggestion);
                        }}
                        className="text-xs md:text-sm font-bold bg-gray-50 text-gray-600 px-3 md:px-5 py-2 md:py-2.5 rounded-lg border border-gray-200 hover:border-orange-400 hover:text-orange-700 hover:bg-white transition-all shadow-sm"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>

                  {error && (
                    <Alert
                      variant="destructive"
                      className="rounded-xl border-red-200 bg-red-50"
                    >
                      <AlertCircle className="h-5 w-5" />
                      <AlertDescription className="text-base font-medium">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || !question.trim()}
                    className="w-full bg-gray-900 hover:bg-black text-white h-16 md:h-20 rounded-xl shadow-lg transition-all font-bold tracking-wide text-xl md:text-2xl border border-gray-800 hover:shadow-orange-900/20"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-3 h-6 w-6 md:h-7 md:w-7 animate-spin text-orange-500" />
                        Processing Request...
                      </>
                    ) : (
                      <>
                        Generate Recipe
                        <ArrowRight className="ml-3 h-6 w-6 md:h-7 md:w-7 text-orange-500" />
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {currentAnswer && (
              <Card
                id="answer-panel"
                className="border border-gray-200 shadow-lg bg-white rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 ring-1 ring-black/5"
              >
                <CardHeader className="bg-gray-50 border-b border-gray-200 py-4 md:py-6 px-6 md:px-10 flex flex-row justify-between items-center">
                  <div className="flex items-center gap-3 md:gap-4">
                    <div className="bg-white p-1.5 md:p-2 rounded-lg border border-gray-200 shadow-sm">
                      <div className="relative h-6 w-6 md:h-8 md:w-8 rounded-md overflow-hidden">
                        <Image
                          src="/recipa-logo.png"
                          alt="Logo"
                          fill
                          className="object-cover"
                        />
                      </div>
                    </div>
                    <CardTitle className="text-lg md:text-2xl text-gray-900 font-bold">
                      Generated Result
                    </CardTitle>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="text-slate-600 hover:text-orange-700 border-slate-300 bg-white h-9 md:h-10 px-3 md:px-5 text-xs md:text-sm uppercase tracking-wide font-bold"
                  >
                    {isCopied ? (
                      <Check className="h-4 w-4 mr-1.5 md:mr-2" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1.5 md:mr-2" />
                    )}
                    {isCopied ? "Saved" : "Copy"}
                  </Button>
                </CardHeader>
                <CardContent className="p-6 md:p-14">
                  <div
                    className="prose prose-lg md:prose-xl prose-slate max-w-none 
                    prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-gray-900 
                    prose-p:leading-8 prose-p:text-slate-700
                    prose-li:text-slate-700 prose-strong:text-orange-700"
                  >
                    <ReactMarkdown remarkPlugins={markdownPlugins}>
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
      <section
        id="team"
        className="py-16 md:py-32 bg-white relative overflow-hidden"
      >
        <div
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#000 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        ></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
          <div className="text-center mb-16 md:mb-24">
            <h2 className="text-4xl md:text-6xl font-extrabold text-gray-900 tracking-tight mb-4">
              Engineering Team
            </h2>
            <div className="w-24 h-1.5 bg-orange-500 mx-auto"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {TEAM_MEMBERS.map((member) => (
              <div
                key={member.name}
                className="group bg-white p-8 md:p-10 rounded-2xl border border-gray-200 hover:border-orange-300 hover:shadow-2xl transition-all duration-300 text-center relative overflow-hidden flex flex-col items-center"
              >
                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-orange-500 to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>

                <div className="relative w-32 h-32 md:w-40 md:h-40 mb-6">
                  <div className="absolute inset-0 rounded-full bg-white border-4 border-white shadow-lg overflow-hidden group-hover:border-orange-100 transition-colors">
                    <Image
                      src={member.image}
                      alt={member.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>

                <div className="mt-2">
                  <h3 className="font-bold text-gray-900 text-xl md:text-2xl mb-2 tracking-tight">
                    {member.name}
                  </h3>
                  <p className="text-orange-600 text-xs md:text-sm uppercase tracking-widest font-bold mb-6">
                    {member.role}
                  </p>
                </div>

                <div className="flex gap-4 mt-auto">
                  <a
                    href={member.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-[#0077b5] transition-all border border-gray-100 hover:border-[#0077b5]"
                    aria-label={`${member.name} LinkedIn`}
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                  <a
                    href={member.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-[#333] transition-all border border-gray-100 hover:border-[#333]"
                    aria-label={`${member.name} GitHub`}
                  >
                    <Github className="h-5 w-5" />
                  </a>
                  <a
                    href={member.email}
                    className="p-2 rounded-full text-gray-400 hover:text-white hover:bg-orange-500 transition-all border border-gray-100 hover:border-orange-500"
                    aria-label={`Email ${member.name}`}
                  >
                    <Mail className="h-5 w-5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-gray-200 py-12 md:py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center mb-6">
            {/* CHANGED: Footer brand text to dark */}
            <span className="text-2xl font-bold text-slate-900 tracking-tight">
              Recipa
            </span>
          </div>
          {/* CHANGED: Footer description text to dark gray */}
          <p className="text-slate-500 text-sm md:text-base max-w-lg mx-auto mb-10 leading-relaxed font-medium">
            A professional RAG demonstration built with precision engineering
            and culinary passion.
          </p>

          <button
            onClick={() => scrollToSection("hero")}
            // CHANGED: Footer button background to light gray
            className="mb-8 p-3 bg-gray-100 rounded-full text-slate-500 hover:bg-orange-600 hover:text-white transition-colors inline-block shadow-sm"
            aria-label="Scroll to top"
          >
            <ArrowUp className="h-5 w-5" />
          </button>

          <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">
            &copy; 2025 Recipa. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
