# Intellex - AI-Powered Company Intelligence Platform

Intellex is an autonomous AI-powered platform that researches a company from public sources, generates a professional intelligence report, and allows users to chat with an AI grounded in that report.

## 🚀 Features

- **Website Intelligence:** Deep-crawl analysis of products, services, and tech stack.
- **Competitor Analysis:** Identifies market competitors automatically.
- **AI-Powered Synthesis:** Generates a highly structured, 14-section markdown intelligence report with SWOT analysis using OpenRouter.
- **PDF Export:** Downloads beautifully formatted reports instantly.
- **Interactive Chat:** Ask follow-up questions grounded in the generated company data.

## 🛠 Tech Stack

### Frontend
- **Framework:** React + Vite
- **Styling:** TailwindCSS v3
- **Animations:** Framer Motion
- **Icons:** Lucide React

### Backend
- **Framework:** FastAPI (Python 3.12+)
- **Scraping:** BeautifulSoup4, Serper API
- **AI Generation:** OpenRouter
- **PDF Generation:** fpdf2

## 📦 Local Development

### Prerequisites
- Node.js (v18+)
- Python (3.10+)
- [Serper API Key](https://serper.dev/)

### 1. Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory:
```env
SERPER_API_KEY=your_serper_key_here
```

Start the backend:
```bash
uvicorn main:app --reload
```

### 2. Setup Frontend
```bash
cd frontend
npm install
```

Start the frontend:
```bash
npm run dev
```

Open `http://localhost:5173` in your browser. Enter a company name, website, and an OpenRouter API key to start!
