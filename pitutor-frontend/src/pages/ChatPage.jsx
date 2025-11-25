import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { LogOut, Send, Loader2, Trash2, Plus, MessageSquare, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const normalizeMarkdown = (text) => {
  if (!text) return "";
  const lines = String(text).split(/\r?\n/);
  const out = [];
  let inCode = false;
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const s = raw.trim();
    if (s.startsWith("```") || s.startsWith("~~~")) {
      out.push(raw);
      inCode = !inCode;
      continue;
    }
    if (inCode) {
      out.push(raw);
      continue;
    }
    if (/^[•-]$/.test(s)) {
      const next = lines[i + 1] ? lines[i + 1].trim() : "";
      if (next) {
        out.push(`- ${next}`);
        i++;
      }
      continue;
    }
    if (/^•\s+/.test(s)) {
      out.push(`- ${s.replace(/^•\s+/, "")}`);
      continue;
    }
    out.push(raw);
  }
  const joined = out.join("\n").replace(/\n{3,}/g, "\n\n");
  return joined;
};

// User Avatar Component - shows first letter of user's name
const UserAvatar = ({ userName }) => {
  const initial = userName?.charAt(0).toUpperCase() || "U";
  return (
    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center shadow-md flex-shrink-0">
      <span className="text-white text-sm font-medium leading-none">{initial}</span>
    </div>
  );
};

// Bot Avatar Component - shows Sparkles icon
const BotAvatar = () => (
  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-md flex-shrink-0">
    <Sparkles className="w-4 h-4 text-white flex-shrink-0" />
  </div>
);

const ChatPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messagesEndRef = useRef(null);

  // LocalStorage management for sessions
  const storageKey = userId ? `chatSessions_${userId}` : null;
  const loadSessions = () => {
    if (!storageKey) return [];
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  };
  const saveSessions = (next) => {
    if (!storageKey) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}
  };

  // Persist the currently selected session id so refresh stays on same chat
  const currentKey = userId ? `currentSession_${userId}` : null;
  const loadCurrentSessionId = () => {
    if (!currentKey) return null;
    try {
      return localStorage.getItem(currentKey);
    } catch {
      return null;
    }
  };
  const saveCurrentSessionId = (id) => {
    if (!currentKey) return;
    try {
      if (id) localStorage.setItem(currentKey, id);
      else localStorage.removeItem(currentKey);
    } catch {}
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        if (userId) {
          // Load any stored sessions first
          const stored = loadSessions();
          if (stored.length) {
            setSessions(stored);
            const storedCurrent = loadCurrentSessionId();
            const fallback = stored[0];
            const active = stored.find((s) => s.id === storedCurrent) || fallback;
            if (active) {
              setCurrentSessionId(active.id);
              setMessages(active.messages || []);
            }
            // We already have local messages; stop the loading spinner
            setLoadingMessages(false);
          }
          // Only fetch from server if we have no local sessions.
          // This prevents overwriting locally persisted messages with empty server results.
          if (!stored.length) {
            fetchOrCreateChat(userId);
          }
        }
      } catch (error) {
        console.error("Token decoding error:", error);
        navigate("/login");
      }
    }
  }, [navigate, userId]);

  const fetchOrCreateChat = async (userId) => {
    setLoadingMessages(true);
    try {
      const sidParam = loadCurrentSessionId() || currentSessionId || "";
      const res = await axios.get(
        `http://localhost:5000/api/chat/${userId}/messages${sidParam ? `?sessionId=${encodeURIComponent(sidParam)}` : ""}`,
        { withCredentials: true }
      );
      // API returns an array of messages; parse accordingly
      const data = res.data;
      const fetched = Array.isArray(data) ? data : (data.messages || []);
      setMessages(fetched);

      // Integrate fetched messages without creating a new session if one exists
      setSessions((prev) => {
        const existingId = currentSessionId || (prev[0]?.id || null);
        if (existingId) {
          const local = prev.find((s) => s.id === existingId);
          const keepLocal = (local?.messages?.length || 0) > 0 && fetched.length === 0;
          const mergedMessages = keepLocal ? (local?.messages || []) : fetched;
          const next = prev.map((s) => (s.id === existingId ? { ...s, messages: mergedMessages } : s));
          if (!currentSessionId) setCurrentSessionId(existingId);
          saveCurrentSessionId(existingId);
          saveSessions(next);
          return next;
        }
        // No sessions exist yet; create an initial one tied to server messages
        const id = `server-${Date.now()}`;
        const title = "Current Chat";
        const next = [{ id, title, messages: fetched, createdAt: Date.now() }];
        setCurrentSessionId(id);
        saveCurrentSessionId(id);
        saveSessions(next);
        return next;
      });
    } catch (error) {
      console.error("Error fetching chat:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!userId || !input.trim()) return;
    // Use a stable session id for this send
    let activeSessionId = currentSessionId;
    // Ensure there is an active session; if none, create one automatically
    if (!activeSessionId) {
      const id = `local-${Date.now()}`;
      const initialTitle = (input || "Untitled").slice(0, 40) + ((input || "").length > 40 ? "…" : "");
      const newSession = { id, title: initialTitle || "New Chat", messages: [], createdAt: Date.now() };
      setSessions((prev) => {
        const next = [newSession, ...prev];
        saveSessions(next);
        return next;
      });
      setCurrentSessionId(id);
      saveCurrentSessionId(id);
      activeSessionId = id;

      // Register the new session server-side immediately so Admin sees it
      axios
        .get(
          `http://localhost:5000/api/chat/${userId}/messages?sessionId=${encodeURIComponent(id)}`,
          { withCredentials: true }
        )
        .catch((err) => console.error("Error creating server session:", err));
    }

    setLoading(true);
    const newMessage = { role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    // Reflect in current session and update title if needed
    setSessions((prev) => {
      if (!activeSessionId) return prev;
      const updated = prev.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              title:
                !s.title || s.title === "New Chat"
                  ? (newMessage.content || "Untitled").slice(0, 40) +
                    ((newMessage.content || "").length > 40 ? "…" : "")
                  : s.title,
              messages: [...(s.messages || []), newMessage],
            }
          : s
      );
      saveSessions(updated);
      return updated;
    });
    setInput("");

    try {
      const res = await axios.post(
        `http://localhost:5000/api/chat/${userId}/message`,
        { content: input, sessionId: activeSessionId },
        { withCredentials: true }
      );
      setMessages((prevMessages) => [...prevMessages, res.data]);
      setSessions((prev) => {
        if (!activeSessionId) return prev;
        const updated = prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...(s.messages || []), res.data] }
            : s
        );
        saveSessions(updated);
        return updated;
      });
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleNewChat = () => {
    const id = `local-${Date.now()}`;
    const newSession = { id, title: "New Chat", messages: [], createdAt: Date.now() };
    setSessions(prev => {
      const next = [newSession, ...prev];
      saveSessions(next);
      return next;
    });
    setCurrentSessionId(id);
    saveCurrentSessionId(id);
    setMessages([]);
  };

  const selectSession = (id) => {
    setCurrentSessionId(id);
    saveCurrentSessionId(id);
    const session = sessions.find(s => s.id === id);
    if (session) {
      setMessages(session.messages || []);
    }
  };

  const deleteSession = (id) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      saveSessions(next);
      return next;
    });
    if (currentSessionId === id) {
      const remaining = sessions.find(s => s.id !== id);
      if (remaining) {
        setCurrentSessionId(remaining.id);
        saveCurrentSessionId(remaining.id);
        setMessages(remaining.messages || []);
      } else {
        setCurrentSessionId(null);
        saveCurrentSessionId(null);
        setMessages([]);
      }
    }
  };

  const handleLogout = async () => {
    try {
      // Call backend logout
      await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });
    } catch (error) {
      console.error("Logout API failed:", error);
    } finally {
      // Clear all local storage data
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      
      // Clear all chat sessions and current session data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('chatSessions_') || key.startsWith('currentSession_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Reset state
      setMessages([]);
      setSessions([]);
      setCurrentSessionId(null);
      setUser(null);
      
      // Navigate to home
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-violet-50/30 to-blue-50/50">
      {/* Animated Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-violet-200/30 rounded-full blur-3xl animate-pulse" style={{animationDuration: '4s'}} />
        <div className="absolute top-1/2 -left-40 w-80 h-80 bg-blue-200/30 rounded-full blur-3xl animate-pulse" style={{animationDuration: '5s', animationDelay: '1s'}} />
        <div className="absolute -bottom-20 right-1/3 w-72 h-72 bg-indigo-200/20 rounded-full blur-3xl animate-pulse" style={{animationDuration: '6s', animationDelay: '2s'}} />
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/70 backdrop-blur-xl border-b border-violet-100/50 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-200/50">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent">
                  AiTutor
                </h1>
              </div>
              <div className="h-6 w-px bg-violet-200/50 hidden sm:block" />
              {user && (
                <span className="text-sm text-slate-500 hidden sm:block">
                  Welcome, <span className="font-medium text-slate-700">{user.name}</span>
                </span>
              )}
            </div>
            <button 
              onClick={handleLogout}
              className="group inline-flex items-center px-4 py-2 text-sm font-medium rounded-xl border border-red-100 bg-white/50 text-red-500 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all duration-300 shadow-sm hover:shadow-md">
              <LogOut className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-0.5" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Layout */}
      <div className="pt-16 h-screen flex">
        {/* Sidebar */}
        <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-white/60 backdrop-blur-xl border-r border-violet-100/50 z-40 transition-all duration-500 ease-out ${sidebarOpen ? 'w-72' : 'w-0'} overflow-hidden`}>
          <div className="p-4 h-full flex flex-col min-w-[288px]">
            {/* New Chat Button */}
            <button
              onClick={handleNewChat}
              className="w-full mb-4 px-4 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white font-medium shadow-lg shadow-violet-200/50 hover:shadow-xl hover:shadow-violet-300/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              New Chat
            </button>

            {/* Sessions List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-2 mb-2">Recent Chats</p>
              {sessions.map((s, idx) => (
                <div
                  key={s.id}
                  onClick={() => selectSession(s.id)}
                  className={`group relative w-full text-left px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 ${
                    currentSessionId === s.id
                      ? "bg-gradient-to-r from-violet-500/10 to-blue-500/10 border border-violet-200/50 shadow-sm"
                      : "hover:bg-violet-50/50 border border-transparent"
                  }`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                      currentSessionId === s.id 
                        ? "bg-gradient-to-br from-violet-500 to-blue-500 shadow-md" 
                        : "bg-violet-100 group-hover:bg-violet-200"
                    }`}>
                      <MessageSquare className={`w-4 h-4 ${currentSessionId === s.id ? "text-white" : "text-violet-500"}`} />
                    </div>
                    <div className="flex-1 min-w-0 pr-6">
                      <p className={`text-sm font-medium truncate transition-colors ${
                        currentSessionId === s.id ? "text-violet-700" : "text-slate-700"
                      }`}>
                        {s.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); deleteSession(s.id); }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Sidebar Toggle */}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className={`fixed z-50 top-1/2 -translate-y-1/2 w-6 h-12 bg-white/80 backdrop-blur-sm border border-violet-100 rounded-r-lg shadow-md hover:shadow-lg transition-all duration-500 flex items-center justify-center hover:bg-violet-50 ${sidebarOpen ? 'left-72' : 'left-0'}`}
        >
          {sidebarOpen ? <ChevronLeft className="w-4 h-4 text-violet-500" /> : <ChevronRight className="w-4 h-4 text-violet-500" />}
        </button>

        {/* Chat Area */}
        <main className={`flex-1 transition-all duration-500 ${sidebarOpen ? 'ml-72' : 'ml-0'}`}>
          <div className="h-full max-w-4xl mx-auto px-4 py-6">
            <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl shadow-violet-100/50 border border-violet-100/50 h-[calc(100vh-120px)] flex flex-col overflow-hidden">
              {/* Chat Header */}
              <div className="px-6 py-5 border-b border-violet-100/50 bg-gradient-to-r from-violet-50/50 to-blue-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg shadow-violet-200/50">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-slate-800">AI Tutor Chat</h2>
                    <p className="text-sm text-slate-500">Your personal programming assistant</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar">
                {messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeIn`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`flex gap-3 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                      {msg.role === "user" 
                        ? <UserAvatar userName={user?.name} />
                        : <BotAvatar />
                      }
                      <div className={`px-5 py-4 rounded-2xl shadow-sm ${
                        msg.role === "user"
                          ? "bg-gradient-to-br from-blue-500 to-violet-500 text-white rounded-tr-sm"
                          : "bg-white/80 border border-violet-100/50 text-slate-700 rounded-tl-sm"
                      }`}>
                        <div className="prose prose-sm max-w-none text-sm leading-relaxed whitespace-pre-wrap">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ node, ...props }) => <p className="m-0" {...props} />,
                              strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                              em: ({ node, ...props }) => <em className="italic" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc pl-5 mt-2 mb-2" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal pl-5 mt-2 mb-2" {...props} />,
                              li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                              code: ({ node, inline, className, children, ...props }) => {
                                return inline ? (
                                  <code className="bg-slate-100 text-slate-800 px-1 py-0.5 rounded text-xs" {...props}>
                                    {children}
                                  </code>
                                ) : (
                                  <pre className="bg-slate-900 text-slate-100 rounded p-3 overflow-auto text-xs" {...props}>
                                    <code className={className}>{children}</code>
                                  </pre>
                                );
                              },
                            }}
                          >
                            {normalizeMarkdown(msg.content)}
                          </ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  </div>
              ))}
                {loadingMessages && (
                  <div className="flex justify-center">
                    <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
                  </div>
                )}
                {loading && (
                  <div className="flex justify-start animate-fadeIn">
                    <div className="flex gap-3">
                      <BotAvatar />
                      <div className="px-5 py-4 rounded-2xl rounded-tl-sm bg-white/80 border border-violet-100/50">
                        <div className="flex gap-1.5">
                          <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{animationDelay: '0ms'}} />
                          <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{animationDelay: '150ms'}} />
                          <div className="w-2 h-2 rounded-full bg-violet-400 animate-bounce" style={{animationDelay: '300ms'}} />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-violet-100/50 px-6 py-4 bg-gradient-to-r from-violet-50/30 to-blue-50/30">
                <div className="flex items-center gap-3">
                  <div className="flex-1 relative">
                    <input
                      type="text"
                      placeholder="Ask me anything about programming..."
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="w-full rounded-xl border border-violet-200/50 bg-white/70 px-5 py-3.5 pr-12 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-300 focus:border-transparent transition-all duration-300 shadow-sm focus:shadow-md"
                    />
                  </div>
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="px-5 py-3.5 rounded-xl bg-gradient-to-r from-violet-500 to-blue-500 text-white font-medium shadow-lg shadow-violet-200/50 hover:shadow-xl hover:shadow-violet-300/50 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-300 flex items-center gap-2"
                  >
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span className="hidden sm:inline">Send</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(139, 92, 246, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(139, 92, 246, 0.4);
        }
      `}</style>
    </div>
  );
};
export default ChatPage;
