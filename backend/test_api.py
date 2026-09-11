"""Quick smoke-test for all API endpoints. Run with: python test_api.py"""
import json
import urllib.request
import urllib.error

BASE = 'http://localhost:5000/api'

def req(method, path, body=None):
    url = BASE + path
    data = json.dumps(body).encode() if body else None
    headers = {'Content-Type': 'application/json'}
    try:
        r = urllib.request.Request(url, data=data, headers=headers, method=method)
        with urllib.request.urlopen(r) as resp:
            result = json.loads(resp.read())
            print(f'  {method} {path} -> {resp.status} OK')
            return result
    except urllib.error.HTTPError as e:
        body = json.loads(e.read())
        print(f'  {method} {path} -> {e.code} ERROR: {body}')
        return body

print('\n=== Smart Study Planner API Tests ===\n')

# Health
print('[1] Health check')
req('GET', '/health')

# Student
print('\n[2] Create student')
r = req('POST', '/students', {
    'studentName': 'Test Student',
    'numSubjects': 3,
    'studyHours': 2.5,
    'preferredTime': 'evening',
    'studyDays': ['Monday', 'Wednesday', 'Friday'],
})
student_id = r.get('student', {}).get('_id')
print(f'   student_id = {student_id}')

# Get student
print('\n[3] Get student')
req('GET', f'/students/{student_id}')

# Add subjects
print('\n[4] Add subjects')
sub_ids = []
for subj, topic, diff in [
    ('Mathematics', 'Calculus', 'Hard'),
    ('Python', 'OOP', 'Medium'),
    ('DBMS', 'Normalization', 'Easy'),
]:
    r = req('POST', '/subjects', {
        'studentId': student_id,
        'subject': subj,
        'topic': topic,
        'deadline': '2026-10-15',
        'difficulty': diff,
        'progress': 30,
        'estimatedHours': 6,
    })
    sub_ids.append(r.get('subject', {}).get('_id'))

# Get subjects
print('\n[5] Get subjects')
req('GET', f'/subjects?studentId={student_id}')

# Update progress
print('\n[6] Update subject progress')
if sub_ids[0]:
    req('PUT', f'/subjects/{sub_ids[0]}', {'progress': 75})

# Study Plan
print('\n[7] Get study plan')
req('GET', f'/plan?studentId={student_id}')

# Dashboard
print('\n[8] Get dashboard')
req('GET', f'/dashboard?studentId={student_id}')

# Delete a subject
print('\n[9] Delete subject')
if sub_ids[-1]:
    req('DELETE', f'/subjects/{sub_ids[-1]}')

print('\n=== All tests complete ===\n')
