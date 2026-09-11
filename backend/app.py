import os
from flask import Flask, jsonify
from flask_cors import CORS
from config import PORT, get_db
from routes.students import students_bp
from routes.subjects import subjects_bp
from routes.plan     import plan_bp

app = Flask(__name__)

# Allow any origin in production (update with your actual Vercel URL for better security)
CORS(app, resources={r'/api/*': {'origins': '*'}})

app.register_blueprint(students_bp, url_prefix='/api')
app.register_blueprint(subjects_bp, url_prefix='/api')
app.register_blueprint(plan_bp,     url_prefix='/api')

@app.errorhandler(404)
def not_found(e):
    return jsonify({'success': False, 'error': 'Route not found'}), 404

@app.errorhandler(500)
def server_error(e):
    return jsonify({'success': False, 'error': 'Internal server error'}), 500

if __name__ == '__main__':
    try:
        db = get_db()
        db.command('ping')
        print(f'MongoDB connected to {db.name}')
    except Exception as ex:
        print(f'WARNING: Could not connect to MongoDB: {ex}')
    print(f'Starting Flask on http://localhost:{PORT}')
    app.run(debug=False, port=PORT, host='0.0.0.0')
