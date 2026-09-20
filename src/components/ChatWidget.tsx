import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react'
import { GoogleGenAI, type Chat } from '@google/genai'
import { MessageSquare, X, Send, Bot, User, Loader2 } from 'lucide-react'

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

const SYSTEM_INSTRUCTION = `You are CinéBot, a friendly and knowledgeable assistant for the Cinématique cinema website.
You help users with:
• Movie information (synopsis, cast, ratings, showtimes)
• Booking assistance and seat selection
• Cinema locations and facilities
• Promotions and membership programs
• Food & beverage menu
• General cinema-related questions

Rules:
1. Always be polite, concise, and helpful.
2. You can reply in both Khmer (ខ្មែរ) and English — respond in whichever language the user writes in.
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
      text: 'Hi there! 🎬 I\'m CinéBot, your cinema assistant. How can I help you today?\n\nសួស្តី! ខ្ញុំជា CinéBot ជំនួយការរោងភាពយន្តរបស់អ្នក។ តើខ្ញុំអាចជួយអ្នកដោយរបៀបណា?',
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
    chatRef.current = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    })
  }, [])

  // Create the chat session on first mount
  useEffect(() => {
    initChat()
  }, [initChat])

  /* ---- auto-scroll to bottom ---- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  /* ---- focus input when opened ---- */
  useEffect(() => {
    if (isOpen) {
      // Small delay so the panel has finished animating
      const t = setTimeout(() => inputRef.current?.focus(), 150)
      return () => clearTimeout(t)
    }
  }, [isOpen])

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

      const response = await chatRef.current!.sendMessage({ message: trimmed })
      const botText = response.text ?? 'Sorry, I couldn\'t generate a response.'

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        text: botText,
      }
      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      console.error('[CinéBot] Error:', err)
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
        <div className="fixed bottom-24 right-6 z-50 flex w-[370px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border border-gray-700/60 bg-gray-900 shadow-2xl shadow-black/40 sm:w-[400px]">
          {/* ---- Header ---- */}
          <div className="flex items-center justify-between bg-red-600 px-5 py-3">
            <div className="flex items-center gap-2.5">
              <Bot className="h-5 w-5 text-white" />
              <div>
                <h3 className="text-sm font-semibold leading-tight text-white">
                  CinéBot
                </h3>
                <p className="text-[11px] leading-tight text-red-100/80">
                  Cinématique Assistant
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-white/80 transition-colors hover:bg-red-700 hover:text-white"
              aria-label="Close chat"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ---- Messages ---- */}
          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4" style={{ maxHeight: '380px', minHeight: '260px' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-start gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                    msg.role === 'bot'
                      ? 'bg-red-600/20 text-red-400'
                      : 'bg-blue-600/20 text-blue-400'
                  }`}
                >
                  {msg.role === 'bot' ? (
                    <Bot className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                </div>

                {/* Bubble */}
                <div
                  className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'bot'
                      ? 'rounded-tl-sm bg-gray-800 text-gray-100'
                      : 'rounded-tr-sm bg-red-600 text-white'
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
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-red-600/20 text-red-400">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl rounded-tl-sm bg-gray-800 px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-red-400" />
                  <span className="text-xs text-gray-400">CinéBot is typing…</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* ---- Input ---- */}
          <form
            onSubmit={handleSubmit}
            className="flex items-center gap-2 border-t border-gray-700/60 bg-gray-800/50 px-4 py-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask CinéBot anything…"
              disabled={isLoading}
              className="flex-1 rounded-xl border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-gray-100 placeholder-gray-500 outline-none transition-colors focus:border-red-500 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label="Send message"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      )}

      {/* ---------- Floating Action Button ---------- */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-lg shadow-red-600/30 transition-all hover:scale-105 hover:bg-red-700 hover:shadow-xl active:scale-95"
        aria-label={isOpen ? 'Close chat' : 'Open chat'}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <MessageSquare className="h-6 w-6" />
        )}
      </button>
    </>
  )
}
