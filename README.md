# Smart Study Planner

A full-stack student productivity app built with React + Flask + MongoDB.

## Live Demo
- Frontend: https://your-app.vercel.app
- Backend API: https://your-api.onrender.com/api/health

## Tech Stack
| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + React Router |
| Backend | Python Flask |
| Database | MongoDB Atlas |
| Frontend Host | Vercel (free) |
| Backend Host | Render (free) |

## Local Development

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

### Backend (.env)
```
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/smart_study_planner
MONGO_DB=smart_study_planner
PORT=5000
```

### Frontend (.env.production)
```
VITE_API_URL=https://your-api.onrender.com/api
```
