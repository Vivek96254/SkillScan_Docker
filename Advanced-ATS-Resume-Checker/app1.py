import os
import logging
import tempfile
import fitz  
import docx
from flask import Flask, request, jsonify
from flask_cors import CORS
from google.generativeai import configure, GenerativeModel
from werkzeug.utils import secure_filename

configure(api_key="AIzaSyDT8Su1LbmAHd407-xe7upzTje-qX3rLyM")

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

ALLOWED_EXTENSIONS = {"pdf", "docx"}

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
    model = GenerativeModel("gemini-1.5-flash")
    
    if analysis_type == "Quick Scan":
        if job_description:
            
            prompt = f"""
            You are a ResumeChecker, an expert in resume analysis. Provide a quick scan of the following resume:
            
            1. Is the resume fit for the job description provided?
            2. Identify the most suitable profession for this resume.
            3. List 3 key strengths of the resume.
            4. Suggest 2 quick improvements.
            5. Give an overall ATS score out of 100. Title for this point in this format(Overall ATS Score (out of 100): score)
            
            Resume text: {resume_text}
            Job description (if provided): {job_description}
            """
        else:
            prompt = f"""
            You are a ResumeChecker, an expert in resume analysis. Provide a quick scan of the following resume:
            
            1. Identify the most suitable profession for this resume.
            2. List 3 key strengths of the resume.
            3. Suggest 2 quick improvements.
            4. Give an overall ATS score out of 100. Title for this point in this format(Overall ATS Score (out of 100): score)
            
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
            7. Give an overall ATS score out of 100. Title for this point in this format(Overall ATS Score (out of 100): score)
            
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
            6. Give an overall ATS score out of 100. Title for this point in this format(Overall ATS Score (out of 100): score)
            
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
            6. Give an overall ATS score out of 100. Title for this point in this format(Overall ATS Score (out of 100): score)
            
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
            5. Give an overall ATS score out of 100. Title for this point in this format(Overall ATS Score (out of 100): score)
            
            Resume text: {resume_text}
            Job description: {job_description}
            """

    
    try:
        response = model.generate_content(prompt)
        return response.text if hasattr(response, 'text') else "No response received."
    except Exception as e:
        logger.error(f"Error in AI processing: {e}")
        return "Error in AI processing."

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

@app.route("/")
def home():
    return "Flask is running!"

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
