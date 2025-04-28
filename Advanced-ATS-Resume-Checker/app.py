import os
import logging
import tempfile
import requests
from bs4 import BeautifulSoup
import fitz  # PyMuPDF
import docx
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
# from google.generativeai import configure, GenerativeModel


# --- Setup ---
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- Constants ---
ALLOWED_EXTENSIONS = {"pdf", "docx"}
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

# --- Utilities ---
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(pdf_path):
    text = ""
    try:
        with fitz.open(pdf_path) as doc:
            for page in doc:
                text += page.get_text("text")
    except Exception as e:
        logger.error(f"Error extracting text from PDF: {e}")
    return text

def extract_text_from_docx(docx_path):
    text = ""
    try:
        doc = docx.Document(docx_path)
        for para in doc.paragraphs:
            text += para.text + "\n"
    except Exception as e:
        logger.error(f"Error extracting text from DOCX: {e}")
    return text

def get_gemini_output(resume_text, job_description, analysis_type):
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    if analysis_type == "Quick Scan":
        if job_description:
            
            prompt = f"""
            You are a ResumeChecker, an expert in resume analysis. Provide a quick scan of the following resume:
            
            1. Is the resume fit for the job description provided?
            2. Identify the most suitable profession for this resume.
            3. List 3 key strengths of the resume.
            4. Suggest 2 quick improvements.
            5. Give an overall ATS score out of 100 based on the job description and keep the score precise and flexible. Title for this point in this format(Overall ATS Score (out of 100): score)
            
            Resume text: {resume_text}
            Job description (if provided): {job_description}
            """
        else:
            prompt = f"""
            You are a ResumeChecker, an expert in resume analysis. Provide a quick scan of the following resume:
            
            1. Identify the most suitable profession for this resume.
            2. List 3 key strengths of the resume.
            3. Suggest 2 quick improvements.
            4. Give an overall ATS score out of 100 based on the job description and keep the score precise and flexible. Title for this point in this format(Overall ATS Score (out of 100): score)
            
            Resume text: {resume_text}
            Job description (if provided): {job_description}
            """
    elif analysis_type == "Detailed Analysis":
        if job_description:
            prompt = f"""
            You are a ResumeChecker, an expert in resume analysis. Provide a detailed analysis of the following resume:
            
            1. Is the resume fit for the job description provided?
            2. Identify the most suitable profession for this resume.
            3. List 5 strengths of the resume.
            4. Suggest 3-5 areas for improvement with specific recommendations.
            5. Rate the following aspects out of 10: Impact, Brevity, Style, Structure, Skills.
            6. Provide a brief review of each major section (e.g., Summary, Experience, Education).
            7. Give an overall ATS score out of 100 based on the job description and keep the score precise and flexible. Title for this point in this format(Overall ATS Score (out of 100): score)
            
            Resume text: {resume_text}
            Job description (if provided): {job_description}
            """
        else:
            prompt = f"""
            You are a ResumeChecker, an expert in resume analysis. Provide a detailed analysis of the following resume:
            
            1. Identify the most suitable profession for this resume.
            2. List 5 strengths of the resume.
            3. Suggest 3-5 areas for improvement with specific recommendations.
            4. Rate the following aspects out of 10: Impact, Brevity, Style, Structure, Skills.
            5. Provide a brief review of each major section (e.g., Summary, Experience, Education).
            6. Give an overall ATS score out of 100 based on the job description and keep the score precise and flexible. Title for this point in this format(Overall ATS Score (out of 100): score)
            
            Resume text: {resume_text}
            Job description (if provided): {job_description}
            """
    else:
        if job_description:
            prompt = f"""
            You are a ResumeChecker, an expert in ATS optimization. Analyze the following resume and provide optimization suggestions:
            
            1. Is the resume fit for the job description provided?
            2. Identify keywords from the job description that should be included in the resume.
            3. Suggest reformatting or restructuring to improve ATS readability.
            4. Recommend changes to improve keyword density without keyword stuffing.
            5. Provide 3-5 bullet points on how to tailor this resume for the specific job description.
            6. Give an overall ATS score out of 100 based on the job description and keep the score precise and flexible. Title for this point in this format(Overall ATS Score (out of 100): score)
            
            Resume text: {resume_text}
            Job description: {job_description}
            """
        else:
            prompt = f"""
            You are a ResumeChecker, an expert in ATS optimization. Analyze the following resume and provide optimization suggestions:
            
            1. Identify keywords from the job description that you think would be suitable for this resume that should be included in the resume.
            2. Suggest reformatting or restructuring to improve ATS readability.
            3. Recommend changes to improve keyword density without keyword stuffing.
            4. Provide 3-5 bullet points on how to tailor this resume for the suitable job description.
            5. Give an overall ATS score out of 100 based on the job description and keep the score precise and flexible. Title for this point in this format(Overall ATS Score (out of 100): score)
            
            Resume text: {resume_text}
            Job description: {job_description}
            """

    
    try:
        response = model.generate_content(prompt)
        return response.text if hasattr(response, 'text') else "No response received."
    except Exception as e:
        logger.error(f"Error in AI processing: {e}")
        return "Error in AI processing."

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

