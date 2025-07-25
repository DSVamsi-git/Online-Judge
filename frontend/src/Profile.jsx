import { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip  as RechartsTooltip,
  ResponsiveContainer
} from 'recharts';



const server_URI = import.meta.env.VITE_SERVER_URI;

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [chartData, setChartData] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [userName, setUsername] = useState("");
  const [userRole, setUserRole] = useState("user");
  const [submissionList, setSubmissionList] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate('/home');
        return;
      }
      try {
        const response = await axios.get(`${server_URI}/profile`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const { stats, submissions, user } = response.data;
        console.log("Username from server:", user.username);
        setSubmissionList(submissions);
        setUsername(user.username);
        setUserRole(user.role);
        const Difficulties = ['Easy', 'Medium', 'Hard'];
        const counts = [0, 0, 0];
        stats.forEach((item) => {
          const index = Difficulties.indexOf(item._id);
          if (index !== -1) counts[index] = item.count;
        });

        setChartData({
          labels: Difficulties,
          datasets: [
            {
              label: 'Submissions per Difficulty',
              data: counts,
              backgroundColor: ['#10b981', '#f59e0b', '#ef4444']
            }
          ]
        });

        const cleanedData = submissions
          .filter((s) => typeof s.score === "number") // ensure score exists
          .map((s) => ({
            time: new Date(s.createdAt).getTime(), // timestamp for X-axis
            score: s.score                         // score for Y-axis
          }));

        setGraphData(cleanedData);
        setLoading(false);
      } catch (err) {
        navigate('/home');
      }
    };

    fetchData();
  }, [navigate]);


  if (loading) return <div><h1>Loading...</h1></div>;
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
            {userRole === "admin" && (
              <button
                className="py-1 px-2 bg-amber-400 rounded-lg text-white text-lg hover:text-blue-400 transition"
                onClick={() => navigate('/AddProblem')}
              >
                AddProblem
              </button>
            )}
            <Link to="/problems" className="hover:text-blue-400 transition">Problems</Link>
            <button
              className="py-1 px-2 bg-amber-400 rounded-lg text-white text-lg hover:text-blue-400 transition"
              onClick={() => {
                localStorage.removeItem("token");
                navigate('/home');
              }}
            >
              logout
            </button>
          </div>

        </nav>
      </div>
      <div className='flex justify-between items-center'>
        <div className='glass-card h-64 w-1/2 rounded-2xl m-2 
            flex justify-center items-center 
            text-amber-600 text-4xl font-bold'>
          {userName}
        </div>
        <div className='glass-card h-64 w-1/2 rounded-2xl m-2 py-2 px-16 border-amber-500'>
          <Pie
            className='left-1'
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                legend: {
                  position: 'bottom',
                  labels: {
                    color: '#f1f5f9', // light text for dark mode
                    font: {
                      size: 14,
                    },
                  },
                },
                tooltip: {
                  callbacks: {
                    label: (context) =>
                      `${context.label}: ${context.parsed} submissions`,
                  },
                },
              },
            }}
          />
        </div>
      </div>
      {graphData && graphData.length > 0 && (
        <div className="m-4 p-4 glass-card rounded-2xl text-white">
          <h2 className="text-2xl text-amber-400 mb-4">Clean Score</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={graphData}>
              <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
              <XAxis
                dataKey="time"
                domain={['auto', 'auto']}
                name="Time"
                tickFormatter={(unixTime) =>
                  new Date(unixTime).toLocaleDateString()
                }
                type="number"
              />
              <YAxis />
              <RechartsTooltip
                labelFormatter={(label) =>
                  new Date(label).toLocaleString()
                }
              />
              <Line type="monotone" dataKey="score" stroke="#facc15" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className='h-128, w-full'>
        <div className="px-6 py-3">
          <div className="glass-card rounded-2xl">
            <table className="table-auto w-full border border-gray-300 overflow-hidden rounded-2xl">
              <thead>
                <tr className="bg-gray-500">
                  <th className="border px-4 py-2">Status</th>
                  <th className="border px-4 py-2">Problem</th>
                  <th className="border px-4 py-2">Language</th>
                  <th className="border px-4 py-2">Time</th>
                  <th className="border px-4 py-2">Clean Score</th>
                  <th className="border px-4 py-2">Code</th>
                </tr>
              </thead>
              <tbody>
                {submissionList.map((submission, index) => (
                  <tr key={index}>
                    <td className="border border-white px-4 py-2"><button className={`p-2 rounded-2xl ${submission.status === "Accepted" ? "bg-green-500" : "bg-red-500"}`}>{submission.status}</button></td>
                    <td className="border border-white px-4 py-2 text-amber-500 on hover:underline"><a href={`/problems/${submission.referencedProblem._id}`} >{submission.referencedProblem.ProblemHeading}</a></td>
                    <td className="border border-white px-4 py-2 text-amber-500">{submission.language}</td>
                    <td className="border border-white px-4 py-2 text-amber-500">
                      {new Date(submission.createdAt).toLocaleString()}
                    </td>
                    <td className="border border-white px-4 py-2 text-amber-500">{submission.score}</td>
                    <td className="border border-white px-4 py-2"><button onClick={() => { localStorage.setItem(`${submission.problem}:code`, submission.code); localStorage.setItem(`${submission.problem}:runMessage`,JSON.stringify({status:submission.status, message:{score:submission.score, feedback: submission.feedback}})); navigate(`/problems/${submission.problem}`); }} className="rounded-lg bg-black text-amber-500 hover:text-blue-600">{`</>`}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
