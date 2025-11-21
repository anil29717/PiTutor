import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SignupForm = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '',
    age: '',
    number: '',
    role: 'student',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/signup', {
        name: form.name,
        age: Number(form.age),
        number: form.number,
        role: form.role,
        email: form.email,
        password: form.password,
      });
      // After successful signup, navigate to login
      setLeaving(true);
      setTimeout(() => navigate('/login'), 300);
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Signup failed. Please check the details and try again.'
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
        <div className={`relative w-full bg-white/20 backdrop-blur-md rounded-2xl shadow-lg border border-white/70 p-6 transition-all duration-500 ease-out hover:bg-white/30 hover:shadow-xl ${entered && !leaving ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Create your account</h1>
          <p className="text-sm text-gray-700 mb-6">
            Sign up to start learning with AiTutor.
          </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-100/70 text-red-700 text-sm border border-red-200/60">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 bg-white/20 px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-300 bg-white/20 px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                name="number"
                value={form.number}
                onChange={handleChange}
                required
                className="w-full rounded-xl border border-gray-300 bg-white/20 px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              name="role"
              value={form.role}
              onChange={handleChange}
              className="w-full rounded-xl border border-gray-300 bg-white/20 px-4 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            >
              <option value="student">Student</option>
              <option value="parent">Parent</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 bg-white/20 px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="w-full rounded-xl border border-gray-300 bg-white/20 px-4 py-2 text-gray-900 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-xl text-white bg-blue-600/90 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all shadow"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-4 text-sm text-gray-700">
          Already have an account?{' '}
          <button
            onClick={() => { setLeaving(true); setTimeout(() => navigate('/login'), 300); }}
            className="text-blue-700 hover:text-blue-800 font-medium transition-all duration-200 active:scale-95 hover:underline"
          >
            Log in
          </button>
        </div>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
