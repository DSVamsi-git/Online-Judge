import { useParams } from "react-router-dom";
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
const server_URI = import.meta.env.VITE_SERVER_URI;

export default function ModifyProblem() {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const { id } = useParams();
    const [heading, setHeading] = useState(() => localStorage.getItem(`${id}heading`) || '');
    const [description, setDescription] = useState(() => localStorage.getItem(`${id}description`) || '');
    const [difficulty, setDifficulty] = useState('Easy');
    const [testcases, setTestcases] = useState(() => {
        try {
            const saved = localStorage.getItem(`${id}testcases`);
            return saved ? JSON.parse(saved) : [{ input: '', expectedOutput: '' }];
        } catch {
            return [{ input: '', expectedOutput: '' }];
        }
    });

    const handleTestcaseChange = (index, field, value) => {
        const updatedTestcases = [...testcases];
        updatedTestcases[index][field] = value;
        setTestcases(updatedTestcases);
    };

    const addTestcase = () => {
        setTestcases([...testcases, { input: '', expectedOutput: '' }]);
    };

    const handleSubmit = async () => {
        try {
            await axios.put(`${import.meta.env.VITE_SERVER_URI}/problems/${id}/modify`, {
                ProblemHeading: heading,
                Description: description,
                Difficulty: difficulty,
                testcases: testcases,
            }, {
                headers: {
                    Authorization: `bearer ${localStorage.getItem('token')}`
                }
            })
            alert('Problem modified successfully✅')
            navigate('/profile');
        } catch (error) {
            alert(`${error.message}`);
        }
    };

    const handleRemoveTestCase = (index) => {
        const newTests = testcases.filter((_, i) => i !== index);
        setTestcases(newTests);
    };

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("token");
            if (!token) {
                navigate('/home');
                return;
            } console.log('line 63');
            try {
                const response = await axios.get(`${server_URI}/problems/${id}/modify`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                setHeading(response.data.ProblemHeading); localStorage.setItem(`${id}heading`, response.data.ProblemHeading);
                setDescription(response.data.Description); localStorage.setItem(`${id}description`, response.data.Description);
                setDifficulty(response.data.Difficulty); localStorage.setItem(`${id}difficulty`, response.data.Difficulty);
                setTestcases(response.data.testcases); localStorage.setItem(`${id}testcases`, JSON.stringify(response.data.testcases));
                setLoading(false);
            } catch (err) {
                navigate('/home');
            }
        };

        fetchData();
    }, [navigate]);

    useEffect(() => {
        localStorage.setItem(`${id}testcases`, JSON.stringify(testcases));
    }, [testcases]);

    if (loading) return <div>Loading...</div>;

    return (
        <>
         <div className="p-4">
                <nav className="w-full flex justify-between items-center text-white  py-4 rounded-2xl">
                    {/* Left side: Brand */}
                    <div className="flex items-center gap-2 text-2xl font-bold text-blue-400">
                        <span className="text-blue-400">
                            Code<span className="text-violet-600">Shrine</span>⛩️
                        </span>
                    </div>

                    {/* Right side: Nav links */}
                    <div className="flex gap-6 text-lg">
                        <Link to={`/problems/${id}`} className="hover:text-blue-400 transition">Problem</Link>
                        <Link to="/problems" className="hover:text-blue-400 transition">Problems</Link>
                        <Link to="/profile" className="hover:text-blue-400 transition">Profile</Link>
                        <button className="py-1 px-2 bg-amber-400 rounded-lg text-white text-lg hover:text-blue-400 transition" onClick={() => { localStorage.removeItem("token"); navigate('/home') }}>logout</button>
                    </div>
                </nav>
            </div>
        <div className='w-full flex min-h-screen items-center justify-center'>
            <div className='w-1/2 glass-card p-4 rounded-2xl'>
                <div className='my-4'>
                    <input
                        type='text'
                        value={heading}
                        onChange={(e) => {
                            setHeading(e.target.value);
                            localStorage.setItem('heading', e.target.value);
                        }}
                        placeholder='Heading'
                        className='glass-card text-white placeholder-gray-300 rounded-xl w-full p-2'
                    />
                </div>
                <div className='my-4'>
                    <textarea
                        value={description}
                        onChange={(e) => {
                            setDescription(e.target.value);
                            localStorage.setItem('description', e.target.value);
                        }}
                        placeholder='Description'
                        className='glass-card text-white placeholder-gray-300 rounded-xl w-full p-2 min-h-96'
                    />
                </div>
                <div className='my-4'>
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className={`${difficulty === "Easy" ? "bg-green-500" : difficulty === "Medium" ? "bg-amber-500" : "bg-red-500"} text-white w-full p-2`}
                    >
                        <option value="Easy" className='bg-green-500 text-white'>Easy</option>
                        <option value="Medium" className='bg-amber-500 text-white'>Medium</option>
                        <option value="Hard" className='bg-red-500 text-white'>Hard</option>
                    </select>
                </div>
                <div className='my-4'>
                    {testcases.map((testcase, index) => (
                        <div key={index} className='mb-4'>
                            <textarea
                                value={testcase.input}
                                onChange={(e) => handleTestcaseChange(index, 'input', e.target.value)}
                                placeholder={`Testcase ${index + 1} input`}
                                className='glass-card text-white placeholder-gray-300 rounded-xl w-full p-2 mb-2 min-h-32'
                            />
                            <textarea
                                value={testcase.expectedOutput}
                                onChange={(e) => handleTestcaseChange(index, 'expectedOutput', e.target.value)}
                                placeholder={`Testcase ${index + 1} expected output`}
                                className='glass-card text-white placeholder-gray-300 rounded-xl w-full p-2'
                            />
                            <div className='text-right'>
                                <button
                                    onClick={() => { handleRemoveTestCase(index) }}
                                    className='bg-red-500 text-white px-4 py-2 rounded-xl hover:bg-red-600 w-fit'>Remove
                                </button>
                            </div>
                        </div>
                    ))}
                    <div className='flex flex-col gap-2 mt-4 items-center'>
                        <button
                            onClick={addTestcase}
                            className='bg-amber-500 text-white px-4 py-2 rounded-xl hover:bg-amber-600 w-fit'
                        >
                            + Add Testcase
                        </button>
                        <button
                            onClick={handleSubmit}
                            className='bg-green-500 text-white px-4 py-2 rounded-xl hover:bg-green-600 w-fit'
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
}