import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate,Link } from "react-router-dom";

const server_URI = import.meta.env.VITE_SERVER_URI;

export default function Submissions() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSuccessful, setIsSuccessful] = useState(false);
  const [submissionList, setSubmissionList] = useState([]);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await axios.get(`${server_URI}/problems/${id}/submissions`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        setSubmissionList(response.data);
        setIsSuccessful(true);
      } catch (err) {
        setErrorMessage(err.response?.data?.message || err.message);
        setIsSuccessful(false);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [id]);

  if (isLoading) {
    return <div className="text-yellow-600"><h1>Loading...</h1></div>;
  }

  if (!isSuccessful) {
    return <div className="text-red-600"><h1>{errorMessage}</h1></div>;
  }

  return (
    <>
      <div className="p-4">
                    <nav className="flex justify-between items-center bg-slate-900 text-white  py-4 shadow-md rounded-2xl">
            {/* Left side: Brand */}
            <div className="flex items-center gap-2 text-2xl font-bold text-blue-400">
                <span className="text-blue-400">
                Code<span className="text-gray-400">Case</span>💼
                </span>
            </div>

            {/* Right side: Nav links */}
            <div className="flex gap-6 text-lg">
                <Link to={`/problems/${id}`} className="hover:text-blue-400 transition">Problem</Link>
                <Link to="/problems" className="hover:text-blue-400 transition">Problems</Link>
                <Link to="/profile" className="hover:text-blue-400 transition">Profile</Link>
                <button className="py-1 px-2 bg-amber-400 rounded-lg text-white text-lg hover:text-blue-400 transition" onClick={()=>{localStorage.removeItem("token");navigate('/login')}}>logout</button>
            </div>
            </nav>
      </div>

      <div className="px-6 py-3">
        <h2 className="text-2xl font-bold mb-4">Submissions</h2>
        <div className="bg-gray-800 rounded-2xl">
          <table className="table-auto w-full border border-gray-300 overflow-hidden rounded-2xl">
            <thead>
              <tr className="bg-gray-500">
                <th className="border px-4 py-2">Status</th>
                <th className="border px-4 py-2">Language</th>
                <th className="border px-4 py-2">Time</th>
                <th className="border px-4 py-2">Code</th>
              </tr>
            </thead>
            <tbody>
              {submissionList.map((submission, index) => (
                <tr key={index}>
                  <td className="border border-white px-4 py-2"><button className={`p-2 rounded-2xl ${submission.status==="Accepted"?"bg-green-500":"bg-red-500"}`}>{submission.status}</button></td>
                  <td className="border border-white px-4 py-2 text-amber-500">{submission.language}</td>
                  <td className="border border-white px-4 py-2 text-amber-500">
                    {new Date(submission.createdAt).toLocaleString()}
                  </td>
                  <td className="border border-white px-4 py-2"><button onClick={()=>{localStorage.setItem(`${id}:code`,submission.code);navigate(`/problems/${id}`);}} className="rounded-lg bg-black text-amber-500 hover:text-blue-600">{`</>`}</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
