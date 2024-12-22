import React, { useState, useRef } from "react";
import "./Login.css"
import Tracker2 from "./Tracker2.js";

const Login = () => {
  const usernameRef = useRef();
  const emailRef = useRef();
  const passwordRef = useRef();
  const [isLogin, setIsLogin] = useState(
    localStorage.getItem("isRegistered") === "true"
  );
  const [openapp, setOpenapp] = useState(false);

  const handleSignUp = () => {
    const username = usernameRef.current.value;
    const email = emailRef.current.value;
    const password = passwordRef.current.value;

    if (username && email && password) {
      localStorage.setItem("username", username);
      localStorage.setItem("email", email);
      localStorage.setItem("password", password);
      localStorage.setItem("isRegistered", "true");
      alert("Sign-Up Successful! Please Log In.");
      setIsLogin(true);
    } else {
      alert("Please fill in all fields.");
    }
  };

  const handleLogin = () => {
    const email = emailRef.current.value;
    const password = passwordRef.current.value;

    const storedEmail = localStorage.getItem("email");
    const storedPassword = localStorage.getItem("password");

    if (email === storedEmail && password === storedPassword) {
      alert(`Welcome back, ${localStorage.getItem("username")}!`);
      setOpenapp(true)
    } else {
      alert("Invalid email or password. Please try again.");
    }
  };

  if (openapp){
    return <Tracker2 />
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>{isLogin ? "Log In" : "Sign Up"}</h1>
        {!isLogin && (
          <input
            type="text"
            placeholder="Enter your username"
            ref={usernameRef}
          />
        )}
        <input type="email" placeholder="Enter your email" ref={emailRef} />
        <input
          type="password"
          placeholder="Enter your password"

          ref={passwordRef}
        />
        <button onClick={isLogin ? handleLogin : handleSignUp} type="button">
          {isLogin ? "Log In" : "Sign Up"}
        </button>
        <p
          style={{
            marginTop: "15px",
            cursor: "pointer",
            color: "#74ebd5",
            textDecoration: "underline",
          }}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin
            ? "Don't have an account? Sign Up"
            : "Already have an account? Log In"}
        </p>
      </div>
    </div>
  );
};

export default Login;
