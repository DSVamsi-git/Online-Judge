import { useEffect, useState } from "react";
import { useParams } from 'react-router-dom';
import axios from "axios";

const SERVER_URI = import.meta.env.VITE_SERVER_URI

export default function ProblemPage(){ 
    const [isLoading,setIsLoading] = useState(true);
    const [isSuccessful,setIsSuccessful] = useState(false);
    const [problem,setProblem] = useState(null);    
    const [errorMessage,setErrorMessage] = useState("");
    const { id } = useParams();     
    const [code, setCode] = useState('');           
    const [testcase, setTestcase] = useState(''); 
    function handleRun(){
        axios.post(`${SERVER_URI}/problems/${id}`,{
                "code":code,
                "tescase":testcase
            },
            {
            headers:{
                "Authorization":localStorage.getItem("token")
            },

        }
        )
    }    
        function handleSubmit(){
    }                                          
    useEffect(()=>{
        const token = localStorage.getItem("token");
        axios.get(SERVER_URI+`/problems/${id}`,{
            headers : {
                'Authorization' : `bearer ${token}`
            }
        }).then(function (response){setProblem(response.data); setIsLoading(false); setIsSuccessful(true);})
          .catch(function(err){ setIsLoading(false); setIsSuccessful(false); setErrorMessage(err.message)});
    })

    if( isLoading ){ return <div className="text-yellow-600"><h1>Loading</h1></div>;}
    if( !isSuccessful ){ return <div className="text-yellow-600"><h1>{errorMessage}</h1></div>; }
    if( isSuccessful ){ return (
        <>
        <div className="min-h-screen bg-gray-50 p-8">
          <div className=" max-w-7xl  mx-auto bg-white shadow-lg rounded-t-2xl p-2">
            <div className="flex justify-between items-center">
              <h1 className=" px-2 text-3xl font-bold text-gray-800">{problem.ProblemHeading}</h1>
              <span className={`px-2 py-2 rounded-xl text-xl text-white ${problem.Difficulty==="Easy"? "bg-green-600" : problem.Difficulty==="Medium"? "bg-yellow-400": "bg-red-600"} `}>
                {problem.Difficulty}
              </span>
            </div>
          </div>
          <div className="max-w-7xl mx-auto bg-white shadow-lg rounded-b-2xl ">
            <div className=" text-lg text-shadow-black px-2 py-2 text-left ">
                {problem.Description}
            </div>
          </div>
            <div className="p-2 mt-3">
                <div className="text-lg font-semibold mb-2 text-gray-800">
                    Write your code below:
                </div>
                <textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Type your code here..."
                    className="w-full h-150 p-4 text-md bg-gray-800 text-amber-50 border border-gray-300 rounded-lg "
                />
            </div>
            <div className="p-2 flex justify-between">
                <textarea 
                    value = {testcase}
                    onChange={(event)=>setTestcase(event.target.value)}
                    placeholder=" testcase"
                    className="w-3xl h-50 p-2 text-md bg-gray-800 text-amber-50 border border-gray-300 rounded-lg"
                />
                <span className=" bg-white shadow-lg h-50 w-xl rounded-lg">
                    <button onClick={handleRun} className="bg-amber-300 mt-8  mb-4 text-2xl text-white w-2xs rounded-xl focus:ring-amber-500  focus:ring-2">run</button>
                    <button onClick={handleSubmit} className="bg-green-400 mt-4 mb-8 text-2xl text-white w-2xs rounded-xl focus:ring-green-600  focus:ring-2">submit</button>                    
                </span>
            </div>     
            <div className="p-2 mt-2 bg-white w-full ">
                <div className="text-red-600 text-2xl text-left font-semibold">Result:</div>
            </div>       
        </div>
        </>
    )}
}