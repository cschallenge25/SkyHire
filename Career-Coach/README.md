# 🤖 SkyHire AI Module - Career Matching & Coaching System

## Overview

The AI Module powers **SkyHire's** intelligent career matching and coaching system, providing personalized job recommendations and AI-powered career guidance. This module combines advanced NLP processing with machine learning to deliver accurate job-candidate matching and real-time career coaching.

---

## 📚 Documentation Files

- **AI_PLAN.md** - Complete development plan IA (1-15 November 2025)
- **TIMELINE.md** - Detailed timeline and meeting schedule
- **TEAM_STRUCTURE.md** - Organizational structure and roles
- **DELIVERABLES.md** - Complete list of expected deliverables

---

## 🚀 Key Features

- **🧠 Smart Job Matching** - AI-powered job recommendations based on skills, experience, and preferences
- **💬 Career Coach Chatbot** - Interactive AI assistant providing CV advice, interview tips, and career guidance
- **📊 Market Analysis** - Real-time job market insights and trends
- **🎯 Personalized Profiles** - Tailored recommendations based on comprehensive user profiles
- **⚡ Real-time Processing** - Sub-500ms response times for all API calls

---

## 🏗️ AI Module Architecture

```
ai-module/
├── data/
│   ├── raw_jobs.csv              # Raw job data from SkyHire
│   ├── cleaned_jobs.csv          # Processed data
│   ├── user_profiles.json        # User profiles for personalization
│   └── chatbot_faq.json          # Career coach knowledge base
│
├── preprocessing/
│   ├── cleaner.py                # Text cleaning and deduplication
│   ├── feature_integration.py    # NLP + metadata feature fusion
│   └── nlp_preprocessing.py      # Tokenization, lemmatization, stopwords
│
├── models/
│   ├── job_match_model.pkl       # ML model for recommendations
│   ├── vectorizer.pkl            # TF-IDF vectorizer
│   ├── similarity.py             # Semantic similarity calculations
│   └── chatbot_model.pkl         # Career coach AI model
│
├── chatbot/
│   ├── intent_classifier.py      # Detects user intentions
│   ├── response_generator.py     # Generates responses (FAQ + Gemini API)
│   ├── dialogue_manager.py       # Manages conversation flow
│   └── context_memory.json       # User context storage
│
├── api/
│   ├── main.py                   # FastAPI server entry point
│   ├── routes/
│   │   ├── recommendations.py    # Job recommendation endpoints
│   │   ├── analysis.py           # Market analysis endpoints
│   │   └── chatbot.py            # Career coach endpoints
│   └── schemas.py                # Pydantic models
│
├── utils/
│   ├── config.yaml               # Configuration
│   ├── evaluate.py               # Performance evaluation
│   ├── logger.py                 # Logging
│   └── constants.py              # Constants
│
└── tests/
    ├── test_recommendations.py   # Job matching tests
    ├── test_chatbot_api.py       # Chatbot integration tests
    ├── test_preprocessing.py     # Data cleaning tests
    └── conftest.py               # Pytest configuration
```

---

## ⚙️ Setup & Installation

### Prerequisites

- Python 3.10+ (3.11+ recommended)
- MongoDB
- Gemini API key

### Installation Steps

```bash
# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your configuration

# Start the API
uvicorn api.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- Main: http://localhost:8000
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 📡 API Endpoints

### Career Coach Chatbot

**POST** `/api/chatbot/chat`

Request:
```json
{
  "user_id": "user_123",
  "message": "How can I improve my CV for cabin crew positions?",
  "session_id": "session_456",
  "metadata": {}
}
```

Response:
```json
{
  "response": "For cabin crew positions, focus on...",
  "session_id": "session_456",
  "intent": "CV_Advice",
  "confidence": 0.95,
  "suggestions": ["CV Templates", "Interview Tips", "Job Opportunities"],
  "metadata": {
    "timestamp": "2025-11-04T23:26:33.828334",
    "intent_confidence": 0.95,
    "response_source": "generated"
  }
}
```

### Job Recommendations

**POST** `/api/recommendations/jobs`

Request:
```json
{
  "user_profile": {
    "skills": ["safety procedures", "customer service", "multilingual"],
    "experience_years": 3,
    "preferred_locations": ["Dubai", "Qatar"],
    "salary_range": [2000, 5000]
  }
}
```

### Market Analysis

**GET** `/api/analysis/trends?region=middle_east&role=cabin_crew`

---

## 💬 Chatbot Supported Intents

| Intent | Description |
|--------|-------------|
| CV_Advice | CV optimization and formatting |
| Interview_Tips | Interview preparation techniques |
| Job_Matching | Job opportunities and recommendations |
| Flight_Training | Training and certification guidance |
| Career_Development | Career growth and advancement |
| General_Info | General aviation career information |

---

## 🧪 Testing

```bash
# Run all tests
pytest tests/ -v

