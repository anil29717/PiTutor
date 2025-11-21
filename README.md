# **PiTutor - AI-Powered Python Tutor**  

PiTutor is an AI-driven interactive learning platform designed to teach children the fundamentals of Python programming. It provides a **child-friendly interface**, AI-powered chat assistance, and real-time feedback to enhance the learning experience.

---

## ** Features**  

 **AI-Powered Chat** � Get real-time Python coding assistance powered by OpenAI/Gemini APIs.  
 **Interactive Learning** � Engage with a conversational AI tutor in a user-friendly chat interface.  
 **User Authentication** � Secure login and signup system with JWT tokens.  
 **Chat History** � Save and revisit previous coding discussions.  
 **User Dashboard** � Track learning progress and activity.  
 **Admin Panel** � Monitor platform statistics and user activity.  
 **Mobile Responsive** � Fully optimized for desktop and mobile devices.  

---

## ** Tech Stack**  

| **Technology**  | **Usage** |
|----------------|----------|
| React 18.3 + Vite 6.0 | Frontend Development |
| Tailwind CSS 4.0 | UI Styling |
| Node.js + Express 4.21 | Backend API |
| MongoDB + Mongoose 8.9 | Database |
| OpenAI/Gemini API | AI Chatbot |
| JWT & Bcrypt | Security |
| CORS & Cookie-Parser | Cross-Origin & Sessions |

---

## ** Project Structure**

\\\
PiTutor/
 pitutor-frontend/               # React (Vite) Frontend
    src/
       pages/
          Home.jsx
          ChatPage.jsx
          Login.jsx
          Signup.jsx
          Admin.jsx
       App.jsx, main.jsx
       App.css, index.css
    public/
    package.json
 pitutor-backend/                # Node.js + Express
    models/  (User, Chat, Activity)
    routes/  (auth, chat, admin)
    server.js
    package.json
 .gitignore
 README.md
\\\

---

## ** Quick Start**

### **Prerequisites**
- Node.js v14+
- npm/yarn
- MongoDB (local or MongoDB Atlas)
- OpenAI/Gemini API keys

### **Setup Backend**

\\\sh
cd pitutor-backend
npm install
\\\

Create \.env\:
\\\
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/pitutor
JWT_SECRET=your_secret_key
OPENAI_API_KEY=sk-your-key
PORT=5000
NODE_ENV=development
\\\

Start:
\\\sh
node server.js
\\\

### **Setup Frontend**

\\\sh
cd pitutor-frontend
npm install
npm run dev
\\\

---

## ** Available Scripts**

**Frontend:**
- \
pm run dev\ - Dev server on http://localhost:5173
- \
pm run build\ - Production build
- \
pm run lint\ - ESLint

**Backend:**
- \
ode server.js\ - Start server on http://localhost:5000

---

## ** API Endpoints**

### **Auth** (/api/auth)
- POST /signup - Register user
- POST /login - Login user
- POST /logout - Logout
- GET /me - Get current user

### **Chat** (/api/chat)
- POST /send - Send message
- GET /history/:userId - Get chat history
- DELETE /:chatId - Delete message

### **Admin** (/api/admin)
- GET /stats - Platform stats
- GET /users - List users
- GET /activity - Activity logs

---

## ** Environment Variables**

\\\.env
# MongoDB
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/pitutor

# JWT
JWT_SECRET=your_secret_key_here

# APIs
OPENAI_API_KEY=sk-your-key
GEMINI_API_KEY=your-key

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
\\\

---

## ** Deployment**

### **Frontend (Vercel)**
\\\sh
cd pitutor-frontend
npm run build
vercel
\\\

### **Backend (Vercel)**
\\\sh
cd pitutor-backend
vercel
\\\

---

## ** Troubleshooting**

### **MongoDB Issues**
- Ensure MongoDB is running
- Check MONGO_URI in .env
- Whitelist IP in MongoDB Atlas

### **CORS Errors**
- Backend accepts requests from http://localhost:5173
- Update CORS origin in server.js if needed

### **Port Already in Use**
- Backend: Change PORT in .env
- Frontend: Vite auto-selects next port

### **Dependencies Issues**
\\\sh
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
\\\

---

## ** Resources**

- React: https://react.dev
- Vite: https://vitejs.dev
- Express: https://expressjs.com
- MongoDB: https://docs.mongodb.com
- Mongoose: https://mongoosejs.com
- Tailwind: https://tailwindcss.com

---

## ** Contributors**

- **Aman raj* - Full Stack Developer

---

## ** License**

MIT License

---

## ** Contributing**

1. Fork the repository
2. Create feature branch: \git checkout -b feature/Name\
3. Commit changes: \git commit -m 'Add feature'\
4. Push to branch: \git push origin feature/Name\
5. Open a Pull Request

---

### ** Star the Repo!**

If you find this helpful, please  star the repository! 

**Happy Learning! **
