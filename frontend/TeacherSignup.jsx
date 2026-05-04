import { useState } from "react";
import axios from "axios";

const API = "http://localhost:8000/myapp";

export default function TeacherSignup({ onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSignup = async () => {
    try {
      const res = await axios.post(`${API}/register/`, {
        name,
        email,
        password,
        is_teacher: true
      });
      onLogin(res.data.user);
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed");
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 400, margin: "auto" }}>
      <h2>Teacher Signup</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <input
        type="text"
        placeholder="Full Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ display: "block", margin: "10px 0", width: "100%" }}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", margin: "10px 0", width: "100%" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", margin: "10px 0", width: "100%" }}
      />
      <button onClick={handleSignup} style={{ width: "100%" }}>Sign Up</button>
    </div>
  );
}