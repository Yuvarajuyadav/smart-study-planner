from flask import Blueprint, request, jsonify
from bson import ObjectId
from config import get_db
from models import build_subject, now_iso

subjects_bp = Blueprint('subjects', __name__)

def _fmt(doc):
    doc['_id'] = str(doc['_id'])
    if 'studentId' in doc and isinstance(doc['studentId'], ObjectId):
        doc['studentId'] = str(doc['studentId'])
    return doc

@subjects_bp.get('/subjects')
def get_subjects():
    student_id = request.args.get('studentId')
    db = get_db()
    query = {}
    if student_id:
        try:
            query['studentId'] = ObjectId(student_id)
        except Exception:
            return jsonify({'success': False, 'error': 'Invalid studentId'}), 400
    docs = list(db.subjects.find(query).sort('createdAt', 1))
    return jsonify({'success': True, 'subjects': [_fmt(d) for d in docs]})


@subjects_bp.post('/subjects')
def add_subject():
    data = request.get_json(silent=True) or {}
    doc, errors = build_subject(data)
    if errors:
        return jsonify({'success': False, 'errors': errors}), 400

    student_id = data.get('studentId')
    if student_id:
        try:
            doc['studentId'] = ObjectId(student_id)
        except Exception:
            return jsonify({'success': False, 'error': 'Invalid studentId'}), 400

    doc['createdAt'] = now_iso()
    db = get_db()
    result = db.subjects.insert_one(doc)
    created = db.subjects.find_one({'_id': result.inserted_id})
    return jsonify({'success': True, 'subject': _fmt(created)}), 201


@subjects_bp.put('/subjects/<subject_id>')
def update_subject(subject_id):
    try:
        oid = ObjectId(subject_id)
    except Exception:
        return jsonify({'success': False, 'error': 'Invalid ID'}), 400

    data = request.get_json(silent=True) or {}
    # Allow partial update (e.g., only progress)
    update_fields = {}
    if 'subject' in data:
        update_fields['subject'] = data['subject']
    if 'topic' in data:
        update_fields['topic'] = data['topic']
    if 'deadline' in data:
        update_fields['deadline'] = data['deadline']
    if 'difficulty' in data:
        update_fields['difficulty'] = data['difficulty']
    if 'progress' in data:
        update_fields['progress'] = int(data['progress'])
    if 'estimatedHours' in data:
        update_fields['estimatedHours'] = float(data['estimatedHours'])
    update_fields['updatedAt'] = now_iso()

    db = get_db()
    result = db.subjects.update_one({'_id': oid}, {'$set': update_fields})
    if result.matched_count == 0:
        return jsonify({'success': False, 'error': 'Subject not found'}), 404
    updated = db.subjects.find_one({'_id': oid})
    return jsonify({'success': True, 'subject': _fmt(updated)})


@subjects_bp.delete('/subjects/<subject_id>')
def delete_subject(subject_id):
    try:
        oid = ObjectId(subject_id)
    except Exception:
        return jsonify({'success': False, 'error': 'Invalid ID'}), 400
    db = get_db()
    result = db.subjects.delete_one({'_id': oid})
    if result.deleted_count == 0:
        return jsonify({'success': False, 'error': 'Subject not found'}), 404
    return jsonify({'success': True, 'message': 'Subject deleted'})
