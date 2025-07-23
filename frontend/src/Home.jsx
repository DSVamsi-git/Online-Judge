import './App.css';
import { useNavigate, Link } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  return (
    <>
      <div className="p-4">
        <nav className="flex justify-between items-center text-white  py-4 rounded-2xl">
          {/* Left side: Brand */}
          <div className="flex items-center gap-2 text-2xl font-bold text-blue-400">
            <span className="text-blue-400">
              Code<span className="text-violet-600">Shrine</span>⛩️
            </span>
          </div>
          <div className='flex gap-6 text-lg items-center'>
            <Link to="/login" className="hover:text-blue-400 transition">Login</Link>
            <Link to="/signup" className="hover:text-blue-400 transition">SignUp</Link>
          </div>

        </nav>
      </div>
      <div className='h-64 w-full mx-2 bg-center'>
        <h1 className="gradient-text">CodeShrine</h1>
        Worried about your interviews? No more. CodeShrine your one stop solution for all your coding interviews.
      </div>
      <div className='flex justify-between items-center'>
        <div className='glass-card h-32 w-1/3 rounded-2xl m-2 text-white items-center transition-transform hover:scale-105'>
            <h2>🧠⚡</h2>
            Challenge yourself with high quality DSA problems
        </div>
        <div className='glass-card h-32 w-1/3 rounded-2xl m-2 text-white items-center transition-transform hover:scale-105'>
            <h2>✨💻</h2>
            Enhance your code quality by improving your clean score
        </div>
        <div className='glass-card h-32 w-1/3 rounded-2xl m-2 text-white items-center transition-transform hover:scale-105'>
            <h2>🤖📝</h2>
            Get ai-generated in-depth feedback and actionable improvemnts 
        </div>
        </div>
    </>
  );
}
