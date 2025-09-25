import React, { useMemo, useRef, useState, useEffect } from 'react';
import { MessageCircle, X, Send, BookOpen, Info } from 'lucide-react';
import { useI18n } from '../i18n/I18nProvider';

// Types
interface Message {
  role: 'user' | 'assistant';
  content: string;
}

// Simple keyword matcher over existing content (translations + portfolio)
function useKnowledgeBase() {
  const { dict, lang } = useI18n();

  const portfolioItems = useMemo(() => {
    const items = (dict?.portfolio as any)?.items as Array<{
      slug?: string;
      title: string;
      description: string;
      tags: string[];
    }> | undefined;
    return items ?? [];
  }, [dict]);

  const aboutValues = useMemo(() => {
    const values = (dict?.about as any)?.values as Array<{
      title: string;
      description: string;
    }> | undefined;
    return values ?? [];
  }, [dict]);

  function searchProjects(query: string) {
    const q = query.toLowerCase();
    const results = portfolioItems.filter((p) => {
      return (
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        (p.slug ?? '').toLowerCase().includes(q)
      );
    });
    return results;
  }

  function listAllProjects() {
    return portfolioItems;
  }
  function aboutSummary() {
    const title = (dict?.about as any)?.title as string | undefined;
    const subtitle = (dict?.about as any)?.subtitle as string | undefined;
    return {
      title: title ?? 'About',
      subtitle: subtitle ?? '',
      values: aboutValues,
    };
  }

  return { searchProjects, listAllProjects, aboutSummary, lang };
}

