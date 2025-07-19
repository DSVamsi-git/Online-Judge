import { useState, useEffect } from "react";
import './App.css';
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

const server_URI = import.meta.env.VITE_SERVER_URI;

export default function ProblemTable() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [problems, setProblems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get(server_URI + "/problems", {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setProblems(response.data);
        setIsSuccessful(true);
      } catch (err) {
        console.error("❌ Error fetching problems:", err.message);
        setIsSuccessful(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProblems();
  }, []);

  if (isLoading) {
    return <h1>Loading...</h1>;
  }

  if (!isSuccessful) {
    return <h1>Error in Loading Problems</h1>;
  }

  return (
    <>
      <div className="">
        <nav className="flex justify-between items-center text-white  py-4  rounded-2xl">
          {/* Left side: Brand */}
          <div className="flex items-center gap-2 text-2xl font-bold text-blue-400">
            <span className="text-blue-400">
              Code<span className="text-violet-600">Shrine</span>⛩️
            </span>
          </div>

          {/* Right side: Nav links */}
         <div>
          <Link to="/profile" className="hover:text-blue-400 transition  text-lg mr-4">Profile</Link>
          <button
            className="bg-amber-400 text-white text-lg px-2 py-1 rounded-lg hover:text-blue-400 transition"
            onClick={() => {
              localStorage.removeItem("token");
              navigate('/home');
            }}
          >
            Logout
          </button>
          </div>
        </nav>
      </div>
      <div className="px-6 py-3">
        <h2 className="text-2xl font-bold mb-4">Problems</h2><div className="rounded-2xl overflow-hidden border border-gray-700 shadow-lg">
          <table className="glass-card table-auto w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-500 text-white rounded-t-2xl">
                <th className="px-4 py-2">Heading</th>
                <th className="px-4 py-2">Description</th>
                <th className="px-4 py-2">Difficulty</th>
              </tr>
            </thead>
            <tbody>
              {problems.map((problem, index) => (
                <tr
                  key={index}
                  className={`text-amber-500 transition ${index === problems.length - 1 ? "rounded-b-2xl" : ""
                    }`}
                >
                  <td className="px-4 py-2">
                    <a href={`/problems/${problem._id}`} className="hover:underline">
                      {problem.ProblemHeading}
                    </a>
                  </td>
                  <td className="px-4 py-2 max-w-xs truncate">
                    <a href={`/problems/${problem._id}`} className="hover:underline block">
                      {problem.Description}
                    </a>
                  </td>
                  <td className="px-4 py-2">
                    <button
                      onClick={() => navigate(`/problems/${problem._id}`)}
                      className={`py-1 px-3 rounded-xl text-white ${problem.Difficulty === "Easy"
                          ? "bg-green-600"
                          : problem.Difficulty === "Medium"
                            ? "bg-yellow-400"
                            : "bg-red-600"
                        } hover:text-blue-600`}
                    >
                      {problem.Difficulty}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
