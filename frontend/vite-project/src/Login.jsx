import { useState } from 'react';
import './App.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const server_URI = import.meta.env.VITE_SERVER_URI; // ✅ Fix: use const

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();
    const handleLogin = () => {
    axios.post(server_URI + "/login", {
        'username': username,
        'password': password
    })
    .then(function (response) {
        // Save token to localStorage
        localStorage.setItem("token", response.data.token);
        alert(response.data.message);
        navigate('/profile');
    })
    .catch(function (error) {
        alert(error.response?.data?.message || "Login failed");
    });
    };


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-blue-300">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-xs">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">Login</h2>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <br/> <br/> 
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <br/><br/>
          <button
            onClick={handleLogin}
            className="bg-green-600 text-white text-center py-2 rounded-md hover:bg-green-700 transition cursor-pointer font-medium"
          >
            Login
          </button>
          <div className="text-center mt-2 text-sm">
            Dont have an account? <Link to="/signup" className="text-blue-600 hover:underline">Signup</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
