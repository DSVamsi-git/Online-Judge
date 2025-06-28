import './App.css';
import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const server_URI = import.meta.env.VITE_SERVER_URI;

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleClick = async ()=> {
    axios.post(server_URI + "/signup", {
      'username': username,
      'password': password
    })
    .then(res => alert(res.data.message || "Signup successful"))
    .catch(err => alert(err.response?.data?.message || "Signup failed"));
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-200">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-xs">
        <h2 className="text-3xl font-bold text-center text-purple-700 mb-6">Signup</h2>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          />
          <br/><br/>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
          />
          <br/><br/>
            <button
            onClick={handleClick}
            className="bg-purple-600 text-white text-center py-2 rounded-md hover:bg-purple-700 transition cursor-pointer font-medium"
            >
            Sign Up
            </button>

          <div className="text-center mt-2 text-sm">
            Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
