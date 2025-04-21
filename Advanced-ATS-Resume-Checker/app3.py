from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import google.generativeai as genai
import os

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

genai.configure(api_key="AIzaSyDT8Su1LbmAHd407-xe7upzTje-qX3rLyM")
def generate_study_plan_with_gemini(role, weeks):
    """
    Generates a study plan using Google Gemini API for the given role and duration.
    """
    prompt = f"""
    Generate a {weeks}-week structured interview preparation plan for a {role}.
    Include:
    - Key topics to cover each week.
    - Recommended learning resources (articles, books, or videos).
    - 2-3 daily practice problems from platforms like LeetCode, CodeSignal, or GeeksforGeeks.
    - Ensure the topics are well-distributed.
    """

    try:
        model = genai.GenerativeModel("gemini-1.5-pro") 
        response = model.generate_content(prompt)
        return response.text if hasattr(response, 'text') else str(response)
    except Exception as e:
        return f"Error: {e}"

@app.route('/generate-study-plan', methods=['POST'])
def create_study_plan():
    data = request.json
    
    role = data.get('role', 'Software Engineer')
    weeks = int(data.get('weeks', 4))
    

    study_plan = generate_study_plan_with_gemini(role, weeks)
    
    response = {
        "role": role,
        "weeks": weeks,
        "plan": study_plan
    }
    
    return jsonify(response)

@app.route("/")
def home():
    return "Flask is running!"

if __name__ == '__main__':
    app.run(host="0.0.0.0", port=5002, debug=True)