def generate_study_plan_with_gemini(role, weeks):
    """
    Generates a study plan using Google Gemini API for the given role and duration.
    """
    prompt = f"""
    Generate a {weeks}-week structured interview preparation plan for a {role}.
    
    Below is the format to generate the preparation plan, not necessary to generate only 3 points the goal is to generate a complete a study plan.
    Do not type asterisks but in the Resources part do type the bullet points '•' for each point . Give it in simple plain text without any bold or anything.

    ## 4-Week Software Engineer Study Plan

        Week 1: Data Structures & Algorithms Fundamentals
        Key Topics: Arrays, Linked Lists, Stacks, Queues, Basic Sorting Algorithms
        Resources:
        • Book: "Cracking the Coding Interview" by Gayle Laakmann McDowell
        • Website: LeetCode - Easy problems focusing on arrays and linked lists
        Daily Practice:
        1. Two Sum (LeetCode #1)
        2. Valid Parentheses (LeetCode #20)
        3. Reverse Linked List (LeetCode #206)

        Week 2: Advanced Data Structures
        Key Topics: Trees, Graphs, Hash Tables, Heaps
        Resources:
        • Book: "Introduction to Algorithms" by Cormen, Leiserson, Rivest, and Stein
        • Website: HackerRank - Data Structures track
        Daily Practice:
        1. Maximum Depth of Binary Tree (LeetCode #104)
        2. Implement Queue using Stacks (LeetCode #232)
        3. Valid Anagram (LeetCode #242)

        Week 3: System Design & Architecture
        Key Topics: API Design, Database Design, Scalability, Caching
        Resources:
        • Book: "System Design Interview" by Alex Xu
        • Website: GitHub - donnemartin/system-design-primer
        Daily Practice:
        1. Design a URL shortening service
        2. Design a simple social media feed
        3. Design a distributed key-value store

        Week 4: Programming Languages & Web Development
        Key Topics: JavaScript/TypeScript, React, Node.js, RESTful APIs
        Resources:
        • Book: "Clean Code" by Robert C. Martin
        • Website: MDN Web Docs for JavaScript reference
        Daily Practice:
        1. Build a simple CRUD application
        2. Implement authentication in a web app
        3. Create a responsive dashboard with React

    """

    try:
        model = genai.GenerativeModel("gemini-1.5-flash") 
        response = model.generate_content(prompt)
        return response.text if hasattr(response, 'text') else str(response)
    except Exception as e:
        return f"Error: {e}"

# --- Endpoints ---

@app.route("/")
def home():
    return "SkillScan ATS is running!"

@app.route("/analyze", methods=["POST"])
def analyze_resume():
    if "resume" not in request.files:
        return jsonify({"error": "No file part in request"}), 400

    file = request.files["resume"]
    if file.filename == "":
        return jsonify({"error": "No selected file"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Unsupported file type. Upload a PDF or DOCX."}), 400

    filename = secure_filename(file.filename)
    temp_dir = tempfile.mkdtemp()
    file_path = os.path.join(temp_dir, filename)
    file.save(file_path)
    
    logger.info(f"File {filename} uploaded successfully.")

    if filename.endswith(".pdf"):
        extracted_text = extract_text_from_pdf(file_path)
    else:
        extracted_text = extract_text_from_docx(file_path)

    if not extracted_text:
        return jsonify({"error": "Failed to extract text from the resume."}), 500

    job_description = request.form.get("job_description", "")
    analysis_type = request.form.get("analysis_option", "Quick Scan")
    analysis_result = get_gemini_output(extracted_text, job_description, analysis_type)
    return jsonify({"analysis": analysis_result})

@app.route("/get-interview-questions", methods=["POST"])
def fetch_interview_questions():
    data = request.json
    if not data or 'role' not in data:
        return jsonify({"error": "Invalid request. No role specified."}), 400

    role = data['role']
    if role not in ROLE_URLS:
        return jsonify({"error": "Invalid role selected."}), 400

    result = get_interview_questions_and_answers(ROLE_URLS[role])
    return jsonify(result)

@app.route("/get-answer", methods=["POST"])
def fetch_answer():
    data = request.json
    if not data or 'question' not in data:
        return jsonify({"error": "Invalid request. No question specified."}), 400

    return jsonify({"answer": "Refer to the question list, as answers are scraped together."})

@app.route('/generate-study-plan', methods=['POST'])
def create_study_plan():
    data = request.json
    
    role = data.get('role', 'Software Engineer')
    weeks = int(data.get('weeks', 4))
    study_plan = generate_study_plan_with_gemini(role, weeks)
    print(study_plan)
    response = {
        "role": role,
        "weeks": weeks,
        "plan": study_plan
    }
    
    return jsonify(response)

# --- Run ---
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
