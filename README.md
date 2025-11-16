# 🚀 SkyHire - AI-Powered Aviation Recruitment Platform

<div align="center">

**Revolutionizing Aviation Recruitment with Artificial Intelligence**

[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.2-61dafb.svg)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20-green.svg)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED.svg)](https://www.docker.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248.svg)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

</div>

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Architecture](#-architecture)
- [Technologies](#-technologies)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Services](#-services)
- [AI Features](#-ai-features)
- [Documentation](#-documentation)
- [Contributing](#-contributing)
- [License](#-license)

## 🌟 Overview

**SkyHire** is a comprehensive AI-powered recruitment platform specifically designed for the aviation industry. It combines cutting-edge artificial intelligence, natural language processing, and real-time communication to streamline the hiring process for airlines, aviation companies, and cabin crew candidates.

### 🎯 Mission

To transform aviation recruitment by providing intelligent matching, automated CV parsing, AI-powered interview simulations, and personalized career coaching - all in one unified platform.

## ✨ Key Features

### 🤖 AI-Powered Interview Simulator
- **Real-time Voice Interview** using Google Gemini 2.5 Flash Live API
- Natural conversation with AI recruiter specialized in aviation
- Instant feedback on communication skills, confidence, and relevance
- Scenario-based behavioral questions for cabin crew positions
- Audio bidirectionnel with native audio support

### 📄 Intelligent CV Parser
- Advanced OCR technology with CRAFT and PaddleOCR
- Automatic extraction of personal info, education, experience, and skills
- NER (Named Entity Recognition) for structured data extraction
- Support for multiple CV formats (PDF, images)
- Smart matching with job requirements

### 💼 Smart Job Matching
- AI-powered job recommendation engine
- Skills-based matching algorithm
- Compatibility scoring for each position
- Real-time job alerts and notifications
- Application tracking system

### 💬 Career Coach Chatbot
- AI assistant powered by Google Gemini
- Personalized career advice for aviation professionals
- Interview preparation tips and techniques
- Resume optimization recommendations
- FAQs about cabin crew careers

### 🔐 Complete Authentication System
- JWT-based secure authentication
- Role-based access control (Candidate/Recruiter)
- Profile management and customization
- Social login integration ready

### 📊 Real-time Chat & Networking
- Socket.io powered real-time messaging
- Direct communication between recruiters and candidates
- Professional networking features
- Group conversations and notifications

### 📈 Analytics & Dashboard
- Comprehensive candidate dashboard
- Application status tracking
- Interview performance metrics
- Recruiter analytics for hiring decisions

## 🏗️ Architecture

SkyHire follows a modern **microservices architecture** with a React frontend and multiple Node.js backend services orchestrated with Docker Compose.

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Port 3000)                │
│  ┌─────────┬─────────┬─────────┬─────────┬─────────────┐   │
│  │Dashboard│  Jobs   │   CV    │Interview│   Chat      │   │
│  └─────────┴─────────┴─────────┴─────────┴─────────────┘   │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              API Gateway (Port 5000)                         │
│              Routing & Load Balancing                        │
└────────┬──────────┬──────────┬──────────┬──────────┬────────┘
         │          │          │          │          │
    ┌────▼────┐┌───▼────┐┌───▼────┐┌───▼────┐┌────▼─────┐
    │  Auth   ││  User  ││  Job   ││   CV   ││Interview │
    │ Service ││Service ││Service ││Service ││  Service │
    │  :5001  ││ :5007  ││ :5005  ││ :5003  ││  :5004   │
    └─────────┘└────────┘└────────┘└────────┘└──────────┘
         │          │          │          │          │
    ┌────▼────┐┌───▼────┐┌───▼────┐┌───▼────┐┌────▼─────┐
    │  Chat   ││ Notif. ││CV Parser││Interview││  Career  │
    │ Service ││Service ││ Service ││  Token  ││  Coach   │
    │  :5002  ││ :5006  ││ :5010   ││  :5008  ││          │
    └─────────┘└────────┘└────────┘└─────────┘└──────────┘
         │          │          │          │
         └──────────┴──────────┴──────────┘
                    │
              ┌─────▼─────┐
              │  MongoDB  │
              │   :27017  │
              └───────────┘
```

## 💻 Technologies

### Frontend
- **React 19.2** - Modern UI library
- **TypeScript 4.9** - Type-safe development
- **Tailwind CSS 3** - Utility-first styling
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **React Router v6** - Navigation
- **Lottie React** - Animations
- **Vega/Vega-Lite** - Data visualization

### Backend Services
- **Node.js 20** - Runtime environment
- **Express.js** - Web framework
- **MongoDB 7.0** - Database
- **Socket.io** - WebSocket server
- **JWT** - Authentication
- **Mongoose** - ODM for MongoDB
- **Docker & Docker Compose** - Containerization

### AI & ML
- **Google Gemini 2.5 Flash** - Live audio AI for interviews
- **Google Gemini Pro** - Career coaching chatbot
- **PaddleOCR** - OCR for CV parsing
- **CRAFT** - Text detection
- **spaCy** - NER for CV extraction
- **scikit-learn** - Job matching algorithms

### DevOps
- **Docker** - Container platform
- **Docker Compose** - Multi-container orchestration
- **Git** - Version control
- **GitHub** - Code repository

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Docker Desktop** installed and running
- **Git** for version control
- **Google Gemini API Key** (for AI features)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/cschallenge25/SkyHire.git
cd SkyHire
```

2. **Configure Backend Environment**
```bash
cd backend
cp .env.example .env
# Edit .env and add your credentials
```

Required environment variables:
```env
# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Google Gemini API
GEMINI_API_LIVE_TOKEN=your_gemini_api_key_here

# MongoDB
MONGODB_URI=mongodb://localhost:27017/skyhire

# Service Ports
API_GATEWAY_PORT=5000
AUTH_SERVICE_PORT=5001
CHAT_SERVICE_PORT=5002
CV_SERVICE_PORT=5003
INTERVIEW_SERVICE_PORT=5004
JOB_SERVICE_PORT=5005
NOTIFICATIONS_SERVICE_PORT=5006
USER_SERVICE_PORT=5007
INTERVIEW_TOKEN_SERVICE_PORT=5008
CV_PARSER_SERVICE_PORT=5010
```

3. **Start Backend Services**
```bash
cd backend
docker-compose up -d
```

Wait for all services to be healthy (~30 seconds).

4. **Configure Frontend**
```bash
cd ..
cp .env.example .env
```

```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_INTERVIEW_TOKEN_URL=http://localhost:5008
REACT_APP_SOCKET_CHAT_PATH=/socket.io/chat
REACT_APP_SOCKET_INTERVIEW_PATH=/socket.io/interview
```

5. **Install Frontend Dependencies**
```bash
npm install
```

6. **Start Frontend Development Server**
```bash
npm start
```

The application will open at **http://localhost:3000**

### Quick Test

Run the diagnostic script to verify all services:
```bash
node scripts/test-interview-simulator.js
```

Expected output:
```
✅ MongoDB: OK (200)
✅ API Gateway: OK (200)
✅ Interview Token Service: OK (200)
✅ Interview Service: OK (200)
✅ Token Generation: OK
```

## 📁 Project Structure

```
SkyHire/
├── backend/                      # Microservices backend
│   ├── api-gateway/             # API Gateway & routing
│   ├── auth-service/            # Authentication & authorization
│   ├── user-service/            # User profiles & management
│   ├── job-service/             # Job postings & applications
│   ├── cv-service/              # CV management
│   ├── cv_parser/               # AI CV parsing service
│   ├── chat-service/            # Real-time messaging
│   ├── interview-service/       # Interview sessions
│   ├── interviewToken-service/  # Gemini token generation
│   ├── notifications-service/   # Push notifications
│   └── docker-compose.yml       # Services orchestration
│
├── src/                         # React frontend source
│   ├── components/              # Reusable UI components
│   ├── pages/                   # Application pages
│   │   ├── Dashboard.tsx        # Main dashboard
│   │   ├── JobsPage.tsx         # Job listings
│   │   ├── CVPage.tsx           # CV management
│   │   ├── InterviewPage.tsx    # AI interview simulator
│   │   ├── ChatPage.tsx         # Real-time chat
│   │   ├── ProfilePage.tsx      # User profile
│   │   └── skyrecruiter/        # Interview AI components
│   ├── services/                # API service clients
│   ├── types/                   # TypeScript type definitions
│   └── context/                 # React context providers
│
├── Career-Coach/                # AI Career Coaching Module
│   ├── api/                     # FastAPI backend
│   ├── chatbot/                 # Gemini chatbot logic
│   ├── models/                  # ML models
│   └── preprocessing/           # NLP preprocessing
│
├── SkyHire NLP & Data/          # NLP Models & Datasets
│   ├── data/                    # Training datasets
│   │   ├── raw_cvs/            # 500+ annotated CVs
│   │   ├── cleaned_cvs/        # Preprocessed CVs
│   │   └── cv_ner_format/      # NER training data
│   ├── Model Dev/               # Jupyter notebooks
│   └── scripts/                 # Data processing scripts
│
├── Aeronautics_Chatbot/         # Legacy chatbot (deprecated)
├── public/                      # Static assets
├── docs/                        # Documentation
│   ├── INTERVIEW_SIMULATOR.md   # Interview AI docs
│   └── GIT_SETUP.md            # Git configuration
├── scripts/                     # Utility scripts
│   ├── test-interview-simulator.js
│   └── diagnose-simple.ps1
│
├── package.json                 # Frontend dependencies
├── tsconfig.json               # TypeScript config
├── tailwind.config.js          # Tailwind configuration
└── README.md                   # This file
```

## 🔧 Services

### Core Services

| Service | Port | Description | Tech Stack |
|---------|------|-------------|------------|
| **API Gateway** | 5000 | Routes requests to microservices | Express.js |
| **Auth Service** | 5001 | JWT authentication & authorization | Express + JWT |
| **User Service** | 5007 | User profiles & connections | Express + MongoDB |
| **Job Service** | 5005 | Job postings & applications | Express + MongoDB |
| **CV Service** | 5003 | CV upload & management | Express + Multer |
| **CV Parser** | 5010 | AI CV parsing & extraction | Node.js + Python |
| **Chat Service** | 5002 | Real-time messaging | Socket.io |
| **Interview Service** | 5004 | Interview sessions | Express + MongoDB |
| **Interview Token** | 5008 | Gemini API token generation | Express + @google/genai |
| **Notifications** | 5006 | Push notifications | Express + MongoDB |
| **MongoDB** | 27017 | Database | MongoDB 7.0 |

### AI Services

| Service | Description | AI Model |
|---------|-------------|----------|
| **Interview Simulator** | Real-time voice AI interview | Gemini 2.5 Flash Live API |
| **Career Coach** | Conversational career advisor | Gemini Pro |
| **CV Parser** | OCR + NER extraction | CRAFT + PaddleOCR + spaCy |
| **Job Matching** | Skills-based recommendations | Custom ML algorithm |

## 🤖 AI Features

### 1. AI Interview Simulator (SkyRecruiter)

The crown jewel of SkyHire - a real-time AI recruiter powered by Google Gemini Live API.

**Features:**
- ✅ Natural voice conversation in real-time
- ✅ Specialized aviation recruiter persona
- ✅ Behavioral & situational questions
- ✅ Instant feedback on performance
- ✅ Audio recording capabilities
- ✅ Scoring on clarity, confidence, relevance

**Technology:**
- Google Gemini 2.5 Flash with native audio support
- WebRTC for audio streaming
- Custom prompt engineering for aviation context
- Real-time transcription and analysis

**Usage:**
```typescript
// Navigate to /interview page
// Click "Start Interview"
// Allow microphone access
// AI recruiter will greet and start asking questions
```

### 2. CV Parser with OCR

Intelligent CV parsing using state-of-the-art OCR and NER.

**Capabilities:**
- Extract personal information (name, email, phone)
- Parse education history with dates and degrees
- Identify work experience and responsibilities
- Extract skills and certifications
- Language proficiency detection
- Aviation-specific keyword recognition

**Technology Stack:**
- CRAFT for text detection
- PaddleOCR for text recognition
- spaCy NER for entity extraction
- Custom training on 500+ aviation CVs

### 3. Career Coach Chatbot

AI-powered career advisor using Gemini Pro.

**Features:**
- Interview preparation guidance
- Resume writing tips
- Career path recommendations
- Salary negotiation advice
- Company research assistance
- Aviation industry insights

**Example Interactions:**
```
User: "How should I prepare for a cabin crew interview?"
Coach: "Great question! For cabin crew interviews, focus on..."

User: "What skills are most important for flight attendants?"
Coach: "The top skills airlines look for include..."
```

### 4. Smart Job Matching

ML-based job recommendation system.

**Algorithm:**
- TF-IDF vectorization of job descriptions and CVs
- Cosine similarity scoring
- Skills gap analysis
- Experience level matching
- Location and salary preferences
- Career progression recommendations

## 📚 Documentation

Detailed documentation available in `/docs`:

- **[Interview Simulator Guide](docs/INTERVIEW_SIMULATOR.md)** - Complete guide for the AI interview feature
- **[API Documentation](docs/API.md)** - REST API endpoints reference
- **[Git Setup Guide](docs/GIT_SETUP.md)** - Git configuration and workflow

### Quick Links

- **Frontend:** http://localhost:3000
- **API Gateway:** http://localhost:5000
- **API Health Check:** http://localhost:5000/api/health
- **Interview Token Service:** http://localhost:5008
- **MongoDB:** mongodb://localhost:27017

## 🧪 Testing

### Backend Services Test
```bash
# Test all microservices
node scripts/test-interview-simulator.js

# Test specific service
curl http://localhost:5000/api/health
curl http://localhost:5008/token
```

### Frontend Tests
```bash
npm test
```

### Interview Simulator Test
```bash
# 1. Start backend services
cd backend && docker-compose up -d

# 2. Start frontend
npm start

# 3. Navigate to http://localhost:3000/interview
# 4. Click "Start Interview" and test with your microphone
```

## 🐳 Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Rebuild services
docker-compose up -d --build

# View running containers
docker ps

# View service logs
docker logs skyhire-interview-token-service
docker logs skyhire-interview-service
```

## 🔐 Environment Variables

### Backend (.env)
```env
JWT_SECRET=your_secret_key
GEMINI_API_LIVE_TOKEN=your_gemini_key
MONGODB_URI=mongodb://localhost:27017/skyhire
NODE_ENV=development
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
REACT_APP_INTERVIEW_TOKEN_URL=http://localhost:5008
```

## 🐛 Troubleshooting

### Issue: Services not starting

**Solution:**
```bash
# Check Docker is running
docker info

# Restart Docker Desktop
# Then restart services
cd backend
docker-compose down
docker-compose up -d
```

### Issue: "No token generated"

**Solution:**
- Verify `GEMINI_API_LIVE_TOKEN` in `backend/.env`
- Check token service logs: `docker logs skyhire-interview-token-service`
- Regenerate API key at https://aistudio.google.com/app/apikey

### Issue: MongoDB connection failed

**Solution:**
```bash
# Check MongoDB is running
docker ps | grep mongo

# Restart MongoDB
docker-compose restart mongodb
```

### Issue: Interview simulator not responding

**Solution:**
- Allow microphone access in browser settings
- Use Chrome or Edge (better WebRTC support)
- Check browser console (F12) for errors
- Verify token generation: `curl http://localhost:5008/token`

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Update documentation
- Follow conventional commit messages
- Ensure Docker builds succeed

## 🙏 Acknowledgments

- **Google Gemini API** for providing cutting-edge AI capabilities
- **MongoDB** for the robust database solution
- **Docker** for simplifying deployment
- **Open Source Community** for the amazing tools and libraries
---

- **Email:** contact@skyhire.com
- **GitHub:** [@cschallenge25](https://github.com/cschallenge25)

---
