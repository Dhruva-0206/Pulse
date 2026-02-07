# 🫀 Pulse / PulseAI

**Smart Nutrition Tracking with AI Assistance**

Pulse is a full-stack nutrition and calorie tracking web application that makes daily food logging simple, accurate, and human-friendly.  
PulseAI is an integrated AI assistant that allows users to log meals and update profile details using natural language.

---

## 🚀 Key Highlights

- Full-stack architecture (React + Node.js + PostgreSQL)
- AI-powered chat-based food logging
- USDA food database integration
- Custom food creation and management
- Daily, historical, and detailed nutrition tracking
- Clean, minimal, responsive UI

---

## ✨ Features

### 🔐 Authentication
- User registration and login
- JWT-based authentication
- Protected routes and secure sessions

---

### 📊 Dashboard
- Daily calorie intake overview
- Protein, carbs, fat, and fiber tracking
- Target vs consumed progress bars
- Today’s logged foods with delete option

---

### 🍽️ Food Logging
- Search foods from the USDA database
- Add and manage custom foods
- Log food quantities in grams
- Automatic calorie and macro calculations

---

### 📅 History
- View nutrition data by date
- Daily totals for calories and macros
- Clean, readable log view

---

### 📈 Detailed Tracking
- Expanded macro breakdown
- Micronutrient tracking (USDA foods)
- Visual progress indicators for vitamins and minerals

---

### 🧍 Profile Management
- Age, gender, height, weight
- Activity level and fitness goal
- Automatic calorie and macro target calculation
- Secure password change

---

### 🤖 PulseAI (AI Assistant)
- Chat-based food logging  
  _Example: “2 rotis and paneer”_
- Automatically creates foods if missing
- Updates user profile through chat
- Friendly, non-medical responses
- Safe fallbacks for unclear inputs

---

## 🧠 How PulseAI Works

PulseAI uses a **two-step AI flow**:

1. **Intent Understanding**
   - Detects whether the user wants to chat, log food, update profile, or delete logs
   - Extracts food names, quantities, and profile details

2. **Execution Layer**
   - Matches foods with custom or USDA data
   - Fetches or estimates nutrition when required
   - Logs food or updates profile securely in the database

The AI is intentionally kept **lightweight, safe, and human-like** — no medical advice or exaggerated claims.

---

## 🛠️ Tech Stack

### Frontend
- React (Vite)
- React Router
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- Gemini API (Google Generative AI)

### Database
- PostgreSQL
- USDA FoodData Central dataset
- Custom food and user profile tables

---

## 📂 Project Structure (High Level)

client/
└─ src/
├─ pages/
├─ components/
├─ api/
└─ assets/

server/
├─ controllers/
├─ routes/
├─ middleware/
├─ services/
├─ utils/
└─ db.js

---

## 🔒 Security & Design Choices

- Passwords hashed using bcrypt
- JWT tokens for stateless authentication
- User data isolated by user ID
- AI responses validated before execution
- No direct AI access to the database

---

## 🎯 Why This Project?

This project was built to:
- Practice real-world full-stack development
- Explore AI-assisted user experiences
- Work with large-scale nutrition datasets
- Design clean and scalable backend logic
- Build something genuinely useful

---

## 🚧 Future Improvements

- Personalized micronutrient targets
- Weekly and monthly analytics
- Food image recognition
- Voice-based food logging
- Cloud deployment and Docker support

---

## 👤 Author

**Dhruva Chakrabarty**  
