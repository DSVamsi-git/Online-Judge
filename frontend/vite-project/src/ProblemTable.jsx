import { useState, useEffect } from "react";
import './App.css';
import axios from "axios";

const server_URI = import.meta.env.VITE_SERVER_URI;

export default function ProblemTable() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [problems, setProblems] = useState([]);

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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Problems</h2>
      <table className="table-auto w-full border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Heading</th>
            <th className="border px-4 py-2">Description</th>
            <th className="border px-4 py-2">Difficulty</th>
          </tr>
        </thead>
        <tbody>
          {problems.map((problem, index) => (
            <tr key={index}>
              <td className="border px-4 py-2"> 
                <a href={`/problems/${problem._id}`} className="text-blue-600 hover:underline">{problem.ProblemHeading}</a>
              </td>
              <td className="border px-4 py-2">
                <a href={`/problems/${problem._id}`} className="text-blue-600 hover:underline">{problem.Description}</a>
              </td>
              <td className="border px-4 py-2">
                <a href={`/problems/${problem._id}`} className="text-blue-600 hover:underline">{problem.Difficulty}</a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
