import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, GraduationCap, Brain, ArrowRight } from 'lucide-react';

const Home = () => {
  const navigate = useNavigate();
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const messages = [
    "Master Python Programming",
    "Learn from AI-Powered Tutors",
    "Build Real-World Projects"
  ];

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const userId = JSON.parse(storedUser).userId;
      if (userId) {
        navigate(`/chat/${encodeURIComponent(userId)}`);
      }
    }
  }, [navigate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % messages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white border-b border-gray-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex gap-2 items-center">
              <img src='/logo.png' className='w-8 h-8'></img>
              <h1 
                onClick={() => navigate("/")} 
                className="text-2xl font-bold text-violet-900 cursor-pointer hover:text-blue-700"
              >
                PiTutor
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate("/login")}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 font-medium"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-24 pb-16 px-4 sm:pt-32 sm:pb-24">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
            Accelerate Your Programming Journey
          </h2>
          <div className="h-8 mb-8">
            <p className="text-xl sm:text-2xl text-blue-600 font-medium transition-opacity duration-500">
              {messages[currentMessageIndex]}
            </p>
          </div>
          <button
            onClick={() => navigate("/signup")}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium gap-2"
          >
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-gray-50 hover:shadow-lg transition-shadow duration-300">
              <BookOpen className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Structured Learning Path
              </h3>
              <p className="text-gray-600">
                Follow our carefully designed curriculum that takes you from basics to advanced Python programming concepts.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-gray-50 hover:shadow-lg transition-shadow duration-300">
              <GraduationCap className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                AI-Powered Tutoring
              </h3>
              <p className="text-gray-600">
                Get personalized help from our advanced AI tutors available 24/7 to answer your questions and guide your learning.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-gray-50 hover:shadow-lg transition-shadow duration-300">
              <Brain className="w-12 h-12 text-blue-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                Interactive Practice
              </h3>
              <p className="text-gray-600">
                Learn by doing with our interactive coding environment and real-time feedback on your solutions.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-blue-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Start Your Learning Journey Today
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of students who are already learning Python programming with PiTutor.
          </p>
          <button
            onClick={() => navigate("/signup")}
            className="px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200 font-medium"
          >
            Create Free Account
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-white text-lg font-semibold mb-4">PiTutor</h3>
              <p className="text-sm">
                Making Python programming education accessible to everyone through AI-powered learning.
              </p>
            </div>
            <div>
              <h4 className="text-white text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Courses</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-lg font-semibold mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white text-lg font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center">
            <p>&copy; {new Date().getFullYear()} PiTutor. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;