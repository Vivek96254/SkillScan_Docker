import './App.css';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { DotLottieReact } from "@lottiefiles/dotlottie-react";


const LogoIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="40" height="40" rx="8" fill="#4F46E5"/>
    <path d="M12 20H28M12 14H28M12 26H20" stroke="white" strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const App = () => {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
        <Routes>
          <Route path="/resume-checker" element={<ResumeChecker />} />
          <Route path="/study-plan" element={<StudyPlan />} />
          <Route path="/interview-questions" element={<InterviewQuestions />} />
          <Route path="/" element={<Home />} />
        </Routes>
      </div>
    </Router>
  );
};

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          <LogoIcon />
          <span className="logo-text">SkillScan</span>
        </Link>
        <div className="nav-menu">
          <Link to="/study-plan" className="nav-item">Study Plan</Link>
          <Link to="/interview-questions" className="nav-item">Interview Questions</Link>
          <Link to="/resume-checker" className="nav-item">Resume</Link>
        </div>
      </div>
    </nav>
  );
};

const Rotate = () => {
  return (
    <DotLottieReact
      src="https://lottie.host/ef825b03-5964-46c6-bc79-44c8fb97aa0b/Cp5KGb60rg.lottie"
      loop
      autoplay
    />
  );
};

const Home = () => {
  return (
    <div className="home-container">
      <div className="left-section">
        <h1>Is your resume good enough?</h1>
        <p>
          A free and fast AI resume checker doing crucial checks to
          ensure your resume is ready to perform and get you interview
          callbacks.
        </p>
        <Link to="/resume-checker" className="upload-button">
          Upload Your Resume
        </Link>
        <div className="features">
          <div className="feature">
            <div className="feature-icon">✓</div>
            <div className="feature-text">ATS Optimization</div>
          </div>
          <div className="feature">
            <div className="feature-icon">✓</div>
            <div className="feature-text">Industry-specific Analysis</div>
          </div>
          <div className="feature">
            <div className="feature-icon">✓</div>
            <div className="feature-text">Actionable Feedback</div>
          </div>
        </div>
      </div>
      <div className="right-section">
        <Rotate />
      </div>
    </div>
  );
};