# Run specific test categories
pytest tests/test_chatbot_api.py -v
pytest tests/test_recommendations.py -v

# Run with coverage
pytest --cov=api --cov=models tests/
```

---

## 👥 Team Structure

| Name | Role | Responsibility |
|------|------|-----------------|
| **Raef Gaied** | Team Lead & AI Architect | Architecture, coordination, integration |
| **Houssem Eddine Kamel** | NLP Specialist | Embeddings, text processing |
| **Siwar Ajmi** | ML Engineer | Model training, optimization |
| **Malek Sridi** | Data Engineer | Data collection, cleaning |
| **Eya Ghoul** | Backend Engineer | FastAPI integration |
| **Oumaima Zmantar** | Feature Engineer | Feature engineering |

---

## 📅 Development Timeline

- **Phase 1 (Nov 1-3):** Architecture & Design
- **Phase 2 (Nov 4-6):** Integration & Development
- **Phase 3 (Nov 7-10):** Optimization & Testing
- **Phase 4 (Nov 11-15):** Deployment & Documentation

---

## 🔐 Security & Privacy

### Data Protection

- All user data encrypted at rest (AES-256)
- TLS 1.3 for data in transit
- MongoDB role-based access control
- Regular security audits

### API Security

```python
# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://skyhire.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Rate limiting
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.post("/chat")
@limiter.limit("100/minute")
async def chat_endpoint(request: ChatRequest):
    # Protected endpoint
    pass
```

### Compliance

- GDPR compliant data handling
- User consent management
- Data retention policies (30-day cleanup)
- Audit logs for all operations

---

## 🔄 Data Flow & Integration Points

### Complete Data Pipeline

```
User Input
    ↓
[Intent Classifier] → Detect user intention
    ↓
[Context Manager] → Retrieve conversation history
    ↓
