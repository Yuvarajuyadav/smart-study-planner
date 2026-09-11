from flask import Blueprint, request, jsonify
from bson import ObjectId
from config import get_db
from models import build_student, now_iso

students_bp = Blueprint('students', __name__)

def _fmt(doc):
    doc['_id'] = str(doc['_id'])
    return doc

@students_bp.get('/health')
def health():
    return jsonify({'status': 'ok', 'message': 'Smart Study Planner API is running'})

@students_bp.post('/students')
def create_or_update_student():
    data = request.get_json(silent=True) or {}
    doc, errors = build_student(data)
    if errors:
        return jsonify({'success': False, 'errors': errors}), 400

    db = get_db()
    student_id = data.get('_id')

    if student_id:
        # Update existing student
        try:
            oid = ObjectId(student_id)
        except Exception:
            return jsonify({'success': False, 'error': 'Invalid student ID'}), 400
        db.students.update_one({'_id': oid}, {'$set': doc})
        updated = db.students.find_one({'_id': oid})
        return jsonify({'success': True, 'student': _fmt(updated)})
    else:
        # Create new student
        doc['createdAt'] = now_iso()
        result = db.students.insert_one(doc)
        created = db.students.find_one({'_id': result.inserted_id})
        return jsonify({'success': True, 'student': _fmt(created)}), 201


@students_bp.get('/students/<student_id>')
def get_student(student_id):
    try:
        oid = ObjectId(student_id)
    except Exception:
        return jsonify({'success': False, 'error': 'Invalid ID'}), 400
    db = get_db()
    doc = db.students.find_one({'_id': oid})
    if not doc:
        return jsonify({'success': False, 'error': 'Student not found'}), 404
    return jsonify({'success': True, 'student': _fmt(doc)})
