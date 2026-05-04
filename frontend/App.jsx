import React, { useEffect, useState } from "react";
import axios from "axios";
import { IoIosLogOut } from "react-icons/io";
import Teacher from "./component/Teacher";
import Login from "./component/Login";
import StudentLogin from "./component/StudentLogin";
import TeacherLogin from "./component/TeacherLogin";
const API_BASE = "http://localhost:8000/myapp";

function App() {
  // ========== ALL STATE HOOKS AT TOP ==========
  const [mode, setMode] = useState("student"); // "student" or "teacher"
  const [user, setUser] = useState(null);

  const [quizzes, setQuizzes] = useState([]);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [timer, setTimer] = useState(20);
  const [finished, setFinished] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0);

  // ========== ALL EFFECT HOOKS AT TOP ==========
  // Load saved user
  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) {
      const u = JSON.parse(saved);
      setUser(u);
      setMode(u.is_teacher ? "teacher" : "student");
    }
  }, []);

  // Load quizzes
  useEffect(() => {
    if (user) {
      axios.get(`${API_BASE}/quizzes/`)
        .then(res => setQuizzes(res.data))
        .catch(err => console.error(err));
    }
  }, [user]);

  // Timer
  useEffect(() => {
    if (!selectedQuiz || finished) return;

    if (timer === 0) {
      handleNext();
      return;
    }

    const interval = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer, selectedQuiz, finished, handleNext]);

  // ========== ALL CALLBACK FUNCTIONS ==========
  // Auth
  function handleLogin(user) {
    setUser(user);
    localStorage.setItem("user", JSON.stringify(user));
    setMode(user.is_teacher ? "teacher" : "student");
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("user");
    setSelectedQuiz(null);
    setQuestions([]);
    setMode("student");
  }

  // Load questions
  async function loadQuestions(quizId) {
    try {
      const res = await axios.get(`${API_BASE}/questions/?quiz=${quizId}`);

      if (!res.data.length) {
        alert("No questions found!");
        return;
      }

      setQuestions(res.data);
      setSelectedQuiz(quizId);
      setCurrentIndex(0);
      setScore(0);
      setFinished(false);
      setTimer(20);
      setStartTime(Date.now());
      setTimeTaken(0);

    } catch (err) {
      console.error(err);
    }
  }

  const renderQuizButtons = (parentId = null, level = 0) => {
    return quizzes
      .filter(q => (q.parent ?? null) === parentId)
      .map(q => (
        <div key={q.id} style={{ marginLeft: level * 20, marginBottom: 8 }}>
          <button
            onClick={() => loadQuestions(q.id)}
            style={{ display: 'block', margin: '5px auto', padding: '10px', width: level === 0 ? '20%' : '18%', backgroundColor: level > 0 ? 'green' : 'black' }}
          >
            {q.title}
          </button>
          {renderQuizButtons(q.id, level + 1)}
        </div>
      ));
  };

  function handleAnswer(opt) {
    setSelectedOption(opt);
  }

  function handleNext() {
    if (selectedOption?.is_correct) {
      setScore(prev => prev + 1);
    }

    setSelectedOption(null);
    setTimer(20);

    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setFinished(true);
      
      const finalScore = score + (selectedOption?.is_correct ? 1 : 0);
      const elapsedTime = startTime ? Math.round((Date.now() - startTime) / 1000) : 0;
      setTimeTaken(elapsedTime);

      axios.post(`${API_BASE}/results/`, {
        user_id: user.id,
        quiz_id: selectedQuiz,
        score: finalScore,
        total_questions: questions.length,
        time_taken: elapsedTime
      })
      .then(res => console.log("Result saved:", res.data))
      .catch(err => console.error("Error saving result:", err));
    }
  }

  // ========== ALL CONDITIONAL RETURNS (AFTER HOOKS) ==========
  if (mode === "teacher") {
    return <Teacher onSwitchMode={() => setMode("student")} />;
  }

  // Auth screen
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Quiz list screen
  if (!selectedQuiz) {
    return (
      <div style={{ padding: 20, textAlign: 'center', }}>
        <h2 style={{textAlign:"left"}}>Welcome! {user.name}</h2>
        
        <div className="logout_btn" style={{textAlign:"left",padding: "10px",}}>
          <button onClick={logout} style={{  textAlign: "left" ,color:"red"}}>
          <i className="fa-solid fa-right-from-bracket"></i>
            Logout
          </button>
         
          

        </div>

        <h3>Select Quiz</h3>

        {renderQuizButtons()}
      </div>
    );
  }

  // Result screen
  if (finished) {
    return (
      <div style={{ padding: 20, textAlign: 'center' }}>
        <h2>Finished </h2>
        <h3>{score} / {questions.length}</h3>
        <h4>name: {user.name}</h4>
        time: {timeTaken} seconds <br />
        correct answers: {score} <br />
        quiz: {quizzes.find(q => q.id === selectedQuiz)?.title} <br />
        <button onClick={() => setSelectedQuiz(null)}>Back</button>
      </div>
    );
  }

  const q = questions[currentIndex];

  // Quiz screen
  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <h3>Timer: {timer}s</h3>
      <h4>Q{currentIndex + 1} / {questions.length}</h4>
      <h4>Score: {score}</h4>

      {q && (
        <>
          <h3>{q.question_text}</h3>

          {q.image && (
            <img
              src={q.image}
              alt="Question"
              style={{ maxWidth: "300px", maxHeight: "200px", margin: "10px auto", display: 'block' }}
            />
          )}

          {q.options?.map(opt => (
            <div key={opt.id} style={{ margin: "10px 0" }}>
              <button
                onClick={() => handleAnswer(opt)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  margin: "5px auto",
                  background: selectedOption?.id === opt.id ? "lightblue" : "#ed14de",
                  padding: "10px",
                  width: "20%",
                  textAlign: "left",
                }}
              >
                {opt.option_text}
              </button>

              {opt.image && (
                <img
                  src={opt.image}
                  alt={opt.option_text}
                  style={{ maxWidth: "150px", maxHeight: "100px", marginLeft: "80px", textAlign: "left" ,}}
                />
              )}
            </div>
          ))}
        </>
      )}

      <br />

      <button onClick={handleNext} style={{ padding: "10px" }}>
        Next
      </button>
    </div>
  );
}
<IoIosLogOut />

export default App;
