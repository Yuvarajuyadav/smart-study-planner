from datetime import datetime, timezone

def now_iso():
    return datetime.now(timezone.utc).isoformat()

def build_student(data: dict) -> dict:
    """Validate and build a student document."""
    errors = {}
    name = (data.get('studentName') or '').strip()
    if not name:
        errors['studentName'] = 'Student name is required.'

    num = data.get('numSubjects')
    try:
        num = int(num)
        if num < 1:
            raise ValueError
    except (TypeError, ValueError):
        errors['numSubjects'] = 'Number of subjects must be at least 1.'

    hours = data.get('studyHours')
    try:
        hours = float(hours)
        if hours < 0.5 or hours > 24:
            raise ValueError
    except (TypeError, ValueError):
        errors['studyHours'] = 'Study hours must be between 0.5 and 24.'

    preferred = (data.get('preferredTime') or '').strip()
    if preferred not in ('morning', 'afternoon', 'evening', 'night'):
        errors['preferredTime'] = 'Select a valid preferred study time.'

    days = data.get('studyDays', [])
    if not isinstance(days, list) or len(days) == 0:
        errors['studyDays'] = 'Select at least one study day.'

    if errors:
        return None, errors

    doc = {
        'studentName':   name,
        'numSubjects':   num,
        'studyHours':    hours,
        'preferredTime': preferred,
        'studyDays':     days,
        'updatedAt':     now_iso(),
    }
    return doc, {}


def build_subject(data: dict) -> dict:
    """Validate and build a subject document."""
    errors = {}

    subject = (data.get('subject') or '').strip()
    if not subject:
        errors['subject'] = 'Subject name is required.'

    topic = (data.get('topic') or '').strip()
    if not topic:
        errors['topic'] = 'Topic is required.'

    deadline = (data.get('deadline') or '').strip()
    if not deadline:
        errors['deadline'] = 'Deadline is required.'

    difficulty = (data.get('difficulty') or '').strip()
    if difficulty not in ('Easy', 'Medium', 'Hard'):
        errors['difficulty'] = 'Difficulty must be Easy, Medium, or Hard.'

    try:
        progress = int(data.get('progress', 0))
        if progress < 0 or progress > 100:
            raise ValueError
    except (TypeError, ValueError):
        errors['progress'] = 'Progress must be between 0 and 100.'
        progress = 0

    try:
        est_hours = float(data.get('estimatedHours', 0))
        if est_hours < 0.5:
            raise ValueError
    except (TypeError, ValueError):
        errors['estimatedHours'] = 'Estimated hours must be at least 0.5.'
        est_hours = 1

    if errors:
        return None, errors

    doc = {
        'subject':        subject,
        'topic':          topic,
        'deadline':       deadline,
        'difficulty':     difficulty,
        'progress':       progress,
        'estimatedHours': est_hours,
        'updatedAt':      now_iso(),
    }
    return doc, {}
