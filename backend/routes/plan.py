from flask import Blueprint, request, jsonify
from bson import ObjectId
from datetime import datetime, timezone
from config import get_db

plan_bp = Blueprint('plan', __name__)

def _calc_priority(subject):
    try:
        deadline_date = datetime.strptime(subject['deadline'], '%Y-%m-%d')
        deadline_date = deadline_date.replace(tzinfo=timezone.utc)
        days_left = (deadline_date - datetime.now(timezone.utc)).days
    except Exception:
        days_left = 999

    if days_left <= 0:
        deadline_score = 100
    elif days_left <= 3:
        deadline_score = 80
    elif days_left <= 7:
        deadline_score = 60
    elif days_left <= 14:
        deadline_score = 40
    else:
        deadline_score = 20

    diff_map = {'Hard': 50, 'Medium': 30, 'Easy': 10}
    diff_score = diff_map.get(subject.get('difficulty', 'Easy'), 10)

    progress_score = 100 - int(subject.get('progress', 0))

    return deadline_score + diff_score + progress_score, days_left

def _priority_label(score):
    if score >= 150: return 'Critical'
    if score >= 120: return 'High'
    if score >= 90:  return 'Medium'
    return 'Low'

def _build_times(preferred_time, count):
    bases = {'morning': 6, 'afternoon': 13, 'evening': 18, 'night': 21}
    start_hour = bases.get(preferred_time, 18)
    times = []
    cur = start_hour * 60
    for _ in range(count):
        h = cur // 60
        m = cur % 60
        end = cur + 60
        eh, em = end // 60, end % 60
        def fmt(hh, mm):
            period = 'PM' if hh >= 12 else 'AM'
            h12 = hh % 12 or 12
            return f"{h12}:{mm:02d} {period}"
        times.append(f"{fmt(h, m)} – {fmt(eh, em)}")
        cur += 75
    return times


@plan_bp.get('/plan')
def get_plan():
    student_id = request.args.get('studentId')
    db = get_db()

    query = {}
    if student_id:
        try:
            query['studentId'] = ObjectId(student_id)
        except Exception:
            pass

    subjects = list(db.subjects.find(query))
    if not subjects:
        return jsonify({'success': True, 'tasks': [], 'message': 'No subjects found'})

    # Get student setup for preferred time
    setup = None
    if student_id:
        try:
            setup = db.students.find_one({'_id': ObjectId(student_id)})
        except Exception:
            pass

    preferred_time = (setup or {}).get('preferredTime', 'evening')
    study_hours = float((setup or {}).get('studyHours', 3))

    # Score and sort subjects
    scored = []
    for s in subjects:
        score, days_left = _calc_priority(s)
        scored.append((score, days_left, s))
    scored.sort(key=lambda x: x[0], reverse=True)

    # Build tasks (all subjects appear)
    times = _build_times(preferred_time, len(scored))
    tasks = []
    for i, (score, days_left, s) in enumerate(scored):
        tasks.append({
            'id':       str(s['_id']),
            'subject':  s['subject'],
            'topic':    s['topic'],
            'deadline': s['deadline'],
            'priority': _priority_label(score),
            'score':    score,
            'daysLeft': days_left,
            'progress': s.get('progress', 0),
            'time':     times[i],
            'duration': '60 min',
        })

    return jsonify({'success': True, 'tasks': tasks, 'preferredTime': preferred_time, 'studyHours': study_hours})


@plan_bp.get('/dashboard')
def get_dashboard():
    student_id = request.args.get('studentId')
    db = get_db()

    query = {}
    if student_id:
        try:
            query['studentId'] = ObjectId(student_id)
        except Exception:
            pass

    subjects = list(db.subjects.find(query))
    setup = None
    if student_id:
        try:
            setup = db.students.find_one({'_id': ObjectId(student_id)})
            if setup:
                setup['_id'] = str(setup['_id'])
        except Exception:
            pass

    total = len(subjects)
    avg_progress = round(sum(int(s.get('progress', 0)) for s in subjects) / total, 1) if total else 0
    completed_subjects = sum(1 for s in subjects if int(s.get('progress', 0)) >= 100)
    now = datetime.now(timezone.utc)

    def days_left(s):
        try:
            d = datetime.strptime(s['deadline'], '%Y-%m-%d').replace(tzinfo=timezone.utc)
            return (d - now).days
        except Exception:
            return 999

    upcoming = []
    for s in sorted(subjects, key=lambda x: x.get('deadline', '')):
        dl = days_left(s)
        if 0 <= dl <= 7:
            upcoming.append({
                'id':       str(s['_id']),
                'subject':  s['subject'],
                'topic':    s['topic'],
                'deadline': s['deadline'],
                'daysLeft': dl,
            })

    subject_progress = []
    for s in subjects:
        pct = int(s.get('progress', 0))
        subject_progress.append({
            'id':       str(s['_id']),
            'subject':  s['subject'],
            'topic':    s['topic'],
            'progress': pct,
            'deadline': s['deadline'],
            'daysLeft': days_left(s),
        })

    study_hours_week = 0
    if setup:
        study_hours_week = float(setup.get('studyHours', 0)) * len(setup.get('studyDays', []))

    return jsonify({
        'success': True,
        'stats': {
            'totalSubjects':     total,
            'avgProgress':       avg_progress,
            'completedSubjects': completed_subjects,
            'upcomingCount':     len(upcoming),
            'studyHoursWeek':    study_hours_week,
        },
        'subjectProgress': subject_progress,
        'upcoming':        upcoming,
        'setup':           setup,
    })
