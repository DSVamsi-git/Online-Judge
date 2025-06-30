import { useState, useEffect } from "react";
import './App.css';
import axios from "axios";
import { useNavigate } from "react-router-dom";

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
          <nav className="flex justify-between items-center bg-slate-900 text-white  py-4  rounded-2xl">
      {/* Left side: Brand */}
      <div className="flex items-center gap-2 text-2xl font-bold text-blue-400">
        <span className="text-blue-400">
        Code<span className="text-gray-400">Case</span>💼
        </span>
      </div>

      {/* Right side: Nav links */}
      <button
        className="bg-amber-400 text-white text-lg px-2 py-1 rounded-lg hover:text-blue-400 transition"
        onClick={() => {
          localStorage.removeItem("token");
          navigate('/login');
        }}
      >
        Logout
      </button>
    </nav>
    </div>
    <div className="px-6 py-3">
      <h2 className="text-2xl font-bold mb-4">Problems</h2>
      <div className="bg-gray-800 rounded-2xl">
      <table className="table-auto w-full border border-gray-300 overflow-hidden rounded-2xl">
        <thead>
          <tr className="bg-gray-500 rounded-2xl">
            <th className="border px-4 py-2">Heading</th>
            <th className="border px-4 py-2">Description</th>
            <th className="border px-4 py-2">Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {problems.map((problem, index) => (
            <tr key={index}>
              <td className="border px-4 py-2"> 
                <a href={`/problems/${problem._id}`} className="text-amber-500 hover:underline">{problem.ProblemHeading}</a>
              </td>
              <td className="border px-4 py-2">
                <a href={`/problems/${problem._id}`} className="text-amber-500 hover:underline">{problem.Description}</a>
              </td>
              <td className="border px-4 py-2">
                <button onClick={()=>{navigate(`/problems/${problem._id}`)}} className={` py-1 px-3 rounded-xl ${problem.Difficulty === "Easy"? "bg-green-600": problem.Difficulty === "Medium" ? "bg-yellow-400" : "bg-red-600"} hover:text-blue-600`}>{problem.Difficulty}</button>
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
