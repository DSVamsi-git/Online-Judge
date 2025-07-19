import './App.css';
import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const server_URI = import.meta.env.VITE_SERVER_URI;

export default function Signup() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [signupButtonText, setSignupButtonText] = useState("sign up");
  const handleClick = async ()=> {
    setSignupButtonText("signing up..")
    axios.post(server_URI + "/signup", {
      'username': username,
      'password': password
    })
    .then(res => {alert(res.data.message || "Signup successful");    setSignupButtonText("sign up");})
    .catch(err =>{alert(err.response?.data?.message || "Signup failed");setSignupButtonText("sign up");});
  }

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
        <Link to="/login" className="hover:text-blue-400 transition">Login</Link>
        <Link to="/home" className="hover:text-blue-400 transition">Home</Link>
      </div>

    </nav>
    <div className="min-h-screen flex items-center justify-center rounded-3xl">
      <div className="glass-card p-8 rounded-2xl shadow-xl w-full max-w-xs">
        <h2 className="text-3xl font-bold text-center text-white mb-6">Signup</h2>

         <div className="flex flex-col gap-4 text-white">
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            className="px-4 py-2 text-white placeholder-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <br/><br/>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="px-4 py-2 text-white placeholder-gray-300 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <br/><br/>
            <button
            onClick={handleClick}
            className="bg-green-600 text-white text-center py-2 rounded-md hover:bg-green-700 transition cursor-pointer font-medium"
            >
            {signupButtonText}
            </button>

          <div className="text-center mt-2 text-sm">
            Already have an account? <Link to="/login" className="text-amber-500 hover:underline">Login</Link>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}