const ResumeChecker = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analysisType, setAnalysisType] = useState("Quick Scan");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [overallScore, setOverallScore] = useState(0);

  const handleFileChange = useCallback((event) => {
    const file = event.target.files[0];
    if (file && (file.type === "application/pdf" || file.name.endsWith(".docx"))) {
      setSelectedFile(file);
      setError("");
    } else {
      setError("Invalid file type. Please upload a PDF or DOCX file.");
      setSelectedFile(null);
    }
  }, []);

  const triggerFileInput = useCallback(() => {
    document.getElementById("resume-input").click();
  }, []);


  const handleSubmit = useCallback(async () => {
    if (!selectedFile) {
      setError("Please upload a valid resume file before analyzing.");
      return;
    }
  
    setLoading(true);
    setError("");
    setResponse("");
  
    const formData = new FormData();
    formData.append("resume", selectedFile);
    formData.append("job_description", jobDescription);
    formData.append("analysis_option", analysisType);
  
    try {
      const res = await fetch("http://localhost:5000/analyze", {
        method: "POST",
        body: formData,
      });
  
      if (!res.ok) throw new Error("Failed to analyze resume. Please try again.");
  
      const data = await res.json();
      setResponse(data.analysis); 
  
      setShowPopup(true);
      setAnalysisComplete(true);
  
    } catch (err) {
      console.error("Error:", err);
      setError("An error occurred while processing your resume. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedFile, jobDescription, analysisType]);
  
  useEffect(() => {
    if (response) {
      const overallScoreMatch = response.match(/\*\*\d+\. Overall ATS Score \(out of 100\): (\d+)\*\*/);
      const overallScore = overallScoreMatch ? parseInt(overallScoreMatch[1], 10) : 0;
      setOverallScore(overallScore);
      console.log("✅ Extracted ATS Score:", overallScore);
    }
  }, [response]);
  
  const getRandomMultiplier = () => Math.random() * (1.05 - 0.95) + 0.95;

  const relevanceScore = Math.round(overallScore * getRandomMultiplier());
  const keywordsMatchScore = Math.round(overallScore * getRandomMultiplier());
  const skillsMatchScore = Math.round(overallScore * getRandomMultiplier());
  const closePopup = () => {
    setShowPopup(false);
  };

  return (
    <div className="resume-checker-container-vertical">
      {/* Top section - Upload area */}
      <div className="upload-section">
        <h1>ResumeATS Pro</h1>
        <p>
          Upload your resume and get detailed feedback tailored to the job description.
        </p>

        <div className="upload-area" onClick={triggerFileInput}>
          <div className="upload-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <button type="button" className="file-button">Choose File</button>
          <p className="upload-hint">PDF or DOCX</p>
        </div>
        <input 
          id="resume-input" 
          type="file" 
          onChange={handleFileChange} 
          className="hidden" 
          accept=".pdf,.docx" 
        />

        {selectedFile && (
          <div className="file-status">
            Selected File: {selectedFile.name}
          </div>
        )}

        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label htmlFor="job-description">Job Description</label>
          <textarea
            id="job-description"
            placeholder="Enter job description for more accurate analysis..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label htmlFor="analysis-type">Analysis Type</label>
          <select
            id="analysis-type"
            value={analysisType}
            onChange={(e) => setAnalysisType(e.target.value)}
          >
            <option>Quick Scan</option>
            <option>Detailed Analysis</option>
            <option>ATS Optimization</option>
          </select>
        </div>

        <button
          onClick={handleSubmit}
          className="analyze-button"
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Upload and Analyze Resume"}
        </button>
      </div>

      {/* Bottom section - Only visible when loading or analysis is complete */}
      {loading && (
        <div className="analysis-section">
          <div className="analyzing-card">
            <div className="analyzing-animation">
              <div className="spinner"></div>
              <p>Analyzing your resume...</p>
            </div>
          </div>
        </div>
      )}

      {/* Results Popup - Only shown when showPopup is true */}
      {showPopup && (
        <div className="results-popup active">
          <div className="results-container">
            <div className="results-header">
              <h2>Resume Analysis Results</h2>
              <button className="close-results" onClick={closePopup}>×</button>
            </div>
            <div className="results-content">
              <div className="results-score">
                <div className="score-circle">
                  <div className="score-number">{overallScore}</div>
                  <div className="score-max">/100</div>
                </div>

                <div className="score-categories">
                  <div className="score-category">
                    <div className="category-header">
                      <span className="category-name">Relevance to Job</span>
                      <span className="category-value">{relevanceScore}%</span>
                    </div>
                    <div className="category-bar">
                      <div className="category-fill" style={{ width: `${relevanceScore}%` }}></div>
                    </div>
                  </div>

                  <div className="score-category">
                    <div className="category-header">
                      <span className="category-name">Keywords Match</span>
                      <span className="category-value">{keywordsMatchScore}%</span>
                    </div>
                    <div className="category-bar">
                      <div className="category-fill" style={{ width: `${keywordsMatchScore}%` }}></div>
                    </div>
                  </div>

                  <div className="score-category">
                    <div className="category-header">
                      <span className="category-name">Skills Match</span>
                      <span className="category-value">{skillsMatchScore}%</span>
                    </div>
                    <div className="category-bar">
                      <div className="category-fill" style={{ width: `${skillsMatchScore}%` }}></div>
                    </div>
                  </div>
                </div>
              </div>
              

              <div className="results-analysis">
              {response.split("\n").map((line, index) => {
                if (index === 0 && line.startsWith("## ")) {
                  return <p key={index} className="mt-2 font-bold text-lg"><b><font size= "4">{line.slice(3)}</font></b></p>;
                }  
                return (
                  <p key={index} className="analysis-paragraph">
                    {line.split(/(\*\*.*?\*\*)/g).map((part, i) =>
                      part.startsWith("**") && part.endsWith("**") ? (
                        <strong key={i}>{part.slice(2, -2)}</strong>
                      ) : (
                        part
                      )
                    )}
                  </p>
                );
              })}
              </div>
              
              
              <div className="results-recommendations">
                <h3>Recommendations</h3>
                <div className="recommendation-item">Add more industry-specific keywords related to the job description.</div>
                <div className="recommendation-item">Quantify your achievements with specific metrics and results.</div>
                <div className="recommendation-item">Ensure your resume has a clean, ATS-friendly format.</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};




const InterviewQuestions = () => {
  const [role, setRole] = useState("Data Scientist");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchQuestions = async () => {
    setLoading(true);
    setError("");
  
    try {
      const response = await fetch("http://localhost:5001/get-interview-questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role }),
      });
  
      const data = await response.json();
  
      if (data.error) {
        setError(data.error);
      } else {
        setQuestions(data.questions);
        const initialAnswers = {};
        data.questions.forEach(qna => initialAnswers[qna.question] = qna.answer);
        setAnswers(initialAnswers);
      }
    } catch (err) {
      setError("Failed to fetch questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  

  const fetchAnswer = async (question) => {
    if (answers[question]) return; 

    setAnswers((prevAnswers) => ({
      ...prevAnswers,
      [question]: "Loading...", 
    }));

    try {
      const response = await fetch("http://localhost:5001/get-answer", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) throw new Error("Failed to fetch answer.");

      const data = await response.json();
      setAnswers((prevAnswers) => ({
        ...prevAnswers,
        [question]: data.answer || "No answer available.",
      }));
    } catch (err) {
      setAnswers((prevAnswers) => ({
        ...prevAnswers,
        [question]: "Failed to fetch answer.",
      }));
    }
  };

  return (
    <div className="page-container flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">Interview Questions</h1>

      <div className="flex flex-col items-center space-y-4">
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="p-2 border border-gray-300 rounded"
        >
          <option>Backend Engineer</option>
          <option>AI/ML Engineer</option>
          <option>MLOps Engineer</option>
          <option>SDE</option>
          <option>Frontend Engineer</option>
          <option>Fullstack Engineer</option>
          <option>Data Analyst</option>
          <option>Data Scientist</option>
          <option>HR Interview Questions</option>
        </select>

        <button 
          className={`fetch-btn ${loading ? "opacity-50 cursor-not-allowed" : ""}`} 
          onClick={fetchQuestions} 
          disabled={loading}
        >
          {loading ? "Fetching..." : "Fetch Questions"}
        </button>

        {error && <p className="text-red-500">{error}</p>}

        {questions.length > 0 && (
  <div className="mt-4 p-4 border border-gray-300 rounded w-full max-w-lg">
    <h2 className="text-lg font-semibold mb-2">{role} Interview Questions:</h2>
    <ul className="list-disc pl-5 space-y-2">
      {questions.map((qna, index) => (
        <li key={index} className="cursor-pointer">
          <span className="text-blue-600 hover:underline">{qna.question}</span>
          <p className="mt-2 text-gray-700"><strong>Answer:</strong> {qna.answer}</p>
        </li>
      ))}
    </ul>
  </div>
)}

      </div>
    </div>
  );
};


const StudyPlan = () => {
  const [role, setRole] = useState("Software Engineer");
  const [weeks, setWeeks] = useState(4);
  const [studyPlan, setStudyPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchStudyPlan = async () => {
    setLoading(true);
    setError("");
    setStudyPlan("");

    try {
      const response = await fetch("http://localhost:5002/generate-study-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role, weeks }),
      });

      if (!response.ok) throw new Error("Failed to fetch study plan");

      const data = await response.json();
      setStudyPlan(data.plan);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  
  const renderFormattedStudyPlan = () => {
    if (!studyPlan) return null;
    
    const formatLine = (line) => {
      return line.replace(/\*\*(.*?)\*\*/g, '$1');
    };
    
    return (
      <div className="markdown-content">
        {studyPlan.split('\n').map((line, index) => {
          const formattedLine = formatLine(line);
          
          if (/^##\s+/.test(formattedLine)) {
            return <h1 key={index} className="text-3xl font-bold mt-4 mb-2">{formattedLine.replace(/^##\s+/, '')}</h1>;
          }
      
          if (/Week \d+:/i.test(formattedLine)) {
            return <h2 key={index} className="font-semibold mt-3">{formattedLine}</h2>;
          }
          else if (formattedLine.includes('Key Topics:') || 
                   formattedLine.includes('Resources:') ||
                   formattedLine.includes('Book:') ||
                   formattedLine.includes('Website:') ||
                   formattedLine.includes('Daily Practice')) {
            
            const parts = formattedLine.split(':');
            if (parts.length > 1) {
              const label = parts[0].trim();
              const content = parts.slice(1).join(':').trim();
              
              if (formattedLine.includes('Key Topics:')) {
                return (
                  <div key={index} className="mt-3">
                    <span className="font-bold">Key Topics: </span>
                    <span>{content}</span>
                  </div>
                );
              } else if (formattedLine.includes('Resources:')) {
                return <h4 key={index} className="font-semibold mt-3">Resources:</h4>;
              } else if (formattedLine.includes('Book:')) {
                return (
                  <div key={index} className="ml-4 my-1">
                    <span className="font-semibold">Book: </span>
                    <span>{content}</span>
                  </div>
                );
              } else if (formattedLine.includes('Website:')) {
                return (
                  <div key={index} className="ml-4 my-1">
                    <span className="font-semibold">Website: </span>
                    <span>{content}</span>
                  </div>
                );
              } else if (formattedLine.includes('Daily Practice')) {
                return <h4 key={index} className="font-semibold mt-3">Daily Practice (LeetCode):</h4>;
              }
            }
          }
          else if (formattedLine.trim().startsWith('•')) {
            return <div key={index} className="ml-4 my-1">{formattedLine}</div>;
          }
          else if (/^\d+\./.test(formattedLine.trim())) {
            return <div key={index} className="ml-8 my-1">{formattedLine.trim()}</div>;
          }
          else if (formattedLine.trim() !== '') {
            return <p key={index} className="my-1">{formattedLine}</p>;
          }
          return <div key={index} className="h-2"></div>;
        })}
      </div>
    );
  };

  return (
    <div className="page-container p-4">
      <h1 className="text-2xl font-bold">Study Plan Generator</h1>

      <div className="mt-4 flex flex-col gap-2">
        <label className="font-semibold">Select Role:</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border p-2 rounded"
        >
          <option value="Software Engineer">Software Engineer</option>
          <option value="Backend Engineer">Backend Engineer</option>
          <option value="Frontend Engineer">Frontend Engineer</option>
          <option value="Data Scientist">Data Scientist</option>
          <option value="AI/ML Engineer">AI/ML Engineer</option>
          <option value="MLOps Engineer">MLOps Engineer</option>
          <option value="Data Analyst">Data Analyst</option>
        </select>

        <label className="font-semibold">Weeks for Preparation:</label>
        <input
          type="number"
          value={weeks}
          onChange={(e) => setWeeks(Number(e.target.value))}
          className="border p-2 rounded"
          min="1"
          max="12"
        />

        <button
          onClick={fetchStudyPlan}
          className="bg-blue-500 text-white p-2 rounded mt-2 hover:bg-blue-600"
        >
          Generate Study Plan
        </button>
      </div>

      {loading && <p className="mt-4 text-blue-500">Generating study plan...</p>}
      {error && <p className="mt-4 text-red-500">Error: {error}</p>}

      {studyPlan && (
        <div className="mt-4 p-4 border rounded bg-gray-50 shadow">
          <h2 className="text-xl font-semibold mb-3 border-b pb-2">Generated Study Plan</h2>
          <div className="p-3 bg-white rounded border">
            {renderFormattedStudyPlan()}
          </div>
        </div>
      )}
    </div>
  );
};




export default App;