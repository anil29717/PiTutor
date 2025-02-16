import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { LogOut, Send, Loader2 } from "lucide-react";

const ChatPage = () => {
  const navigate = useNavigate();
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
    } else {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        if (userId) {
          fetchOrCreateChat(userId);
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
      const res = await axios.get(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat/${userId}/messages`,
        { withCredentials: true }
      );
      setChatId(res.data.userId);
      setMessages(res.data.messages || []);
    } catch (error) {
      console.error("Error fetching chat:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async () => {
    if (!userId || !input.trim()) return;

    setLoading(true);
    const newMessage = { role: "user", content: input };
    setMessages((prevMessages) => [...prevMessages, newMessage]);
    setInput("");

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/chat/${userId}/message`,
        { content: input },
        { withCredentials: true }
      );
      setMessages((prevMessages) => [...prevMessages, res.data]);
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <h1 
                onClick={() => navigate("/")} 
                className="text-2xl font-bold text-blue-600 cursor-pointer hover:text-blue-700"
              >
                PiTutor
              </h1>
              {user && (
                <span className="text-gray-600">
                  Welcome, <span className="font-medium">{user.name}</span>
                </span>
              )}
            </div>
            <button
              onClick={() => {
                localStorage.removeItem("token");
                localStorage.removeItem("user");
                navigate("/login");
              }}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Chat Container */}
      <div className="pt-16 h-screen flex flex-col">
        <div className="flex-1 overflow-hidden">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[calc(100vh-180px)] flex flex-col">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800">AI Tutor Chat</h2>
                <p className="text-sm text-gray-500">Get help with your programming questions</p>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                  </div>
                ) : messages.length > 0 ? (
                  messages.map((msg, index) => (
                    <div
                      key={index}
                      className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[80%] px-4 py-3 rounded-lg ${
                          msg.role === "user"
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        <p className="text-sm">{msg.content}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500 text-center">
                      No messages yet. Start the conversation!
                    </p>
                  </div>
                )}
              </div>

              {/* Input Area */}
              <div className="border-t border-gray-200 px-6 py-4">
                <div className="flex space-x-4">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={loading || !input.trim()}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Send
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;