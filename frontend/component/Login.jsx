import { useState } from "react";
import StudentLogin from "./StudentLogin";
import TeacherLogin from "./TeacherLogin";
import StudentSignup from "./StudentSignup";
import TeacherSignup from "./TeacherSignup";

function Login({ onLogin }) {
  const [selectedMode, setSelectedMode] = useState(null);
  const [authType, setAuthType] = useState(null); // "login" or "signup"

  if (selectedMode === 'student' && authType === 'login') return <StudentLogin onLogin={onLogin} />;
  if (selectedMode === 'student' && authType === 'signup') return <StudentSignup onLogin={onLogin} />;
  if (selectedMode === 'teacher' && authType === 'login') return <TeacherLogin onLogin={onLogin} />;
  if (selectedMode === 'teacher' && authType === 'signup') return <TeacherSignup onLogin={onLogin} />;

  // Show role and auth type selection
  return (
    <div style={{ padding: 20, textAlign: 'center', border: "1px solid black", width: "30%", margin: "50px auto", borderRadius: "10px", background: "#060404eb" }}>
      <h1 style={{ color: "green" }}>Quiz App</h1>
      <h2>Select Your Role</h2>

      <div style={{ margin: "20px 0" }}>
        <button onClick={() => setSelectedMode('student')} style={{ padding: '10px 20px', margin: '10px', width: '150px' }}>
          quiz taker
        </button>
        <button onClick={() => setSelectedMode('teacher')} style={{ padding: '10px 20px', margin: '10px', width: '150px' }}>
          quiz adder
        </button>
      </div>

      {selectedMode && (
        <div>
          <h3>Choose Action</h3>
          <button onClick={() => setAuthType('login')} style={{ padding: '8px 16px', margin: '5px', width: '120px' }}>
            Login
          </button>
          <button onClick={() => setAuthType('signup')} style={{ padding: '8px 16px', margin: '5px', width: '120px' }}>
            Sign Up
          </button>
          <br />
          <button onClick={() => { setSelectedMode(null); setAuthType(null); }} style={{ padding: '5px 10px', margin: '10px', fontSize: '12px' }}>
            Back
          </button>
        </div>
      )}
    </div>
  );
}

export default Login;