export default function ChatbotWidget() {
  const { t } = useI18n();
  const { searchProjects, listAllProjects, aboutSummary, lang } = useKnowledgeBase();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: t('chat.welcome') as string,
    },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'unknown' | 'connected' | 'fallback'>('unknown');

  useEffect(() => {
    if (isOpen && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isOpen, messages]);

  // Refresh the initial assistant message when language changes
  useEffect(() => {
    setMessages((prev) => {
      if (!prev.length) return prev;
      const first = prev[0];
      if (first.role !== 'assistant') return prev;
      const localized = t('chat.welcome') as string;
      if (first.content === localized) return prev;
      return [{ ...first, content: localized }, ...prev.slice(1)];
    });
  }, [lang, t]);

  // Detect backend health on mount to show status indicator
  useEffect(() => {
    const API_BASE = (import.meta as any).env?.VITE_API_BASE as string | undefined;
    const healthUrl = API_BASE ? `${API_BASE.replace(/\/$/, '')}/health` : '/api/health';
    fetch(healthUrl)
      .then((r) => {
        if (r.ok) setBackendStatus('connected');
        else setBackendStatus('fallback');
      })
      .catch(() => setBackendStatus('fallback'));
  }, []);

  function formatProjectsList(projects: Array<{ slug?: string; title: string; description: string; tags: string[] }>) {
    if (!projects.length) return 'No matching projects found.';
    return projects
      .slice(0, 6)
      .map((p) => {
        const link = p.slug ? `/${lang}/project/${p.slug}` : undefined;
        const tags = p.tags.join(', ');
        return `${p.title}${link ? ` → ${link}` : ''}\n- ${p.description}\n- Tags: ${tags}`;
      })
      .join('\n\n');
  }

  function handleUserQuery(query: string): string {
    const q = query.trim();
    const lower = q.toLowerCase();

    // About/experience intents
    if (/(about|experience|who\s+are\s+you|what\s+do\s+you\s+do)/.test(lower)) {
      const about = aboutSummary();
      const values = about.values
        .map((v) => `- ${v.title}: ${v.description}`)
        .join('\n');
      return `About — ${about.title}\n${about.subtitle}\n\nCore values:\n${values}`;
    }

    // List projects
    if (/(all\s+projects|list\s+projects|show\s+projects)/.test(lower)) {
      return formatProjectsList(listAllProjects());
    }

    // Keyword search for projects
    const results = searchProjects(lower);
    if (results.length) {
      return formatProjectsList(results);
    }

    // Hints
    return "I couldn't find that yet. Try asking about: 'AI', 'pricing engine', 'CRM', or say 'list projects'.";
  }

  async function send() {
    const q = input.trim();
    if (!q) return;
    const userMsg: Message = { role: 'user', content: q };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      // Try backend LLM first
      const API_BASE = (import.meta as any).env?.VITE_API_BASE as string | undefined;
      const endpoint = API_BASE ? `${API_BASE.replace(/\/$/, '')}/chat` : '/api/chat';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg], lang }),
      });

      if (res.ok && res.body) {
        setBackendStatus('connected');
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let done = false;

        // Add a placeholder for the assistant's message
        setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          const chunk = decoder.decode(value, { stream: true });
          
          // Process SSE data chunks
          const lines = chunk.split('\n\n').filter(Boolean);
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.substring(5));
                if (data.content) {
                  setMessages((prev) => {
                    const lastMsg = prev[prev.length - 1];
                    if (lastMsg && lastMsg.role === 'assistant') {
                      // Create a new message object with the updated content
                      const updatedMsg = { ...lastMsg, content: lastMsg.content + data.content };
                      // Return a new array with the new message object
                      return [...prev.slice(0, -1), updatedMsg];
                    }
                    return prev;
                  });
                }
                // You could also handle the final `snippets` data here if needed
              } catch (e) {
                console.error('Error parsing stream data', e);
              }
            }
          }
        }
      } else {
        setBackendStatus('fallback');
        // Fallback for non-streaming errors or if the key is missing
        const fallback = handleUserQuery(q);
        setMessages((prev) => [...prev, { role: 'assistant', content: fallback }]);
      }
    } catch (e) {
      setBackendStatus('fallback');
      const fallback = handleUserQuery(q);
      setMessages((prev) => [...prev, { role: 'assistant', content: fallback }]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">{/* Container for toggle and panel */}
      {/* Toggle Button */}
      {!isOpen && (
        <button
          aria-label="Open chat"
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg px-4 py-3 transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="hidden md:inline">Chat</span>
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="w-[92vw] max-w-sm sm:max-w-md md:max-w-md h-[60vh] sm:h-[60vh] md:h-[65vh] bg-surface border border-border rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-surface border-b border-border">
            <div className="flex items-center gap-2 text-ink">
              <BookOpen className="w-5 h-5 text-link" />
              <span className="font-semibold">Portfolio Assistant</span>
            </div>
            <div className="flex items-center gap-3">
              {/* Backend status indicator */}
              <div className="flex items-center gap-1 text-xs">
                <span
                  className={
                    'inline-block w-2.5 h-2.5 rounded-full ' +
                    (backendStatus === 'connected'
                      ? 'bg-green-500'
                      : backendStatus === 'fallback'
                      ? 'bg-ink/30'
                      : 'bg-yellow-500')
                  }
                  title={
                    backendStatus === 'connected'
                      ? 'LLM connected'
                      : backendStatus === 'fallback'
                      ? 'Fallback mode (local answers)'
                      : 'Checking backend…'
                  }
                />
                <span className="muted">
                  {backendStatus === 'connected'
                    ? 'LLM connected'
                    : backendStatus === 'fallback'
                    ? 'fallback mode'
                    : 'checking…'}
                </span>
              </div>
              <button
                aria-label="Close chat"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded hover:bg-surface muted"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="px-4 py-3 space-y-3 h-[calc(100%-112px)] overflow-y-auto">
            {messages.map((m, idx) => (
              <div key={idx} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    'max-w-[85%] whitespace-pre-wrap rounded-lg px-3 py-2 text-sm ' +
                    (m.role === 'user'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-surface text-ink border border-border')
                  }
                >
                  {m.content}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] rounded-lg px-3 py-2 text-sm bg-surface muted border border-border">
                  Thinking...
                </div>
              </div>
            )}
          
          </div>

          {/* Input */}
          <div className="flex items-center gap-2 p-3 border-t border-border bg-surface">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Ask about projects or experience..."
              className="flex-1 rounded-lg bg-white border border-border px-3 py-2 text-sm text-ink placeholder-ink/50 focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
            <button
              onClick={send}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 text-sm"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