[NLP Processing] → Generate embeddings (Houssem's team)
    ↓
[Feature Engineering] → Extract features from user profile
    ↓
[ML Model] → Calculate matching scores
    ↓
[Response Generator] → Generate personalized response
    ↓
[API Response] → Return to frontend
    ↓
[Context Storage] → Save conversation data
```

### Integration with External Services

| Service | Purpose | Endpoint | Status |
|---------|---------|----------|--------|
| **NLP Team** | Embeddings & text processing | `/nlp/embeddings` | Active |
| **Database** | User & job data storage | MongoDB | Active |
| **Gemini API** | Advanced response generation | `api.generativeai.google.com` | Active |
| **Analytics** | Performance tracking | Internal | Planning |

---

## 🛡️ Risk Management & Contingency Plans

### Identified Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|-----------|
| NLP API delays | High | Medium | Cache embeddings, fallback mode |
| Low model accuracy | High | Low | Additional training data, model tuning |
| MongoDB downtime | Critical | Low | Automated backups, replica sets |
| API rate limiting | Medium | Medium | Queue system, load balancing |
| Data quality issues | Medium | Medium | Data validation, cleaning pipeline |

### Contingency Plans

1. **NLP Service Failure**
   - Use cached embeddings
   - Fall back to keyword matching
   - Alert team for recovery

2. **Database Failure**
   - Automatic failover to replica
   - Read from cache for recent queries
   - Queue write operations

3. **High Response Times**
   - Load balancing across instances
   - Response caching
   - Asynchronous processing for heavy tasks

---

## 📈 Success Criteria & Acceptance Tests

### Phase 1 - Data Preparation

- [ ] 1000+ job listings collected and cleaned
- [ ] User profile schema validated
- [ ] NLP embeddings integrated successfully
- [ ] Data quality score > 95%

### Phase 2 - Model Development

- [ ] ML model accuracy > 85%
- [ ] Training time < 2 hours
- [ ] Model inference time < 100ms
- [ ] Cross-validation score consistent

### Phase 3 - API & Integration

- [ ] All endpoints functioning correctly
- [ ] Response time < 500ms for 95% of requests
- [ ] Chatbot accuracy > 80%
- [ ] CORS properly configured

### Phase 4 - Testing & Deployment

- [ ] Unit test coverage > 80%
- [ ] Integration tests passing 100%
- [ ] Load tests passed (1000 concurrent users)
- [ ] Security audit passed

---

## 📞 Communication & Meeting Schedule

### Weekly Standups

- **Monday 10:00 AM** - Team sync (All members)
- **Wednesday 2:00 PM** - Inter-team coordination (Leads)
- **Friday 4:00 PM** - Progress review (Leads + stakeholders)

### Key Meetings

| Date | Time | Topic | Attendees |
|------|------|-------|-----------|
| Nov 1 | 10:00 AM | Project Kick-off | All teams |
| Nov 3 | 2:00 PM | Architecture Review | Raef, Houssem, Mehdi |
| Nov 6 | 10:00 AM | NLP Integration | Raef, Houssem, Eya |
| Nov 10 | 2:00 PM | Model Evaluation | Raef, Siwar, Malek |
| Nov 13 | 10:00 AM | Security Review | Raef, Rayen |
| Nov 15 | 3:00 PM | Final Demo | All stakeholders |

### Decision-Making Process

1. **Technical Decisions:** Reviewed by Raef + relevant specialist
2. **Architecture Changes:** Approved by Raef + Mehdi Ben Ammeur
3. **Security Issues:** Escalated to Rayen Arous immediately
4. **Timeline Adjustments:** Discussed in standups, approved by all leads

---

## 🔐 Security & Privacy

### Data Protection

- All user data encrypted at rest (AES-256)
- TLS 1.3 for data in transit
- MongoDB role-based access control
- Regular security audits

### API Security

```python
# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://skyhire.com"],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

# Rate limiting
from slowapi import Limiter
limiter = Limiter(key_func=get_remote_address)

@app.post("/chat")
@limiter.limit("100/minute")
async def chat_endpoint(request: ChatRequest):
    # Protected endpoint
    pass
```

### Compliance

- GDPR compliant data handling
- User consent management
- Data retention policies (30-day cleanup)
- Audit logs for all operations

---

## 🧠 Technical Decision Log

### Decision 1: FastAPI vs Flask

**Date:** November 1, 2025  
**Decision:** Use FastAPI  
**Rationale:** Better performance, built-in async support, automatic API documentation

### Decision 2: ML Model Selection

**Date:** November 3, 2025  
**Decision:** RandomForest + Cosine Similarity  
**Rationale:** Good accuracy, interpretable, fast inference

### Decision 3: Caching Strategy

**Date:** November 5, 2025  
**Decision:** Redis for embeddings, local cache for responses  
**Rationale:** Reduce API calls to NLP service, improve response times

---

## 📞 Key Contacts

- **Leader IA:** Raef Ghaied
- **NLP Lead:** Houssem Eddine Kamel
- **DEV Lead:** Mehdi Ben Ammeur
- **Cyber Lead:** Rayen Arous
- **CV Lead:** Mehdi Zmantar

---

## 📝 Important Dates

- **Start Date:** 1st November 2025
- **End Date:** 15th November 2025
- **Duration:** 15 days
- **Kick-off Meeting:** Monday, Nov 1st at 10:00 AM

---

## 🐛 Troubleshooting

**Port Already in Use:**
```bash
lsof -i :8000
kill -9 <PID>
```

**Gemini API Key Error:**
```bash
pip install google-generativeai
```

**MongoDB Connection Failed:**
```bash
sudo systemctl start mongod
```

---

## 📚 Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [Scikit-learn Guide](https://scikit-learn.org/)
- [MongoDB Best Practices](https://docs.mongodb.com/)
- [Google Gemini API Docs](https://ai.google.dev/)

---

## 📝 Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Nov 4, 2025 | Initial documentation |
| 1.1 | Nov 4, 2025 | Added monitoring, deployment, risk management |
| 1.2 | Nov 4, 2025 | Updated project name to SkyHire |
| 1.3 | Nov 15, 2025 | Added Resume Job Matching API documentation |

---

## 🎯 Resume Job Matching API

### Overview

The Resume Job Matching API provides intelligent CV analysis against job descriptions using semantic similarity and keyword extraction. This module transforms the Streamlit resume matching application into a robust FastAPI service.

### Features

- **PDF Resume Processing**: Extract and analyze text from PDF resumes
- **Semantic Similarity Analysis**: Use SentenceTransformer models for accurate matching
- **Keyword Extraction**: Identify key skills and requirements
- **Match Scoring**: Calculate fit percentage with detailed feedback
- **CSV Report Generation**: Export analysis results for further processing

### API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/v1/resume-match/` | GET | API information |
| `/api/v1/resume-match/analyze` | POST | Analyze resume vs job description |
| `/api/v1/resume-match/analyze/text` | POST | Test with text input |
| `/api/v1/resume-match/download-report` | POST | Generate CSV report |

### Files to Share with Development Team

#### 1. **Main Router File** (Most Important)
- **File**: `api/routes/resume_match.py`
- **Purpose**: Contains all job matching endpoints and logic
- **Content**: API routes, Pydantic models, helper functions

#### 2. **Updated Main Application**
- **File**: `api/main.py`
- **Purpose**: Integrates the resume matching router
- **Changes**: Added import and router inclusion

#### 3. **Standalone Reference** (Optional)
- **File**: `api/resume_match_api.py`
- **Purpose**: Complete standalone version for reference
- **Usage**: Can run independently for testing

### How to Share the API

#### Option 1: Git Repository (Recommended)
```bash
# Commit and push changes
git add api/routes/resume_match.py api/main.py
git commit -m "Add resume job matching API endpoints"
git push origin main
# Share repository URL with team lead
```

#### Option 2: File Copy
```bash
# Create sharing folder
mkdir job-match-api
# Copy essential files
copy api\routes\resume_match.py job-match-api\
copy api\main.py job-match-api\
# Compress and share
zip -r job-match-api.zip job-match-api/
```

#### Option 3: Direct File Transfer
- Send `api/routes/resume_match.py` (primary)
- Send updated `api/main.py`
- Include `requirements.txt` for dependencies

### Dependencies Required

```bash
pip install fastapi uvicorn PyPDF2 nltk sentence-transformers pandas
```

### How to Run the API

```bash
# Navigate to project directory
cd ai-module

# Start the server
uvicorn api.main:app --reload --port 8000

# Access documentation
# Swagger UI: http://localhost:8000/docs
# ReDoc: http://localhost:8000/redoc
```

### API Usage Examples

#### Analyze Resume with PDF Upload
```bash
curl -X POST "http://localhost:8000/api/v1/resume-match/analyze" \
  -H "Content-Type: multipart/form-data" \
  -F "resume_file=@resume.pdf" \
  -F "job_description=Senior Python Developer with 5+ years experience..." \
  -F "num_keywords=10"
```

#### Test with Text Input
```bash
curl -X POST "http://localhost:8000/api/v1/resume-match/analyze/text" \
  -H "Content-Type: application/json" \
  -d '{
    "job_description": "Senior Python Developer with 5+ years experience...",
    "num_keywords": 10
  }'
```

### Response Format

```json
{
  "match_score": 75.5,
  "fit_level": "Good Fit",
  "message": " Good Fit: Your CV aligns fairly well",
  "color": "#ffa726",
  "keyword_analysis": {
    "present_keywords": ["python", "development", "experience"],
    "missing_keywords": ["django", "aws", "docker"],
    "match_percentage": 60.0
  },
  "resume_text": "Experienced software engineer...",
  "job_text": "Senior Python Developer..."
}
```

### Integration Notes for Development Team

1. **File Structure**: The API follows FastAPI best practices with separate router files
2. **Model Loading**: SentenceTransformer model loads once at startup
3. **Error Handling**: Comprehensive error responses with proper HTTP status codes
4. **Validation**: Pydantic models ensure request/response consistency
5. **Performance**: Asynchronous processing for better scalability

### Testing the API

```bash
# Health check
curl http://localhost:8000/health

# API info
curl http://localhost:8000/api/v1/resume-match/

# Test endpoint (no file required)
curl -X POST "http://localhost:8000/api/v1/resume-match/analyze/text" \
  -H "Content-Type: application/json" \
  -d '{"job_description": "Software engineer position requiring Python skills"}'
```

### Important Notes for Team Lead

- **Primary File**: `api/routes/resume_match.py` contains all matching logic
- **Dependencies**: Ensure all required packages are installed
- **Model Download**: First run may download NLP models (takes ~1 minute)
- **Port Configuration**: Default port is 8000, can be changed in uvicorn command
- **Documentation**: Auto-generated Swagger docs available at `/docs`

---

**Last Updated:** November 15, 2025
**Version:** 1.3.0
**Project Name:** SkyHire AI Module
**Maintainer:** Raef Ghaied
