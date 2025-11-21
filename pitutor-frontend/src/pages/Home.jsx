import React, { useState, useEffect } from 'react';
import { BookOpen, GraduationCap, Brain, ArrowRight, Sparkles, Code2, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [activeSection, setActiveSection] = useState('home');
  const [hoveredCard, setHoveredCard] = useState(null);

  const messages = [
    "Master Python Programming",
    "Learn from AI-Powered Tutors",
    "Build Real-World Projects"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 scroll-smooth overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/15 rounded-full blur-3xl opacity-40 animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-400/15 rounded-full blur-3xl opacity-40 animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-0 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-xl bg-white/40 border-b border-blue-200/40 transition-all duration-300">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex gap-3 items-center group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-violet-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform shadow-lg shadow-blue-300/50">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent cursor-pointer hover:opacity-80 transition-opacity">
                AiTutor
              </h1>
            </div>
            <div className="hidden md:flex items-center gap-8">
              {['home', 'features', 'cta'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollTo(item === 'home' ? 'home-top' : item)}
                  className={`px-4 py-2 rounded-lg transition-all duration-300 font-medium capitalize ${
                    activeSection === (item === 'home' ? 'home' : item)
                      ? 'bg-blue-500/30 text-blue-700 border border-blue-400/50 backdrop-blur-md'
                      : 'text-gray-600 hover:text-blue-700 hover:bg-blue-400/10'
                  }`}
                >
                  {item === 'home' ? 'Home' : item === 'features' ? 'Features' : 'Get Started'}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/login')}
                className="px-4 py-2 rounded-lg border border-blue-400/40 bg-white/60 text-blue-600 hover:bg-white/80 hover:border-blue-400/60 transition-all duration-300 backdrop-blur-md font-medium">
                Login
              </button>
              <button 
                onClick={() => navigate('/signup')}
                className="px-5 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-violet-600 text-white hover:from-blue-600 hover:to-violet-700 transition-all duration-300 shadow-lg shadow-blue-300/50 font-medium transform hover:scale-105">
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:pt-40 relative" id="home-top">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <div className="inline-block px-4 py-2 rounded-full bg-blue-100/60 border border-blue-300/60 backdrop-blur-md mb-6">
              <span className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Powered by Advanced AI
              </span>
            </div>
            <h2 className="text-6xl sm:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-violet-600 to-blue-600 bg-clip-text text-transparent leading-tight">
              Accelerate Your Programming Journey
            </h2>
            <div className="h-10 mb-10">
              <p className="text-xl sm:text-2xl text-blue-700 font-medium transition-opacity duration-500 animate-fade-in">
                {messages[currentMessageIndex]}
              </p>
            </div>
            <button
              onClick={() => navigate('/signup')}
              className="inline-flex items-center px-8 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white font-semibold gap-2 hover:from-blue-600 hover:to-violet-700 transition-all duration-300 shadow-lg shadow-blue-300/50 transform hover:scale-105 hover:shadow-xl"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          {/* Floating Cards Hero */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {[
              { icon: BookOpen, title: '50+ Lessons', desc: 'Comprehensive curriculum' },
              { icon: Zap, title: '24/7 AI Tutor', desc: 'Always available support' },
              { icon: Code2, title: 'Real Projects', desc: 'Build portfolio pieces' }
            ].map((item, i) => (
              <div
                key={i}
                className="group relative p-6 rounded-2xl bg-gradient-to-br from-white/70 via-blue-50/50 to-white/40 border border-blue-300/40 backdrop-blur-xl hover:border-blue-400/70 transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 shadow-lg shadow-blue-200/30"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-400/0 via-transparent to-violet-400/0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <item.icon className="w-10 h-10 text-blue-600 mb-4 transform group-hover:scale-125 transition-transform" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 px-4 relative" id="features">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mb-4">
              Premium Features
            </h2>
            <p className="text-xl text-gray-600">Everything you need to master programming</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                title: 'Structured Learning Path',
                desc: 'Follow our carefully designed curriculum that takes you from basics to advanced Python programming concepts.',
                color: 'from-blue-100/60 to-blue-50/40'
              },
              {
                icon: GraduationCap,
                title: 'AI-Powered Tutoring',
                desc: 'Get personalized help from our advanced AI tutors available 24/7 to answer your questions and guide your learning.',
                color: 'from-violet-100/60 to-blue-50/40'
              },
              {
                icon: Brain,
                title: 'Interactive Practice',
                desc: 'Learn by doing with our interactive coding environment and real-time feedback on your solutions.',
                color: 'from-blue-100/60 to-violet-50/40'
              }
            ].map((feature, i) => (
              <div
                key={i}
                onMouseEnter={() => setHoveredCard(i)}
                onMouseLeave={() => setHoveredCard(null)}
                className={`group relative p-8 rounded-3xl bg-gradient-to-br ${feature.color} border border-blue-300/40 backdrop-blur-xl transition-all duration-500 transform shadow-lg shadow-blue-200/40 ${
                  hoveredCard === i ? 'scale-105 border-blue-400/70 shadow-2xl shadow-blue-300/50' : ''
                }`}
              >
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400/0 via-transparent to-violet-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center mb-6 transform group-hover:scale-125 transition-transform ${
                    hoveredCard === i ? 'shadow-lg shadow-blue-400/60' : ''
                  }`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-700 text-lg">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { num: '10k+', label: 'Active Students' },
              { num: '500+', label: 'Code Examples' },
              { num: '24/7', label: 'Support' },
              { num: '100%', label: 'Success Rate' }
            ].map((stat, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-gradient-to-br from-white/60 via-blue-50/40 to-white/30 border border-blue-300/50 backdrop-blur-xl text-center hover:border-blue-400/70 transition-all duration-300 shadow-lg shadow-blue-200/30"
              >
                <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mb-2">{stat.num}</p>
                <p className="text-gray-700">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-24 px-4 relative" id="cta">
        <div className="max-w-4xl mx-auto">
          <div className="relative p-12 rounded-3xl bg-gradient-to-br from-blue-500/25 via-white/40 to-violet-500/15 border border-blue-400/50 backdrop-blur-xl overflow-hidden group shadow-2xl shadow-blue-300/40">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-blue-300/10 to-violet-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <div className="relative z-10 text-center">
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Start Learning Today</h2>
              <p className="text-xl text-gray-700 mb-10">
                Join thousands of students mastering Python with AI-powered personalized tutoring.
              </p>
              <button 
                onClick={() => navigate('/signup')}
                className="px-10 py-4 rounded-xl bg-gradient-to-r from-blue-500 to-violet-600 text-white font-semibold text-lg hover:from-blue-600 hover:to-violet-700 transition-all duration-300 shadow-lg shadow-blue-300/50 transform hover:scale-105 inline-flex items-center gap-2">
                Create Free Account
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-blue-300/40 bg-white/70 backdrop-blur-xl text-gray-700 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent mb-4">AiTutor</h3>
              <p className="text-sm text-gray-600">Making Python education accessible through cutting-edge AI technology.</p>
            </div>
            {[
              { title: 'Product', links: ['Features', 'Pricing', 'Courses'] },
              { title: 'Resources', links: ['Blog', 'Docs', 'Community'] },
              { title: 'Legal', links: ['Privacy', 'Terms', 'Cookies'] }
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-gray-900 font-semibold mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors text-sm">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-8 border-t border-blue-300/40 text-center text-gray-600 text-sm">
            <p>&copy; {new Date().getFullYear()} AiTutor. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Home;