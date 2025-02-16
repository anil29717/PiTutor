# **PiTutor - AI-Powered Python Tutor**  

PiTutor is an AI-driven interactive learning platform designed to teach children the fundamentals of Python programming. It provides a **child-friendly interface**, AI-powered chat assistance, and real-time feedback to enhance the learning experience.

---

## **🚀 Features**  

✅ **AI-Powered Chat** – Get real-time Python coding assistance.  
✅ **Interactive Learning** – Engage with a conversational AI tutor.  
✅ **User Authentication** – Secure login and signup system.  
✅ **Chat History** – Save and revisit previous coding discussions.  
✅ **Cloud Storage** – Store user interactions for personalized learning.  
✅ **Mobile Responsive** – Optimized for all devices.  

---

## **🛠️ Tech Stack**  

| **Technology**  | **Usage** |
|----------------|----------|
| React + Vite  | Frontend Development |
| Tailwind CSS  | UI Styling |
| Node.js + Express | Backend API |
| MongoDB + Mongoose | Database |
| OpenAI/Gemini API | AI Chatbot Integration |
| Cloudinary | Image & Video Storage |
| Vercel | Deployment |

---

## **📂 Project Structure**  

```
PiTutor/
│── frontend/        # React (Vite) Frontend
│── backend/         # Node.js + Express API
│── models/          # Database Schema (MongoDB)
│── routes/          # API Routes
│── controllers/     # Business Logic
│── public/          # Static Assets
│── .env             # Environment Variables
│── package.json     # Dependencies
│── vercel.json      # Vercel Deployment Config
└── README.md        # Project Documentation
```

---

## **⚡ Installation & Setup**  

### **1️⃣ Clone the Repository**  
```sh
git clone https://github.com/anil29717/PiTutor
cd PiTutor
```

### **2️⃣ Install Dependencies**  
#### *Frontend*  
```sh
cd frontend
npm install
npm run dev
```

#### *Backend*  
```sh
cd backend
npm install
npm start
```

---

## **🚀 Deployment**  

### **Frontend (Vercel)**
1. Install Vercel CLI:  
   ```sh
   npm install -g vercel
   ```
2. Deploy:  
   ```sh
   vercel
   ```

### **Backend (Vercel)**
1. Add `vercel.json` for backend deployment.  
2. Deploy using Vercel CLI:  
   ```sh
   vercel
   ```

---

## **🛠️ API Endpoints**  

| **Method** | **Endpoint** | **Description** |
|------------|-------------|----------------|
| `POST` | `/api/auth/signup` | User Registration |
| `POST` | `/api/auth/login` | User Login |
| `GET` | `/api/chat/:userId` | Fetch Chat History |
| `POST` | `/api/chat/send` | Send a Chat Message |
| `POST` | `/api/upload` | Upload Image/Files |

---

## **🔐 Environment Variables**  
Create a `.env` file in the **backend** directory:  
```
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
OPENAI_API_KEY=your_openai_api_key
CLOUDINARY_URL=your_cloudinary_url
```

---

## **📸 Screenshots**  

| Landing Page  | Chat Interface  |
|--------------|---------------|
| ![Landing](/pitutor-frontend/public/Vite%20+%20React%20-%20Google%20Chrome%2016-02-2025%2021_12_13.png) | ![Chat](/pitutor-frontend/public/Vite%20+%20React%20-%20Google%20Chrome%2016-02-2025%2021_11_59.png) |

---

## **👥 Contributors**  
- **[Anil Kumar](https://github.com/anil29717)** - Full Stack Developer  

---

## **📜 License**  
This project is licensed under the **MIT License**.  

---

### **🌟 Star the Repo & Contribute!**  
If you find this project helpful, don't forget to ⭐ the repository! 🎉