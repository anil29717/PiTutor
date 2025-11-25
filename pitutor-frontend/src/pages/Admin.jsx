import { useEffect, useState } from "react";
import { Users, MessageSquare, Activity, BarChart3, TrendingUp, Clock } from "lucide-react";

function Admin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState("dashboard");
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [users, setUsers] = useState([]);
  const [chats, setChats] = useState([]);
  const [activities, setActivities] = useState([]);
  const [userSearch, setUserSearch] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchProtectedData = async () => {
    try {
      setIsFetching(true);
      const [usersRes, chatsRes, activityRes] = await Promise.all([
        fetch("http://localhost:5000/api/admin/users", { credentials: "include" }),
        fetch("http://localhost:5000/api/admin/chats", { credentials: "include" }),
        fetch("http://localhost:5000/api/admin/activity", { credentials: "include" }),
      ]);

      if (usersRes.status === 401 || chatsRes.status === 401 || activityRes.status === 401) {
        setAuthed(false);
        return;
      }

      const usersData = await usersRes.json();
      const chatsData = await chatsRes.json();
      const activityData = await activityRes.json();
      setUsers(usersData);
      setChats(chatsData);
      setActivities(activityData);
      setAuthed(true);
      setLastUpdated(new Date());
    } catch {
      setError("Failed to load admin data");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchProtectedData();
  }, []);

  useEffect(() => {
    if (authed && (tab === "chats" || tab === "history" || tab === "activity")) {
      fetchProtectedData();
    }
  }, [tab, authed]);

  useEffect(() => {
    if (!authed || (tab !== "history" && tab !== "chats" && tab !== "activity")) return;
    const intervalMs = tab === "chats" ? 3000 : 5000;
    const timer = setInterval(() => {
      fetchProtectedData();
    }, intervalMs);
    return () => clearInterval(timer);
  }, [authed, tab]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:5000/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.message || "Invalid password");
        setAuthed(false);
      } else {
        await fetchProtectedData();
      }
    } catch {
      setError("Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("http://localhost:5000/api/admin/logout", { method: "POST", credentials: "include" });
    setAuthed(false);
    setUsers([]);
    setChats([]);
  };

  const dayKey = (d) => {
    const dt = new Date(d);
    return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
  };
  const lastNDaysKeys = (n) => {
    const arr = [];
    const now = new Date();
    for (let i = n - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      arr.push(dayKey(d));
    }
    return arr;
  };
  const messagesPerDay = (() => {
    const all = chats.flatMap((c) => {
      if (Array.isArray(c.sessions) && c.sessions.length) {
        return c.sessions.flatMap((s) => s.messages || []);
      }
      return c.messages || [];
    });
    const map = new Map();
    all.forEach((m) => {
      const k = m?.timestamp ? dayKey(m.timestamp) : dayKey(Date.now());
      map.set(k, (map.get(k) || 0) + 1);
    });
    const keys = lastNDaysKeys(14);
    return keys.map((k) => ({ k, v: map.get(k) || 0 }));
  })();
  const activitiesPerDay = (() => {
    const map = new Map();
    activities.forEach((a) => {
      const k = a?.timestamp ? dayKey(a.timestamp) : dayKey(Date.now());
      map.set(k, (map.get(k) || 0) + 1);
    });
    const keys = lastNDaysKeys(14);
    return keys.map((k) => ({ k, v: map.get(k) || 0 }));
  })();

  

  // Calculate stats
  const totalUsers = users.length;
  const totalChats = chats.length;
  const totalMessages = chats.reduce((sum, c) => {
    if (Array.isArray(c.sessions)) {
      return sum + c.sessions.reduce((s, sess) => s + (sess.messages?.length || 0), 0);
    }
    return sum + (c.messages?.length || 0);
  }, 0);
  const totalActivities = activities.length;
  const activeUsersToday = new Set(
    activities
      .filter(a => {
        const actDate = new Date(a.timestamp);
        const today = new Date();
        return actDate.toDateString() === today.toDateString();
      })
      .map(a => a.userId)
  ).size;

  if (!authed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl opacity-40 animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-400/15 rounded-full blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
        
        <div className="w-full max-w-md bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl border border-blue-200/60 p-8 transition-all duration-300 ease-out hover:bg-white/70 hover:shadow-2xl relative z-10">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent cursor-pointer mb-2">AiTutor</h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Admin Login</h2>
          {error && <div className="mb-4 text-red-700 bg-red-100/70 border border-red-300/60 p-3 rounded-xl">{error}</div>}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Admin Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-blue-300/40 bg-white/60 px-4 py-3 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all backdrop-blur-md"
                placeholder="Enter admin password"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !password}
              className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all shadow-lg shadow-blue-300/50 transform hover:scale-105"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-400/15 rounded-full blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <nav className="fixed top-0 w-full bg-white/40 backdrop-blur-xl border-b border-blue-200/40 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">Admin Panel</h1>
            </div>
            <button 
              onClick={handleLogout} 
              className="px-4 py-2 text-sm rounded-lg border border-red-300/50 bg-white/60 text-red-600 hover:bg-red-50/40 hover:border-red-400/70 transition-all duration-300 backdrop-blur-md font-medium shadow-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="pt-24 max-w-7xl mx-auto p-6">
        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/70 via-blue-50/40 to-white/40 border border-blue-300/40 backdrop-blur-xl hover:border-blue-400/70 transition-all duration-300 shadow-lg shadow-blue-200/30 transform hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Users</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">{totalUsers}</p>
              </div>
              <Users className="w-10 h-10 text-blue-500/70" />
            </div>
          </div>

          <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/70 via-violet-50/40 to-white/40 border border-blue-300/40 backdrop-blur-xl hover:border-blue-400/70 transition-all duration-300 shadow-lg shadow-blue-200/30 transform hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Total Chats</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">{totalChats}</p>
              </div>
              <MessageSquare className="w-10 h-10 text-violet-500/70" />
            </div>
          </div>

          <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/70 via-blue-50/40 to-white/40 border border-blue-300/40 backdrop-blur-xl hover:border-blue-400/70 transition-all duration-300 shadow-lg shadow-blue-200/30 transform hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Messages</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">{totalMessages}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-blue-500/70" />
            </div>
          </div>

          <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/70 via-violet-50/40 to-white/40 border border-blue-300/40 backdrop-blur-xl hover:border-blue-400/70 transition-all duration-300 shadow-lg shadow-blue-200/30 transform hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Activities</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">{totalActivities}</p>
              </div>
              <Activity className="w-10 h-10 text-violet-500/70" />
            </div>
          </div>

          <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/70 via-blue-50/40 to-white/40 border border-blue-300/40 backdrop-blur-xl hover:border-blue-400/70 transition-all duration-300 shadow-lg shadow-blue-200/30 transform hover:scale-105 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium mb-1">Active Today</p>
                <p className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent">{activeUsersToday}</p>
              </div>
              <Clock className="w-10 h-10 text-blue-500/70" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex items-center gap-3 flex-wrap">
          {["dashboard", 'users', 'chats', 'history', 'activity'].map((tabName) => (
            <button
              key={tabName}
              onClick={() => setTab(tabName)}
              className={`px-5 py-2.5 rounded-lg border font-medium capitalize transition-all duration-200 ease-out ${
                tab === tabName
                  ? 'bg-gradient-to-r from-blue-500 to-violet-600 text-white border-blue-600 shadow-lg shadow-blue-300/50'
                  : 'bg-white/60 text-gray-700 border-blue-300/40 backdrop-blur-md hover:bg-white/80 hover:shadow-md'
              }`}
            >
              {tabName === 'history' ? 'History' : tabName}
            </button>
          ))}
          
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={fetchProtectedData}
              className="px-4 py-2 text-sm rounded-lg border border-blue-300/50 bg-white/60 text-blue-700 hover:bg-white/80 transition-all backdrop-blur-md font-medium shadow-sm"
            >
              {isFetching ? "Refreshing…" : "Refresh"}
            </button>
            {lastUpdated && (
              <div className="text-xs text-gray-600 px-3 py-2 bg-white/40 rounded-lg backdrop-blur-md border border-blue-200/40">
                Last: {new Date(lastUpdated).toLocaleTimeString()}
              </div>
            )}
          </div>
        </div>

        {tab === "dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-xl border border-blue-300/40 shadow-md">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Messages (14 days)</h3>
                <span className="text-sm text-gray-500">Total {messagesPerDay.reduce((s, d) => s + d.v, 0)}</span>
              </div>
              {(() => {
                const w = 560;
                const h = 140;
                const max = Math.max(1, ...messagesPerDay.map((d) => d.v));
                const step = w / Math.max(1, messagesPerDay.length - 1);
                const pts = messagesPerDay
                  .map((d, i) => {
                    const x = i * step;
                    const y = h - (d.v / max) * (h - 12);
                    return `${x},${y}`;
                  })
                  .join(" ");
                return (
                  <svg width={w} height={h} className="overflow-visible">
                    <polyline points={pts} fill="none" stroke="#6366f1" strokeWidth="2" />
                  </svg>
                );
              })()}
              <div className="mt-2 text-xs text-gray-500">Last 14 days</div>
            </div>
            <div className="p-6 rounded-2xl bg-white/60 backdrop-blur-xl border border-blue-300/40 shadow-md">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-gray-800">Activity (14 days)</h3>
                <span className="text-sm text-gray-500">Total {activitiesPerDay.reduce((s, d) => s + d.v, 0)}</span>
              </div>
              {(() => {
                const w = 560;
                const h = 140;
                const max = Math.max(1, ...activitiesPerDay.map((d) => d.v));
                const bw = Math.floor(w / activitiesPerDay.length);
                return (
                  <svg width={w} height={h} className="overflow-visible">
                    {activitiesPerDay.map((d, i) => {
                      const barH = (d.v / max) * (h - 12);
                      const x = i * bw + 4;
                      const y = h - barH;
                      return <rect key={i} x={x} y={y} width={bw - 8} height={barH} rx={4} fill="#22c55e" />;
                    })}
                  </svg>
                );
              })()}
              <div className="mt-2 text-xs text-gray-500">Last 14 days</div>
            </div>
          </div>
        )}

        {tab === "users" && (
          <>
            <div className="mb-4 flex items-center gap-3 justify-end w-full">
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by User ID or Name"
                className="w-full max-w-md rounded-xl border border-blue-300/40 bg-white/60 px-4 py-2.5 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-md transition-all"
              />
              {userSearch && (
                <button
                  type="button"
                  onClick={() => setUserSearch("")}
                  className="px-4 py-2 text-sm rounded-lg border border-blue-300/40 bg-white/60 text-blue-700 hover:bg-white/80 transition-all backdrop-blur-md font-medium"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg border border-blue-300/40 overflow-x-auto transition-all">
              <table className="min-w-full divide-y divide-blue-200/50">
                <thead className="bg-white/40">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">S.No</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Created At</th>
                  </tr>
                </thead>
                <tbody className="bg-white/10 divide-y divide-blue-200/40">
                  {(() => {
                    const q = userSearch.trim().toLowerCase();
                    const list = q
                      ? users.filter((u) =>
                          (u.userId || "").toLowerCase().includes(q) ||
                          (u.name || "").toLowerCase().includes(q)
                        )
                      : users;
                    return list.map((u, idx) => (
                      <tr
                        key={u.userId}
                        onClick={() => {
                          setSelectedUserId(u.userId);
                          setTab("chats");
                        }}
                        className="cursor-pointer hover:bg-blue-100/30 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm text-gray-700">{idx + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">{u.userId}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{u.name}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{u.email}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{u.number || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{u.role}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{u.createdAt ? new Date(u.createdAt).toLocaleString() : '-'}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "chats" && (
          <div className="space-y-4">
            {selectedUserId && (
              <div className="flex items-center justify-between p-4 bg-white/50 backdrop-blur-xl rounded-xl border border-blue-300/40">
                <div className="text-sm text-gray-700">
                  Chats for <span className="font-semibold text-blue-600">{selectedUserId}</span>
                </div>
                <button
                  onClick={() => setSelectedUserId(null)}
                  className="text-sm px-3 py-1.5 rounded border border-blue-300/40 bg-white/60 transition-all duration-200 hover:bg-white/80 font-medium"
                >
                  Show All
                </button>
              </div>
            )}
            {(() => {
              const list = selectedUserId ? chats.filter((c) => c.userId === selectedUserId) : chats;
              if (list.length === 0) {
                return (
                  <div className="text-center p-8 text-gray-600">No chats yet for {selectedUserId ? selectedUserId : "any user"}</div>
                );
              }
              return list.map((c) => (
                <div key={c._id} className="bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg border border-blue-300/40 transition-all overflow-hidden">
                  <div className="px-6 py-3 border-b border-blue-200/40 bg-white/60 text-sm text-gray-700 font-medium">User: {c.userId}</div>
                  <div className="px-6 py-4 space-y-5">
                    {Array.isArray(c.sessions) && c.sessions.length > 0 ? (
                      c.sessions.map((s) => (
                        <div key={s.id} className="space-y-3">
                          <div className="text-sm text-gray-600">
                            Session: <span className="font-medium text-gray-800">{s.title || 'Untitled'}</span> · {s.createdAt ? new Date(s.createdAt).toLocaleString() : ''}
                          </div>
                          {(s.messages || []).map((m, idx) => (
                            <div key={idx} className={`max-w-[65ch] px-4 py-3 rounded-lg text-left whitespace-pre-wrap break-words ${m.role === 'user' ? 'bg-blue-100/60' : 'bg-white/70'} border ${m.role === 'user' ? 'border-blue-300/40' : 'border-gray-200/60'}`}>
                              <div className="text-xs text-gray-600 mb-1 font-medium">{m.role}</div>
                              <div className="text-xs text-gray-500 mb-2">{m.timestamp ? new Date(m.timestamp).toLocaleString() : ''}</div>
                              <div className="text-sm text-gray-800">{m.content}</div>
                            </div>
                          ))}
                        </div>
                      ))
                    ) : (
                      (c.messages || []).map((m, idx) => (
                        <div key={idx} className={`max-w-[65ch] px-4 py-3 rounded-lg text-left whitespace-pre-wrap break-words ${m.role === 'user' ? 'bg-blue-100/60' : 'bg-white/70'} border ${m.role === 'user' ? 'border-blue-300/40' : 'border-gray-200/60'}`}>
                          <div className="text-xs text-gray-600 mb-1 font-medium">{m.role}</div>
                          <div className="text-xs text-gray-500 mb-2">{m.timestamp ? new Date(m.timestamp).toLocaleString() : ''}</div>
                          <div className="text-sm text-gray-800">{m.content}</div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ));
            })()}
          </div>
        )}

        {tab === "history" && (
          <div className="bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg border border-blue-300/40 transition-all overflow-hidden">
            <div className="px-6 py-4 border-b border-blue-200/40 bg-white/60">
              <h3 className="text-lg font-semibold text-gray-800">Activity History</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-200/50">
                <thead className="bg-white/40">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">S.No</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Messages</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Events</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Last Activity</th>
                  </tr>
                </thead>
                <tbody className="bg-white/10 divide-y divide-blue-200/40">
                  {(() => {
                    const getAllMessages = (userId) => {
                      const chat = chats.find((c) => c.userId === userId);
                      if (!chat) return [];
                      if (Array.isArray(chat.sessions) && chat.sessions.length > 0) {
                        return chat.sessions.flatMap((s) => s.messages || []);
                      }
                      return chat.messages || [];
                    };
                    const getUserActivities = (userId) => activities.filter((a) => a.userId === userId);

                    const rows = users.map((u) => {
                      const msgs = getAllMessages(u.userId);
                      const events = getUserActivities(u.userId);
                      const lastMsgTs = msgs.length ? new Date(msgs[msgs.length - 1]?.timestamp || 0).getTime() : 0;
                      const lastEventTs = events.length ? new Date(events[0]?.timestamp || 0).getTime() : 0;
                      const lastTs = Math.max(lastMsgTs, lastEventTs);
                      return {
                        userId: u.userId,
                        name: u.name,
                        messagesCount: msgs.length,
                        eventsCount: events.length,
                        lastTs,
                      };
                    });

                    const sorted = rows.sort((a, b) => (b.lastTs || 0) - (a.lastTs || 0));
                    return sorted.map((r, idx) => (
                      <tr key={r.userId} className="hover:bg-blue-100/20 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-700">{idx + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 font-medium">{r.userId}</td>
                        <td className="px-6 py-4 text-sm">
                          <button
                            className="text-blue-600 font-medium hover:text-blue-700 transition-colors"
                            onClick={() => {
                              setSelectedUserId(r.userId);
                              setTab("chats");
                            }}
                          >
                            {r.name || "-"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700">{r.messagesCount}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{r.eventsCount}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{r.lastTs ? new Date(r.lastTs).toLocaleString() : '-'}</td>
                      </tr>
                    ));
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === "activity" && (
          <div className="bg-white/50 backdrop-blur-xl rounded-2xl shadow-lg border border-blue-300/40 transition-all overflow-hidden">
            <div className="px-6 py-4 border-b border-blue-200/40 bg-white/60">
              <h3 className="text-lg font-semibold text-gray-800">All Activities</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-200/50">
                <thead className="bg-white/40">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">S.No</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">User ID</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Timestamp</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Detail</th>
                  </tr>
                </thead>
                <tbody className="bg-white/10 divide-y divide-blue-200/40">
                  {activities.map((a, idx) => {
                    const u = users.find((user) => user.userId === a.userId);
                    return (
                      <tr key={`${a.userId}-${a.timestamp}-${idx}`} className="hover:bg-blue-100/20 transition-colors">
                        <td className="px-6 py-4 text-sm text-gray-700">{idx + 1}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{a.userId}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{u?.name || '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-700 capitalize">{a.type}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{a.timestamp ? new Date(a.timestamp).toLocaleString() : '-'}</td>
                        <td className="px-6 py-4 text-sm text-gray-700">{a.detail || '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Admin;
