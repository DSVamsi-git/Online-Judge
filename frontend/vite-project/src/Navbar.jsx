// Navbar.jsx
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

export default function NavBar() {
  const Navigate = useNavigate();
  return (
    <nav className="flex justify-between items-center bg-slate-900 text-white  py-4 shadow-md rounded-2xl">
      {/* Left side: Brand */}
      <div className="flex items-center gap-2 text-2xl font-bold text-blue-400">
        <span className="text-blue-400">
        Code<span className="text-gray-400">Case</span>💼
        </span>
      </div>

      {/* Right side: Nav links */}
      <div className="flex gap-6 text-lg">
        <Link to={`/problems/${id}/submissions`} className="hover:text-blue-400 transition">Submissions</Link>
        <Link to="/problems" className="hover:text-blue-400 transition">Problems</Link>
        <Link to="/profile" className="hover:text-blue-400 transition">Profile</Link>
        <button className="py-1 px-2 bg-amber-400 rounded-lg text-white text-lg hover:text-blue-400 transition" onClick={()=>{localStorage.removeItem("token");Navigate('/login')}}>logout</button>
      </div>
    </nav>
  );
}
