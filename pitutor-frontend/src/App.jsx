import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import SignupForm from "./pages/Signup"
import Login from "./pages/Login";
import ChatPage from "./pages/ChatPage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<SignupForm />} />
        <Route path="/login" element={<Login />} />
        <Route path="/chat/:userId" element={<ChatPage />} />
      </Routes>
    </Router>
  );
}

export default App;
