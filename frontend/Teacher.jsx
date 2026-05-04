import { useState, useEffect } from "react";
import axios from "axios";
import Login from "./Login";

const API = "http://localhost:8000/myapp";

export default function TeacherPanel({ onSwitchMode }) {
  const [user, setUser] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState("");
  const [questionText, setQuestionText] = useState("");
  const [questionImage, setQuestionImage] = useState(null);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [options, setOptions] = useState([{ text: "", isCorrect: false, image: null }]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizCategory, setQuizCategory] = useState("General Knowledge");
  const [quizTimeLimit, setQuizTimeLimit] = useState(0);
  const [parentQuiz, setParentQuiz] = useState("");
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      axios.get(`${API}/quizzes/`)
        .then(res => setQuizzes(res.data))
        .catch(err => {
          console.error("Error loading quizzes:", err);
          setError("Failed to load quizzes. Please check your connection.");
        });
    }
  }, [user]);

  useEffect(() => {
    if (selectedQuiz) {
      axios.get(`${API}/questions/?quiz=${selectedQuiz}`)
        .then(res => setQuestions(res.data))
        .catch(err => {
          console.error("Error loading questions:", err);
          setError("Failed to load questions. Please try again.");
        });
      setError(""); // Clear errors when switching quizzes
    }
  }, [selectedQuiz]);

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const resetQuizForm = () => {
    setQuizTitle("");
    setQuizCategory("General Knowledge");
    setQuizTimeLimit(0);
    setParentQuiz("");
    setEditingQuiz(null);
    setShowQuizForm(false);
    setError("");
  };

  const editQuiz = (quiz) => {
    setEditingQuiz(quiz);
    setQuizTitle(quiz.title || "");
    setQuizCategory(quiz.category || "General Knowledge");
    setQuizTimeLimit(quiz.time_limit || 0);
    setParentQuiz(quiz.parent || "");
    setShowQuizForm(true);
    setError("");
  };

  const updateQuiz = async () => {
    if (!editingQuiz) return;
    if (!quizTitle.trim()) {
      setError("Quiz title is required");
      return;
    }

    const payload = {
      title: quizTitle,
      category: quizCategory,
      time_limit: Number(quizTimeLimit) || 0,
      parent: parentQuiz || null,
    };

    try {
      await axios.put(`${API}/quizzes/${editingQuiz.id}/`, payload);
      setError("");
      await axios.get(`${API}/quizzes/`).then(res => setQuizzes(res.data));
      alert("Quiz updated successfully!");
      resetQuizForm();
    } catch (err) {
      console.error("Error updating quiz:", err);
      const errorMessage = err.response?.data?.detail || err.response?.data?.title?.[0] || "Failed to update quiz. Please check your input and try again.";
      setError(errorMessage);
    }
  };

  const addQuiz = async () => {
    if (!quizTitle.trim()) {
      setError("Quiz title is required");
      return;
    }

    const payload = {
      title: quizTitle,
      category: quizCategory,
      time_limit: Number(quizTimeLimit) || 0,
    };

    if (parentQuiz) {
      payload.parent = parentQuiz;
    }

    try {
      await axios.post(`${API}/quizzes/`, payload);
      setError("");
      await axios.get(`${API}/quizzes/`).then(res => setQuizzes(res.data));
      alert("Quiz created successfully!");
      resetQuizForm();
    } catch (err) {
      console.error("Error adding quiz:", err);
      const errorMessage = err.response?.data?.detail || err.response?.data?.title?.[0] || "Failed to add quiz. Please check your input and try again.";
      setError(errorMessage);
    }
  };

  const deleteQuiz = async (quizId) => {
    if (!confirm("Delete this quiz and all of its questions/sub-quizzes?")) {
      return;
    }

    try {
      await axios.delete(`${API}/quizzes/${quizId}/`);
      setError("");
      if (selectedQuiz === String(quizId) || selectedQuiz === quizId) {
        setSelectedQuiz("");
        setQuestions([]);
      }
      await axios.get(`${API}/quizzes/`).then(res => setQuizzes(res.data));
    } catch (err) {
      console.error("Error deleting quiz:", err);
      const errorMessage = err.response?.data?.detail || err.response?.data?.error || "Failed to delete quiz. Please try again.";
      setError(errorMessage);
    }
  };

  const addQuestion = async () => {
    // Validation
    if (!questionText.trim()) {
      setError("Question text is required");
      return;
    }
    if (!selectedQuiz) {
      setError("Please select a quiz first");
      return;
    }
    if (options.filter(opt => opt.text.trim()).length < 2) {
      setError("At least 2 options are required");
      return;
    }
    if (!options.some(opt => opt.isCorrect)) {
      setError("At least one option must be marked as correct");
      return;
    }

    setError(""); // Clear any previous errors

    const formData = new FormData();
    formData.append("quiz", selectedQuiz);
    formData.append("question_text", questionText);
    if (questionImage) formData.append("image", questionImage);

    try {
      const res = await axios.post(`${API}/questions/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Add options
      const optionPromises = [];
      console.log("Processing options:", options);
      for (let i = 0; i < options.length; i++) {
        if (!options[i].text.trim()) {
          console.log(`Skipping empty option ${i + 1}`);
          continue; // Skip empty options
        }

        console.log(`Adding option ${i + 1}:`, options[i].text);

        const optFormData = new FormData();
        optFormData.append("question", res.data.id);
        optFormData.append("option_text", options[i].text);
        optFormData.append("is_correct", options[i].isCorrect);
        if (options[i].image) optFormData.append("image", options[i].image);

        optionPromises.push(
          axios.post(`${API}/options/`, optFormData, {
            headers: { "Content-Type": "multipart/form-data" }
          }).catch(err => {
            console.error(`Error adding option ${i + 1}:`, err);
            throw err; // Re-throw to fail the whole operation
          })
        );
      }

      // Wait for all options to be added
      await Promise.all(optionPromises);

      alert("Question and options added successfully!");
      resetForm();
      // Refresh questions
      axios.get(`${API}/questions/?quiz=${selectedQuiz}`).then(res => setQuestions(res.data));
    } catch (err) {
      console.error("Error adding question:", err);
      const errorMessage = err.response?.data?.detail ||
                          err.response?.data?.error ||
                          err.response?.data?.question_text?.[0] ||
                          "Failed to add question. Please check your connection and try again.";
      setError(errorMessage);
    }
  };

  const updateQuestion = async () => {
    // Validation
    if (!questionText.trim()) {
      setError("Question text is required");
      return;
    }
    if (options.filter(opt => opt.text.trim()).length < 2) {
      setError("At least 2 options are required");
      return;
    }
    if (!options.some(opt => opt.isCorrect)) {
      setError("At least one option must be marked as correct");
      return;
    }

    setError(""); // Clear any previous errors

    const formData = new FormData();
    formData.append("question_text", questionText);
    if (questionImage) formData.append("image", questionImage);

    try {
      await axios.put(`${API}/questions/${editingQuestion.id}/`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      // Update options - for simplicity, delete all and recreate
      await axios.get(`${API}/options/?question=${editingQuestion.id}`).then(async (res) => {
        for (let opt of res.data) {
          await axios.delete(`${API}/options/${opt.id}/`);
        }
      });

      const optionPromises = [];
      console.log("Processing options for update:", options);
      for (let i = 0; i < options.length; i++) {
        if (!options[i].text.trim()) {
          console.log(`Skipping empty option ${i + 1}`);
          continue; // Skip empty options
        }

        console.log(`Updating option ${i + 1}:`, options[i].text);

        const optFormData = new FormData();
        optFormData.append("question", editingQuestion.id);
        optFormData.append("option_text", options[i].text);
        optFormData.append("is_correct", options[i].isCorrect);
        if (options[i].image) optFormData.append("image", options[i].image);

        optionPromises.push(
          axios.post(`${API}/options/`, optFormData, {
            headers: { "Content-Type": "multipart/form-data" }
          }).catch(err => {
            console.error(`Error updating option ${i + 1}:`, err);
            throw err;
          })
        );
      }

      // Wait for all options to be updated
      await Promise.all(optionPromises);

      alert("Question updated successfully!");
      resetForm();
      setEditingQuestion(null);
      axios.get(`${API}/questions/?quiz=${selectedQuiz}`).then(res => setQuestions(res.data));
    } catch (err) {
      console.error("Error updating question:", err);
      const errorMessage = err.response?.data?.detail ||
                          err.response?.data?.error ||
                          err.response?.data?.question_text?.[0] ||
                          "Failed to update question. Please check your connection and try again.";
      setError(errorMessage);
    }
  };

  const deleteQuestion = async (id) => {
    if (confirm("Delete this question?")) {
      try {
        await axios.delete(`${API}/questions/${id}/`);
        setQuestions(questions.filter(q => q.id !== id));
        setError(""); // Clear any errors on successful delete
      } catch (err) {
        console.error("Error deleting question:", err);
        const errorMessage = err.response?.data?.detail ||
                            err.response?.data?.error ||
                            "Failed to delete question. Please try again.";
        setError(errorMessage);
      }
    }
  };

  const updateOption = (index, field, value) => {
    setOptions(options.map((opt, i) => 
      i === index ? { ...opt, [field]: value } : opt
    ));
  };

  const renderQuizTree = (parentId = null, level = 0) => {
    return quizzes
      .filter(q => (q.parent ?? null) === parentId)
      .map(q => (
        <li key={q.id} style={{ marginLeft: level * 20, marginBottom: 6 }}>
          {q.title} {q.parent ? <small style={{ color: '#666' }}>(sub-quiz)</small> : null}
          <button
            onClick={() => setSelectedQuiz(q.id)}
            style={{ marginLeft: 10, padding: '2px 8px', fontSize: 12 }}
          >
            Edit Questions
          </button>
          <button
            onClick={() => editQuiz(q)}
            style={{ marginLeft: 6, padding: '2px 8px', fontSize: 12, backgroundColor: '#4a90e2', color: 'white', border: 'none', borderRadius: 3 }}
          >
            Edit Quiz
          </button>
          <button
            onClick={() => deleteQuiz(q.id)}
            style={{ marginLeft: 6, padding: '2px 8px', fontSize: 12, backgroundColor: '#ff6b6b', color: 'white', border: 'none', borderRadius: 3 }}
          >
            Delete
          </button>
          {renderQuizTree(q.id, level + 1)}
        </li>
      ));
  };

  const resetForm = () => {
    setQuestionText("");
    setQuestionImage(null);
    setOptions([{ text: "", isCorrect: false, image: null }]);
    setShowAddForm(false);
    setError("");
  };

  const addOption = () => {
    setOptions([...options, { text: "", isCorrect: false, image: null }]);
  };

  const removeOption = (index) => {
    if (options.length > 1) { // Keep at least one option
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const editQuestion = (question) => {
    setEditingQuestion(question);
    setQuestionText(question.question_text);
    setQuestionImage(null); // Can't prefill file input
    setOptions(question.options.map(opt => ({ text: opt.option_text, isCorrect: opt.is_correct, image: null })));
    setShowAddForm(true);
    setError(""); // Clear any previous errors
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Teacher Panel - Welcome {user.name}</h2>
      <button onClick={() => setUser(null)}>Logout</button>
      <button onClick={onSwitchMode} style={{ marginLeft: 10 }}>Switch to Student</button>

      <section style={{ marginTop: 20, marginBottom: 20 }}>
        <h3>Quiz Management</h3>
        <button
          onClick={() => {
            setShowQuizForm(!showQuizForm);
            if (!showQuizForm && selectedQuiz) {
              setParentQuiz(selectedQuiz);
            }
          }}
          style={{ marginRight: 10 }}
        >
          {showQuizForm ? "Cancel" : "Add Quiz"}
        </button>
        {selectedQuiz && (
          <button
            onClick={() => {
              setShowQuizForm(true);
              setParentQuiz(selectedQuiz);
            }}
          >
            Add Sub-Quiz to Selected
          </button>
        )}

        {showQuizForm && (
          <div style={{ border: "1px solid #ccc", padding: 20, marginTop: 15, borderRadius: 6, maxWidth: 500 }}>
            <h4>Create Quiz</h4>
            {error && (
              <div style={{ color: 'red', margin: '10px 0', padding: '10px', border: '1px solid red', borderRadius: '5px', backgroundColor: '#ffe6e6' }}>
                {error}
              </div>
            )}
            <input
              placeholder="Quiz Title"
              value={quizTitle}
              onChange={e => setQuizTitle(e.target.value)}
              style={{ display: "block", margin: "10px 0", width: "100%" }}
            />
            <input
              placeholder="Category"
              value={quizCategory}
              onChange={e => setQuizCategory(e.target.value)}
              style={{ display: "block", margin: "10px 0", width: "100%" }}
            />
            <input
              type="number"
              placeholder="Time Limit (minutes)"
              value={quizTimeLimit}
              onChange={e => setQuizTimeLimit(e.target.value)}
              style={{ display: "block", margin: "10px 0", width: "100%" }}
            />
            <label style={{ display: "block", margin: "10px 0" }}>
              Parent Quiz
              <select
                value={parentQuiz}
                onChange={e => setParentQuiz(e.target.value)}
                style={{ display: "block", marginTop: 6, width: "100%" }}
              >
                <option value="">None</option>
                {quizzes.map(q => (
                  <option key={q.id} value={q.id}>{q.title}</option>
                ))}
              </select>
            </label>
            <button onClick={editingQuiz ? updateQuiz : addQuiz} style={{ marginTop: 10 }}>
              {editingQuiz ? "Update Quiz" : "Create Quiz"}
            </button>
          </div>
        )}
      </section>

      <h3>Select Quiz</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <select onChange={e => setSelectedQuiz(e.target.value)} value={selectedQuiz} style={{ flex: 1 }}>
          <option value="">Select Quiz</option>
          {quizzes.map(q => (
            <option key={q.id} value={q.id}>{q.title}</option>
          ))}
        </select>
        {selectedQuiz && (
          <button
            onClick={() => deleteQuiz(selectedQuiz)}
            style={{ padding: '6px 12px', backgroundColor: '#ff6b6b', color: 'white', border: 'none', borderRadius: 4 }}
          >
            Delete Quiz
          </button>
        )}
      </div>

      <section style={{ marginBottom: 20 }}>
        <h3>All Quizzes</h3>
        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
          {renderQuizTree()}
        </ul>
      </section>

      {selectedQuiz && (
        <>
          <h3>Questions</h3>
          {error && (
            <div style={{ 
              color: "red", 
              backgroundColor: "#ffe6e6", 
              border: "1px solid red", 
              padding: 10, 
              margin: "10px 0",
              borderRadius: 4
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}
          <button onClick={() => setShowAddForm(!showAddForm)}>
            {showAddForm ? "Cancel" : "Add Question"}
          </button>

          {showAddForm && (
            <div style={{ border: "1px solid #ccc", padding: 20, margin: "20px 0" }}>
              <h4>{editingQuestion ? "Edit Question" : "Add Question"}</h4>
              
              {error && (
                <div style={{ 
                  color: 'red', 
                  margin: '10px 0', 
                  padding: '10px', 
                  border: '1px solid red', 
                  borderRadius: '5px', 
                  backgroundColor: '#ffe6e6' 
                }}>
                  {error}
                </div>
              )}
              
              <input
                placeholder="Question Text"
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
                style={{ display: "block", margin: "10px 0", width: "100%" }}
              />
              <input
                type="file"
                onChange={e => setQuestionImage(e.target.files[0])}
                style={{ display: "block", margin: "10px 0" }}
              />

              <h5>Options ({options.filter(opt => opt.text.trim()).length} will be saved)</h5>
              {options.map((opt, index) => (
                <div key={index} style={{ 
                  margin: "10px 0", 
                  border: "1px solid #eee", 
                  padding: 10,
                  backgroundColor: opt.text.trim() ? "#f9f9f9" : "#fff5f5"
                }}>
                  <div style={{ fontSize: "12px", color: opt.text.trim() ? "green" : "red", marginBottom: "5px" }}>
                    Option {index + 1} {opt.text.trim() ? "(will be saved)" : "(empty - will be skipped)"}
                  </div>
                  <input
                    placeholder="Option Text"
                    value={opt.text}
                    onChange={e => updateOption(index, "text", e.target.value)}
                    style={{ display: "block", margin: "5px 0", width: "100%" }}
                  />
                  <label>
                    <input
                      type="checkbox"
                      checked={opt.isCorrect}
                      onChange={e => updateOption(index, "isCorrect", e.target.checked)}
                    />
                    Correct Answer
                  </label>
                  <input
                    type="file"
                    onChange={e => updateOption(index, "image", e.target.files[0])}
                    style={{ display: "block", margin: "5px 0" }}
                  />
                  {options.length > 1 && (
                    <button 
                      onClick={() => removeOption(index)}
                      style={{ 
                        backgroundColor: "#ff6b6b", 
                        color: "white", 
                        border: "none", 
                        padding: "5px 10px", 
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontSize: "12px",
                        marginTop: "5px"
                      }}
                    >
                      Remove Option
                    </button>
                  )}
                </div>
              ))}
              <button onClick={addOption}>Add Option</button>
              <br /><br />
              <button onClick={editingQuestion ? updateQuestion : addQuestion}>
                {editingQuestion ? "Update" : "Add"} Question
              </button>
            </div>
          )}

          <ul>
            {questions.map(q => (
              <li key={q.id} style={{ margin: "20px 0", border: "1px solid #ddd", padding: 10 }}>
                <strong>{q.question_text}</strong>
                {q.image && <img src={`http://localhost:8000${q.image}`} alt="Question" style={{ maxWidth: 200 }} />}
                <ul>
                  {q.options.map(opt => (
                    <li key={opt.id}>
                      {opt.option_text} {opt.is_correct && "(Correct)"}
                      {opt.image && <img src={`http://localhost:8000${opt.image}`} alt="Option" style={{ maxWidth: 100 }} />}
                    </li>
                  ))}
                </ul>
                <button onClick={() => editQuestion(q)}>Edit</button>
                <button onClick={() => deleteQuestion(q.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}