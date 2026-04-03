# 🛡️ DeepGuard AI — Real-Time Fake News & Deepfake Detection System

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.111-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.0+-EE4C2C?style=for-the-badge&logo=pytorch&logoColor=white)](https://pytorch.org)

> A production-grade AI system for detecting **fake news articles**, **deepfake videos**, **manipulated images**, and **real-time webcam deepfakes** — with explainable AI outputs.

---

## ✨ Features

| Module | Description | Model |
|--------|-------------|-------|
| 📰 **Fake News Detection** | NLP-based article analysis with live internet cross-referencing and source attribution | DistilBERT + heuristic ensemble |
| 🖼️ **Image Forgery Detection** | Detects manipulated/AI-generated images using forensic analysis | EfficientNet + frequency analysis |
| 🎥 **Video Deepfake Detection** | Frame-by-frame deepfake analysis of uploaded videos | CNN-based temporal analysis |
| 📹 **Real-Time Webcam Detection** | Live webcam feed analysis via WebSocket with instant results | Face detection + deepfake CNN |

### Key Highlights

- 🔬 **Explainable AI** — Transparent confidence scores with detailed forensic breakdowns
- 🌐 **Live Source Verification** — Cross-references claims against real internet sources with attribution links
- ⚡ **Real-Time Processing** — WebSocket-powered live webcam analysis at ~2 FPS
- 📊 **Detection Dashboard** — Visual history of all past analyses with aggregated stats
- 🎯 **High Accuracy** — Calibrated confidence thresholds to minimize false positives

---

## 🏗️ Architecture

```
fake-news-deepfake-detector/
├── backend/                    # FastAPI backend
│   ├── main.py                 # App entry point & lifespan management
│   ├── config.py               # Centralized configuration
│   ├── database.py             # MongoDB integration (optional)
│   ├── model_router.py         # AI model loading & routing
│   ├── confidence_service.py   # Score aggregation & calibration
│   ├── routes/                 # API route handlers
│   │   ├── text_routes.py      # POST /api/detect/text
│   │   ├── image_routes.py     # POST /api/detect/image
│   │   ├── video_routes.py     # POST /api/detect/video
│   │   └── webcam_routes.py    # Webcam session management
│   └── services/               # Business logic layer
│       ├── text_detection_service.py
│       ├── image_detection_service.py
│       ├── video_detection_service.py
│       └── webcam_service.py
├── models/                     # Deep learning models
│   ├── fake_news_model.py      # NLP fake news classifier
│   ├── image_model.py          # Image forgery detector
│   └── deepfake_model.py       # Video deepfake detector
├── websocket/                  # WebSocket handler
│   └── websocket_handler.py    # Real-time webcam processing
├── frontend/                   # React (Vite) frontend
│   └── src/
│       ├── pages/              # Page components
│       │   ├── HomePage.jsx
│       │   ├── TextDetectionPage.jsx
│       │   ├── ImageDetectionPage.jsx
│       │   ├── VideoDetectionPage.jsx
│       │   ├── WebcamDetectionPage.jsx
│       │   └── DashboardPage.jsx
│       ├── components/         # Reusable UI components
│       │   ├── Navbar.jsx
│       │   ├── ConfidenceMeter.jsx
│       │   ├── ResultsCard.jsx
│       │   ├── TextHighlighter.jsx
│       │   ├── UploadBox.jsx
│       │   ├── VideoAnalyzer.jsx
│       │   └── WebcamStream.jsx
│       └── services/           # API client layer
├── model_weights/              # Pre-trained model weights (not in repo)
├── uploads/                    # Temporary upload directory
├── static/                     # Static assets
├── templates/                  # HTML templates
└── requirements.txt            # Python dependencies
```

---

## 🚀 Quick Start

### Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **MongoDB** (optional — app runs without it)

### 1. Clone the repository

```bash
git clone https://github.com/Aman834/fake-news-deepfake-detector.git
cd fake-news-deepfake-detector
```

### 2. Backend Setup

```bash
# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cd ..
```

### 4. Run the Application

**Terminal 1 — Backend (FastAPI):**
```bash
python -m backend.main
# Server runs at http://localhost:8000
# API docs at http://localhost:8000/docs
```

**Terminal 2 — Frontend (Vite + React):**
```bash
cd frontend
npm run dev
# App runs at http://localhost:5173
```

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | System health check |
| `POST` | `/api/detect/text` | Analyze text/article for fake news |
| `POST` | `/api/detect/image` | Analyze uploaded image for manipulation |
| `POST` | `/api/detect/video` | Analyze uploaded video for deepfakes |
| `WS` | `/ws/webcam` | Real-time webcam deepfake detection |
| `GET` | `/api/history` | Get detection history |
| `GET` | `/api/results/{id}` | Get specific result by ID |
| `POST` | `/api/aggregate` | Aggregate multiple detection scores |

---

## 🧠 Models

### Fake News Detection
- **Base Model**: DistilBERT (fine-tuned)
- **Approach**: Multi-signal ensemble combining NLP analysis, writing style patterns, and live internet cross-referencing
- **Output**: Confidence score, claim verification status, source links

### Image Forgery Detection
- **Base Model**: EfficientNet
- **Approach**: Multi-layer forensic analysis including frequency domain analysis, noise pattern detection, and metadata inspection
- **Output**: Confidence score, forensic heatmap, manipulation type

### Video Deepfake Detection
- **Base Model**: Custom CNN with temporal analysis
- **Approach**: Frame-by-frame face extraction and analysis with temporal consistency checks
- **Output**: Per-frame scores, overall confidence, timeline visualization

---

## ⚙️ Configuration

Key settings in `backend/config.py`:

| Setting | Default | Description |
|---------|---------|-------------|
| `PORT` | `8000` | Backend server port |
| `DEBUG` | `true` | Enable debug mode |
| `MAX_FILE_SIZE` | `100MB` | Max upload file size |
| `VIDEO_FRAME_SAMPLE_RATE` | `10` | Extract every Nth frame |
| `FAKE_THRESHOLD` | `0.5` | Classification threshold |
| `MONGODB_URL` | `localhost:27017` | MongoDB connection string |

---

## 🛠️ Tech Stack

**Backend**: FastAPI · Uvicorn · Python 3.10+ · Motor (MongoDB)  
**Frontend**: React 18 · Vite · CSS3  
**ML/AI**: PyTorch · TorchVision · OpenCV · Pillow · scikit-learn  
**Real-Time**: WebSockets · asyncio  
**NLP**: DistilBERT · Custom tokenizers

---

## 📄 License

This project is for educational and research purposes.

---

<p align="center">
  Built with ❤️ by <a href="https://github.com/Aman834">Aman Gupta</a>
</p>
