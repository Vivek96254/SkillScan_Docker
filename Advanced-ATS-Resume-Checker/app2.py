from flask import Flask, request, jsonify
import requests
from bs4 import BeautifulSoup
from flask_cors import CORS

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*"}})

ROLE_URLS = {
    "Backend Engineer": "https://www.geeksforgeeks.org/backend-developer-interview-questions-and-answers/",
    "AI/ML Engineer": "https://www.geeksforgeeks.org/machine-learning-interview-questions/",
    "MLOps Engineer": "https://www.geeksforgeeks.org/comprehensive-mlops-interview-questions-from-basic-to-advanced/",
    "SDE": "https://www.geeksforgeeks.org/top-50-software-engineering-interview-questions-and-answers/",
    "Frontend Engineer": "https://www.geeksforgeeks.org/front-end-developer-interview-questions/",
    "Fullstack Engineer": "https://www.geeksforgeeks.org/full-stack-developer-interview-questions-and-answers/",
    "Data Analyst": "https://www.geeksforgeeks.org/data-analyst-interview-questions-and-answers/",
    "Data Scientist": "https://www.geeksforgeeks.org/data-science-interview-questions-and-answers/",
    "HR Interview Questions": "https://www.geeksforgeeks.org/top-10-traditional-hr-interview-questions-and-answers/"
}

def get_interview_questions_and_answers(url):
    """Scrapes questions and corresponding answers from the given URL."""
    response = requests.get(url, headers={"User-Agent": "Mozilla/5.0"})
    if response.status_code != 200:
        return {"error": "Failed to fetch questions. Please try again later."}
    
    soup = BeautifulSoup(response.text, 'html.parser')
    questions_answers = []
    

    headings = soup.find_all(["h3"])  
    for heading in headings:
        question = heading.get_text(strip=True)
        if "?" in question or len(question) > 10:
            answer = heading.find_next_sibling("p") 
            
            if answer:
                answer_text = answer.get_text(strip=True)
            else:
                answer_text = "No answer available."

            questions_answers.append({"question": question, "answer": answer_text})

    return {"questions": questions_answers[:20]}  

@app.route('/get-interview-questions', methods=['POST'])
def fetch_interview_questions():
    data = request.json
    if not data or 'role' not in data:
        return jsonify({"error": "Invalid request. No role specified."}), 400
    
    role = data['role']
    if role not in ROLE_URLS:
        return jsonify({"error": "Invalid role selected."}), 400
    
    url = ROLE_URLS[role]
    result = get_interview_questions_and_answers(url)
    
    return jsonify(result)

@app.route('/get-answer', methods=['POST'])
def fetch_answer():
    data = request.json
    if not data or 'question' not in data:
        return jsonify({"error": "Invalid request. No question specified."}), 400
    
    return jsonify({"answer": "Refer to the question list, as answers are scraped together."})

@app.route("/")
def home():
    return "Flask is running!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=True)
