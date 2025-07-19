import { useState } from 'react';
import './App.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const server_URI = import.meta.env.VITE_SERVER_URI; // ✅ Fix: use const

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loginButtonText, setLoginButtonText] = useState("login");
    const navigate = useNavigate();
    const handleLogin = () => {
    setLoginButtonText("logging in..")
    axios.post(server_URI + "/login", {
        'username': username,
        'password': password
    })
    .then(function (response) {
        // Save token to localStorage
        localStorage.setItem("token", response.data.token);
        alert(response.data.message);
        navigate('/profile');
        setLoginButtonText("log in");
    })
    .catch(function (error) {
        setLoginButtonText("log in");
        alert(error.response?.data?.message || "Login failed");
    });
    };


  return (
    <>
    <nav className="flex justify-between items-center text-white  py-4 rounded-2xl">
      {/* Left side: Brand */}
      <div className="flex items-center gap-2 text-2xl font-bold text-blue-400">
        <span className="text-blue-400">
          Code<span className="text-violet-600">Shrine</span>⛩️
        </span>
      </div>
      <div className='flex gap-6 text-lg items-center'>
        <Link to="/home" className="hover:text-blue-400 transition">Home</Link>
        <Link to="/signup" className="hover:text-blue-400 transition">SignUp</Link>
      </div>

    </nav>
    <div className="min-h-screen flex items-center justify-center rounded-3xl">
      <div className="glass-card p-8 rounded-2xl shadow-xl w-full max-w-xs">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Login</h2>

        <div className="flex flex-col gap-4 text-white">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="px-4 py-2 text-white placeholder-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <br/> <br/> 
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="px-4 py-2 text-white placeholder-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <br/><br/>
          <button
            onClick={handleLogin}
            className="bg-green-500 text-white text-center py-2 rounded-md hover:bg-green-700 transition cursor-pointer font-medium"
          >
            {loginButtonText}
          </button>
          <div className="text-center mt-2 text-sm">
            Dont have an account? <Link to="/signup" className="text-amber-500 hover:underline">Signup</Link>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}
