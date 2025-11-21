import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [entered, setEntered] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userId = JSON.parse(storedUser).userId;
      if (userId) {
        navigate(`/chat/${encodeURIComponent(userId)}`);
      }
    }
  }, [navigate]);

  // Trigger entrance animation
  useEffect(() => {
    const t = setTimeout(() => setEntered(true), 0);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        { email, password },
        { withCredentials: true }
      );
      const { token, user } = res.data;
      
      // Clear all existing session data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith('chatSessions_') || key.startsWith('currentSession_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Set new login data
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      
      // Navigate to chat
      navigate(`/chat/${encodeURIComponent(user.userId)}`);
    } catch (err) {
      setError(
        err?.response?.data?.message || "Login failed. Please check your credentials."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
      <div className="relative w-full max-w-md">
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-blue-200/40 rounded-full blur-2xl"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-200/40 rounded-full blur-2xl"></div>
        {/* Back to Home button (fixed page top-right) */}
        <button
          type="button"
          aria-label="Back to Home"
          className="fixed top-4 right-4 z-30 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-blue-300/60 text-blue-700 shadow transition-all duration-200 hover:bg-blue-50/40 hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400"
          onClick={() => { setLeaving(true); setTimeout(() => navigate('/'), 300); }}
        >
          Back to Home
        </button>
        <div className={`relative w-full bg-white/30 backdrop-blur-md rounded-2xl shadow-lg border border-white/40 p-6 transition-all duration-500 ease-out hover:bg-white/40 hover:shadow-xl ${entered && !leaving ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Login</h1>
          <p className="text-sm text-gray-700 mb-6">
            Welcome back. Please sign in to continue.
          </p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-100/70 text-red-700 text-sm border border-red-200/60">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 bg-white/30 px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-xl border border-gray-300 bg-white/30 px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl text-white bg-blue-600/90 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all shadow"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-4 text-sm text-gray-700">
            Don’t have an account?{' '}
            <button
              onClick={() => { setLeaving(true); setTimeout(() => navigate('/signup'), 180); }}
              className="text-blue-700 hover:text-blue-800 font-medium transition-all duration-200 active:scale-95 hover:underline"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
