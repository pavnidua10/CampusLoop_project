<div align="center">

# 🎓 CampusLoop

**Connecting college students with peers, mentors, and alumni — all in one place.**

![Live Demo]: https://campusloop-project.onrender.com
<img width="1041" height="466" alt="image" src="https://github.com/user-attachments/assets/5be6700b-82be-4498-8484-c55fff7f8afe" />

<img width="1365" height="552" alt="Screenshot 2026-04-27 183328" src="https://github.com/user-attachments/assets/5d4e6204-99e8-40fb-8e53-a8d9cdbb85b0" />

<img width="1365" height="588" alt="Screenshot 2026-04-27 183126" src="https://github.com/user-attachments/assets/793a750b-dd13-4479-a485-3f01fd550681" />

<img width="1363" height="614" alt="Screenshot 2026-04-27 183232" src="https://github.com/user-attachments/assets/3660976e-8db1-4559-a2d0-0e44febebc06" />
<img width="1365" height="550" alt="Screenshot 2026-04-27 183202" src="https://github.com/user-attachments/assets/38645ce9-b224-4403-bac3-929ef9236433" />


</div>

---

## 📌 About

CampusLoop is a full-stack MERN social platform built for college students. It brings together peers, mentors, and alumni in a single space designed to foster collaboration, peer learning, and open conversation — with real-time chat, AI-powered tools, and a structured mentorship system.

---

## ✨ Features

### 🔐 Authentication
- Secure signup and login using **JWT**
- Registration includes email, password, username, college name, year of study, and course — so the platform can personalise your experience from day one

### 📰 Tabbed Feed System
- **Explore** — browse all public posts from students across campuses
- **Same College** — posts filtered to your institution
- **Same Course** — posts filtered to your field of study
- Engage with posts through **likes and comments**

### 💬 Real-Time Chat
- One-to-one messaging powered by **Socket.IO**
- Instant delivery with live connection status

### 🤝 Mentorship
- Students can browse and choose mentors from alumni or senior students
- **1:1 mentorship chat** for personalised guidance
- Mentors can schedule tasks and set goals for their mentees

### 🧑‍🏫 Mentor Dashboard
- Upload resources: PDFs, study materials, and Google Drive links
- Post **anonymous question prompts** so students can ask freely without hesitation

### 🧠 Student's Corner (AI-Powered)
- Upload any file — notes, question papers, study material
- Get an **AI-generated summary PDF**, important questions sheet, or structured study guide instantly
- Powered by an integrated AI pipeline on the backend

### Search Users
- Search users to chat and connect

### Notifications


### 🤖 CampusLoop AI Chatbot
- A built-in chatbot to answer academic queries, platform help, and general student questions

### 👤 Profile Management
- Edit profile photo, bio, college, and course details anytime

### 📱 Responsive UI
- Clean, mobile-friendly design built with **Tailwind CSS** and **DaisyUI**

---

## 🛠 Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React.js, React Router, React Query, Tailwind CSS, DaisyUI, Socket.IO Client |
| **Backend** | Node.js, Express.js, Socket.IO Server, JWT, Cloudinary |
| **Database** | MongoDB with Mongoose |
| **AI** | Groq API (chatbot + document intelligence) |
| **Deployment** | Render (frontend + backend), MongoDB Atlas |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas URI
- Cloudinary account
- Groq API key

### Installation

```bash
# Clone the repository
git clone https://github.com/pavnidua10/CampusLoop_project.git
cd CampusLoop_project

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```



<div align="center">
  Made with ❤️ for students, by students
</div>

## 🚧 Future Enhancements

- Admin panel for moderation
- College-based student leaderboard
- group chat feature
- Scheduled sessions with mentors



