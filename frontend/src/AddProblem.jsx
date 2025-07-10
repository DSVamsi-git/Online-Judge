import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AddProblem() {
    const navigate = useNavigate();
    const [heading, setHeading] = useState(() => localStorage.getItem('heading') || '');
    const [description, setDescription] = useState(() => localStorage.getItem('description') || '');
    const [difficulty, setDifficulty] = useState('Easy');
    const [testcases, setTestcases] = useState(() => {
        try {
            const saved = localStorage.getItem('testcases');
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
            await axios.post(`${import.meta.env.VITE_SERVER_URI}/AddProblem`, {
                ProblemHeading: heading,
                Description: description,
                Difficulty: difficulty,
                testcases: testcases,
            }, {
                headers: {
                    Authorization: `bearer ${localStorage.getItem('token')}`
                }
            })
            alert('Problem added successfully✅')
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
        localStorage.setItem('testcases', JSON.stringify(testcases));
    }, [testcases]);

    return (
        <div className='w-full flex min-h-screen items-center justify-center'>
            <div className='w-1/2 bg-slate-700 p-4 rounded-2xl'>
                <div className='my-4'>
                    <input
                        type='text'
                        value={heading}
                        onChange={(e) => {
                            setHeading(e.target.value);
                            localStorage.setItem('heading', e.target.value);
                        }}
                        placeholder='Heading'
                        className='bg-slate-500 text-white placeholder-gray-300 rounded-xl w-full p-2'
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
                        className='bg-slate-500 text-white placeholder-gray-300 rounded-xl w-full p-2 min-h-96'
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
                                className='bg-slate-500 text-white placeholder-gray-300 rounded-xl w-full p-2 mb-2 min-h-32'
                            />
                            <textarea
                                value={testcase.expectedOutput}
                                onChange={(e) => handleTestcaseChange(index, 'expectedOutput', e.target.value)}
                                placeholder={`Testcase ${index + 1} expected output`}
                                className='bg-slate-500 text-white placeholder-gray-300 rounded-xl w-full p-2'
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
    );
}
