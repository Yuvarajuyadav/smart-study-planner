# Smart Study Planner — Backend

Flask + MongoDB REST API.

## Requirements
- Python 3.9+
- MongoDB running locally (or Atlas URI in .env)

## Setup

```bash
cd backend

# 1. Create virtual environment
python -m venv venv

# Windows
venv\Scripts\activate

# Mac/Linux
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
copy .env.example .env
# Edit .env if needed (default: localhost MongoDB)

# 4. Run the server
python app.py
```

Server runs at: http://localhost:5000

## API Endpoints

| Method | URL | Description |
|--------|-----|-------------|
| GET | /api/health | Health check |
| POST | /api/students | Create/update student |
| GET | /api/students/:id | Get student |
| GET | /api/subjects?studentId= | Get all subjects |
| POST | /api/subjects | Add subject |
| PUT | /api/subjects/:id | Update subject |
| DELETE | /api/subjects/:id | Delete subject |
| GET | /api/plan?studentId= | Get study plan |
| GET | /api/dashboard?studentId= | Get dashboard data |
