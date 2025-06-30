import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import axios from "axios";
import Editor from "@monaco-editor/react";
import NavBar from './Navbar'


const SERVER_URI = import.meta.env.VITE_SERVER_URI;
const COMPILER_URI = import.meta.env.VITE_COMPILER_URI;

export default function ProblemPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSuccessful, setIsSuccessful] = useState(false);
    const [problem, setProblem] = useState(null);
    const [errorMessage, setErrorMessage] = useState("");
    const { id } = useParams();
    const [code, setCode] = useState(localStorage.getItem(`${id}:code`) || '');
    const [testcase, setTestcase] = useState(localStorage.getItem(`${id}:testcase`) || '');
    const [runMessage, setRunMessage] = useState(null);
    function handleRun() {
        setRunMessage(null);
        axios.post(`${COMPILER_URI}/problems/${id}/run`, {
            "code": code,
            "testcase": testcase
        },
            {
                headers: {
                    "Authorization": `bearer ${localStorage.getItem("token")}`
                },

            }
        ).then(function (response) { setRunMessage(response.data); console.log(response.data.message) })
            .catch((err) => { console.log(err.message); })
    }
    function handleSubmit() {
        setRunMessage(null);
        axios.post(`${COMPILER_URI}/problems/${id}/submit`, {
            "code": code
        },
            {
                headers: {
                    "Authorization": `bearer ${localStorage.getItem("token")}`
                },

            }
        ).then(function (response) { setRunMessage(response.data); console.log(response.data.message) })
            .catch((err) => { console.log(err.message); })
    }
    useEffect(() => {
        const token = localStorage.getItem("token");
        axios.get(SERVER_URI + `/problems/${id}`, {
            headers: {
                'Authorization': `bearer ${token}`
            }
        }).then(function (response) { setProblem(response.data); setIsLoading(false); setIsSuccessful(true); })
            .catch(function (err) { setIsLoading(false); setIsSuccessful(false); setErrorMessage(err.message) });
    }, [id]);

    if (isLoading) { return <div className="text-yellow-600"><h1>Loading</h1></div>; }
    if (!isSuccessful) { return <div className="text-yellow-600"><h1>{errorMessage}</h1></div>; }
    if (isSuccessful) {
        return (
            <div className="w-full bg-slate-900">
                <NavBar />
                <div className="flex justify-between items-start gap-4 w-full  px-4">
                    <div className=" w-full lg:w-1/2 bg-slate-500 p-4 rounded-2xl h-128 text-white">
                        <div className=" max-w-7xl  mx-auto bg-slate-500 rounded-t-2xl p-2">
                            <div className="flex justify-between items-center">
                                <h1 className=" px-2 text-3xl font-bold text-white">{problem.ProblemHeading}</h1>
                                <span className={`px-2 py-2 rounded-xl text-xl text-white ${problem.Difficulty === "Easy" ? "bg-green-600" : problem.Difficulty === "Medium" ? "bg-yellow-400" : "bg-red-600"} `}>
                                    {problem.Difficulty}
                                </span>
                            </div>
                        </div>
                        <div className="max-w-7xl mx-auto bg-slate-500 rounded-b-2xl ">
                            <div className=" text-lg text-white px-2 py-2 text-left ">
                                {problem.Description}
                            </div>
                        </div>
                    </div>
                    <div className="w-full">
                        <div className="h-128 rounded-2xl overflow-hidden border-2 border-gray-800 shadow-lg">
                            <Editor
                                language="cpp"
                                value={code}
                                onChange={(value) => {
                                    setCode(value);
                                    localStorage.setItem(`${id}:code`, value);
                                }}
                                onMount={(editor, monaco) => {
                                    monaco.editor.defineTheme('slate-800', {
                                        base: 'vs-dark',
                                        inherit: true,
                                        rules: [
                                            { token: 'comment', foreground: '94a3b8', fontStyle: 'italic' },     // text-slate-400
                                            { token: 'keyword', foreground: 'facc15' },                           // text-yellow-400
                                            { token: 'number', foreground: '38bdf8' },                            // text-sky-400
                                            { token: 'string', foreground: '34d399' },                            // text-emerald-400
                                            { token: 'identifier', foreground: 'fef9c3' },                        // text-yellow-100
                                        ],
                                        colors: {
                                            'editor.background': '#1e293b',                   // Tailwind bg-slate-800
                                            'editor.foreground': '#f1f5f9',                   // text-slate-100
                                            'editorLineNumber.foreground': '#64748b',         // text-slate-500
                                            'editorLineNumber.activeForeground': '#facc15',   // text-yellow-400
                                            'editorCursor.foreground': '#facc15',             // yellow cursor
                                            'editor.selectionBackground': '#334155',          // bg-slate-700
                                            'editorIndentGuide.background': '#334155',
                                            'editorIndentGuide.activeBackground': '#64748b',
                                        }
                                    }); // ← paste theme here
                                    monaco.editor.setTheme('slate-800');
                                }}

                                theme="slate-dark"
                                height="500px"
                            />
                        </div>
                    </div>
                </div>
                <div className="px-4 flex justify-between my-4">
                    <textarea
                        value={testcase}
                        onChange={(event) => { setTestcase(event.target.value); localStorage.setItem(`${id}:testcase`, event.target.value); }}
                        placeholder=" testcase"
                        className="w-1/2 h-50 p-2 text-md bg-slate-700 text-amber-50  rounded-2xl"
                    />
                    <span className=" ml-8 bg-slate-500 shadow-lg h-50 w-1/2 rounded-2xl">
                        <button onClick={handleRun} className="bg-amber-300 mt-8  mb-4 gap mx-2 text-2xl text-white w-3xs rounded-xl focus:ring-amber-500  focus:ring-2">run</button>
                        <button onClick={handleSubmit} className="bg-green-400 mt-4 mb-8 text-2xl text-white w-3xs rounded-xl focus:ring-green-600  focus:ring-2">submit</button>
                    </span>
                </div>
                {runMessage && (
                    <div className = "px-4">
                    <div className="p-2 mt-2 bg-slate-500 w-full shadow-black rounded-2xl">
                        <div className="flex items-center gap-2 text-left font-semibold text-xl">
                            <span className="text-amber-600 text-2xl">Result:</span>
                            <span className={`${(runMessage.status === "Successful" || runMessage.status === "Accepted") ? "text-green-600" : "text-red-600"} text-2xl`}>
                                {runMessage.status}
                            </span>
                        </div>
                        <div className="text-md text-white px-2 py-2 text-left">
                            {runMessage.message}
                        </div>
                    </div>
                    </div>
                )}
            </div>
        )
    }
}