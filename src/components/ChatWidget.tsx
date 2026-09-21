import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react'
import { GoogleGenAI, type Chat } from '@google/genai'
import { X, Send, Bot, User, Loader2, Sparkles, RefreshCw } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ChatMessage {
  id: string
  role: 'user' | 'bot'
  text: string
}

/* ------------------------------------------------------------------ */
/*  Gemini Client (singleton)                                          */
/* ------------------------------------------------------------------ */

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY ?? ''

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY })

const SYSTEM_INSTRUCTION = `You are SmosBot, a friendly, smart, and helpful AI assistant for the Cinema. 
You help users with:
- Movie information (synopsis, cast, ratings, showtimes)
- Booking assistance and seat selection
- Cinema locations and facilities
- Promotions and membership programs
- Food & beverage menu
- General cinema related questions

Rules:
1. Always be polite, concise, and helpful.
2. Language switching: If the user types "/en", respond exclusively in English. If the user types "/kh", respond exclusively in Khmer. Otherwise, respond in whichever language the user writes in.
3. If you don't know the answer, politely say so and suggest the user contact support.
4. Keep responses short and easy to read.
5. Use emojis sparingly to keep a fun cinema vibe 🎬.`

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ChatWidget() {
  /* ---- state ---- */
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'bot',
      text: "Hi there! 🤖 I'm SmosBot, your cinema assistant. How can I help you today?\n\nសួស្តី! ខ្ញុំជា SmosBot ជំនួយការរោងភាពយន្តរបស់អ្នក។ តើខ្ញុំអាចជួយអ្នកដោយរបៀបណា?",
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  /* ---- refs ---- */
  const chatRef = useRef<Chat | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /* ---- initialise / reset chat session ---- */
  const initChat = useCallback(() => {
    try {
      chatRef.current = ai.chats.create({
        model: 'gemini-3.6-flash',
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
        },
      })
    } catch (err) {
      console.error('[SmosBot] Init Chat Error:', err)
    }
  }, [])

  // Create the chat session on first mount
  useEffect(() => {
    initChat()
  }, [initChat])

  /* ---- auto-scroll to bottom ---- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  /* ---- focus input when opened ---- */
  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => inputRef.current?.focus(), 150)
      return () => clearTimeout(t)
    }
  }, [isOpen])

  /* ---- reset conversation ---- */
  const handleReset = () => {
    initChat()
    setMessages([
      {
        id: 'welcome',
        role: 'bot',
        text: "Hi there! 🤖 I'm SmosBot, your cinema assistant. How can I help you today?\n\nសួស្តី! ខ្ញុំជា SmosBot ជំនួយការរោងភាពយន្តរបស់អ្នក។ តើខ្ញុំអាចជួយអ្នកដោយរបៀបណា?",
      },
    ])
  }

  /* ---- send message ---- */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed || isLoading) return

    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
    }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setIsLoading(true)

    try {
      if (!chatRef.current) initChat()

      let response
      try {
        response = await chatRef.current!.sendMessage({ message: trimmed })
      } catch (firstErr) {
        console.warn('[SmosBot] Session retry with gemini-3.6-flash...', firstErr)
        chatRef.current = ai.chats.create({
          model: 'gemini-3.6-flash',
          config: { systemInstruction: SYSTEM_INSTRUCTION },
        })
        response = await chatRef.current.sendMessage({ message: trimmed })
      }

      const botText = response.text ?? "Sorry, I couldn't generate a response."

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        text: botText,
      }
      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      console.error('[SmosBot] Error:', err)
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'bot',
        text: 'Oops! Something went wrong. Please try again later. 😔',
      }
      setMessages((prev) => [...prev, errorMsg])
    } finally {
      setIsLoading(false)
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Render                                                           */
  /* ---------------------------------------------------------------- */

  if (!GEMINI_API_KEY) return null // hide widget when no API key

  return (
    <>
      {/* ---------- Chat Window ---------- */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[375px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white/95 text-slate-900 shadow-2xl shadow-slate-900/15 backdrop-blur-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 dark:border-gray-700/80 dark:bg-gray-900/95 dark:text-gray-100 dark:shadow-black/60 sm:w-[410px]">
          
          {/* ---- Header ---- */}
          <div className="flex items-center justify-between bg-gradient-to-r from-red-600 via-red-600 to-rose-600 px-5 py-3.5 shadow-md">
            <div className="flex items-center gap-3">
              <div className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/20 shadow-inner backdrop-blur-md transition-transform duration-300 hover:scale-110 hover:rotate-6 dark:bg-white/10">
                <Bot className="h-6 w-6 text-white drop-shadow-md" />
                <span className="absolute -bottom-0.5 -right-0.5 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-400 border-2 border-red-600"></span>
                </span>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-base font-bold leading-tight text-white tracking-wide">
                    SmosBot
                  </h3>
                  <Sparkles className="h-3.5 w-3.5 text-amber-200 animate-pulse" />
                </div>
                <p className="text-[11px] font-medium leading-tight text-red-50">
                  Cinématique AI Assistant
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={handleReset}
                title="Reset Chat"
                className="rounded-full p-1.5 text-white/90 transition-all duration-300 hover:bg-white/20 hover:text-white hover:rotate-180"
                aria-label="Reset Chat"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-1.5 text-white/90 transition-all duration-300 hover:bg-white/20 hover:text-white hover:rotate-90"
                aria-label="Close chat"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* ---- Messages ---- */}
          <div className="flex-1 space-y-3.5 overflow-y-auto px-4 py-4 bg-slate-50/60 dark:bg-gray-900/40 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-gray-700" style={{ maxHeight: '390px', minHeight: '280px' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`group flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl shadow-xs transition-all duration-300 group-hover:scale-110 ${
                    msg.role === 'bot'
                      ? 'bg-red-100 text-red-600 border border-red-200 dark:bg-gradient-to-br dark:from-red-500/30 dark:to-red-700/30 dark:text-red-400 dark:border-red-500/30 dark:shadow-red-900/20'
                      : 'bg-slate-200 text-slate-700 border border-slate-300 dark:bg-gradient-to-br dark:from-blue-500/30 dark:to-indigo-700/30 dark:text-blue-400 dark:border-blue-500/30 dark:shadow-indigo-900/20'
                  }`}
                >
                  {msg.role === 'bot' ? (
                    <Bot className="h-4.5 w-4.5" />
                  ) : (
                    <User className="h-4.5 w-4.5" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed transition-all duration-200 group-hover:-translate-y-0.5 shadow-xs ${
                    msg.role === 'bot'
                      ? 'rounded-tl-xs bg-white text-slate-800 border border-slate-200/90 group-hover:border-slate-300 group-hover:shadow-md dark:bg-gray-800/90 dark:text-gray-100 dark:border-gray-700/60 dark:group-hover:border-gray-600 dark:group-hover:shadow-black/40'
                      : 'rounded-tr-xs bg-gradient-to-r from-red-600 to-rose-600 text-white font-medium shadow-md shadow-red-600/20 group-hover:shadow-red-600/30'
                  }`}
                >
                  {msg.text.split('\n').map((line, i) => (
                    <span key={i}>
                      {line}
                      {i < msg.text.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl bg-red-100 text-red-600 border border-red-200 dark:bg-gradient-to-br dark:from-red-500/30 dark:to-red-700/30 dark:text-red-400 dark:border-red-500/30 animate-pulse">
                  <Bot className="h-4.5 w-4.5" />
                </div>
                <div className="flex items-center gap-2 rounded-2xl rounded-tl-xs bg-white border border-slate-200/90 px-4 py-3 shadow-xs dark:bg-gray-800/90 dark:border-gray-700/60 dark:shadow-md">
                  <Loader2 className="h-4 w-4 animate-spin text-red-600 dark:text-red-400" />
                  <span className="text-xs font-semibold text-slate-600 dark:text-gray-300">SmosBot is thinking…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ---- Input ---- */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-slate-200/90 bg-white/90 px-4 py-3 backdrop-blur-md dark:border-gray-700/60 dark:bg-gray-800/60"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask SmosBot anything…"
              disabled={isLoading}
              className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 outline-none transition-all duration-300 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 disabled:opacity-50 dark:border-gray-700/80 dark:bg-gray-900/90 dark:text-gray-100 dark:placeholder-gray-500 dark:focus:border-red-500 dark:focus:ring-red-500/30"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="group flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md transition-all duration-300 hover:scale-105 hover:from-red-500 hover:to-rose-500 hover:shadow-lg hover:shadow-red-600/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              aria-label="Send message"
            >
              <Send className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </form>
        </div>
      )}

      {/* ---------- Floating Action Button ---------- */}
      <div className="fixed bottom-6 right-6 z-50 group">
        {/* Glow backdrop pulse effect on hover */}
        <div className="absolute -inset-1.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 opacity-40 blur-md transition-all duration-300 group-hover:opacity-80 group-hover:blur-lg animate-pulse dark:opacity-60 dark:group-hover:opacity-100" />
        
        <button
          onClick={() => setIsOpen((o) => !o)}
          className="relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-r from-red-600 via-red-600 to-rose-600 text-white shadow-xl shadow-red-600/30 transition-all duration-300 group-hover:scale-110 group-hover:-translate-y-1 active:scale-95 border border-white/30"
          aria-label={isOpen ? 'Close chat' : 'Open chat'}
        >
          {isOpen ? (
            <X className="h-6 w-6 transition-transform duration-300 group-hover:rotate-90" />
          ) : (
            <Bot className="h-7 w-7 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
          )}
        </button>

        {/* Hover Tooltip when closed */}
        {!isOpen && (
          <div className="absolute right-16 top-2 hidden whitespace-nowrap rounded-xl bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-xl border border-slate-200/90 backdrop-blur-md transition-all duration-200 group-hover:block animate-in fade-in slide-in-from-right-2 dark:bg-gray-900/95 dark:text-white dark:border-gray-700/80">
            Ask <span className="text-red-600 dark:text-red-400 font-bold">SmosBot</span> 🤖
          </div>
        )}
      </div>
    </>
  )
}

