const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config({path:"./.env"});
const Problem = require('./models/Problem');
const User = require('./models/User');
const Submission = require('./models/Submission')
const verifyToken = require('./middlewares/auth');
const verifyAdmin = require('./middlewares/permission');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const { stdout, stderr } = require('process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const { GoogleGenerativeAI } = require('@google/generative-ai');
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-latest" });


mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅Compiler connected to MongoDB Atlas");
}).catch((err) => {
  console.error("❌ Error connecting compiler to MongoDB:", err.message);
});

app.use(cors());
app.use(express.json());


app.post("/problems/:id/run", verifyToken, async (req,res)=>{
    const code = req.body.code;
    const testcase = req.body.testcase;

    const uniqueName = `${uuidv4()}`;
    const cppfile =   path.join("codes",`${uniqueName}.cpp`);
    fs.mkdirSync(path.dirname(cppfile),{recursive:true});
    fs.writeFileSync(cppfile,code);

    const userInputFile =  path.join("userInputs",`${uniqueName}.in`);
    fs.mkdirSync(path.dirname(userInputFile),{recursive:true});
    fs.writeFileSync(userInputFile,testcase);

    const executableFile = path.join("executables",`${uniqueName}.out`)
    fs.mkdirSync(path.dirname(executableFile),{recursive:true});
    function cleanUp(){
                    const files = [cppfile,userInputFile,executableFile];
            files.map((file)=>{
                if(fs.existsSync(file)){
                    fs.unlinkSync(file);
                }
            })
    }
    const compileCommand = `g++ ${cppfile} -o ${executableFile}`;
    exec(compileCommand,(err,stdout,stderr)=>{
        if(err){
            cleanUp();
            return res.json({
                "status" : "Compilation Error",
                "message" : stderr||err.message
            });
        }
        const executeCommand = `${executableFile} < ${userInputFile}`;
        exec(executeCommand,{timeout:3000},(err2,stdout2,stderr2)=>{
            cleanUp();
            if(err2){
                if(err2.killed && err2.signal === 'SIGTERM'){
                    return res.json({
                        "status" : "Time Limit Exceeded",
                        "message" : ""
                    });
                }
                return res.json({
                    "status":"Run Time Error",
                    "message" : stderr2||err2.message
                });
            } else {
                return res.json({
                    "status" : "Successful",
                    "message" : stdout2
                });
            }
        })

    });
})

app.post("/problems/:id/submit", verifyToken, async (req, res) => {
  let userId;
  try{
    const user = await User.findOne({username:req.user.username})
    userId = user._id;
  } catch(err) {
    console.log("error fetching userid");
    return res.status(404).json({message:err.message});
  }
  const { id } = req.params;
  let problem;
  try {
    problem = await Problem.findById(id);
    if (!problem) return res.status(404).json({ message: "Problem not found" });
  } catch (err) {
    return res.status(500).json({ message: "Server error" });
  }

  const code = req.body.code;
  const uniqueName = `${uuidv4()}`;
  const cppfile = path.join("codes", `${uniqueName}.cpp`);
  const executableFile = path.join("executables", `${uniqueName}.out`);
  const testcaseFolder = path.join("testcases", uniqueName);
  fs.mkdirSync(path.dirname(cppfile), { recursive: true });
  fs.mkdirSync(path.dirname(executableFile), { recursive: true });
  fs.mkdirSync(testcaseFolder, { recursive: true });

  fs.writeFileSync(cppfile, code);

  const filesToClean = [cppfile, executableFile];
  const directoriesToClean = [testcaseFolder];

  // Make sure cleanup function is defined before use in catch blocks
  function cleanUp() {
    for (const file of filesToClean) {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }
    for (const directory of directoriesToClean) {
      if (fs.existsSync(directory)) fs.rmSync(directory, { recursive: true, force: true });
    }
  }

  const compileCommand = `g++ ${cppfile} -o ${executableFile}`;
  try {
    await execAsync(compileCommand);
  } catch (err) {
    cleanUp();
    await SaveToDb({status:"Compilation Error"});
    return res.json({
      status: "Compilation Error",
      message: err.stderr || err.message
    });
  }

  for (let i = 0; i < problem.testcases.length; i++) {
    const testcase = problem.testcases[i];
    const testcaseFile = path.join(testcaseFolder, `${i}.in`);
    fs.writeFileSync(testcaseFile, testcase.input);
    filesToClean.push(testcaseFile);

    const executeCommand = `${executableFile} < ${testcaseFile}`;
    try {
      const { stdout } = await execAsync(executeCommand, { timeout: 3000 });
      if (stdout.trim() !== testcase.expectedOutput.trim()) {
        cleanUp();
        await SaveToDb({status:`Wrong Answer on testcase ${i + 1}`});
        return res.json({
          status: `Wrong Answer on testcase ${i + 1}`,
          message: ""
        });
      }
    } catch (err2) {
      cleanUp();
      if (err2.killed && err2.signal === 'SIGTERM') {
        await SaveToDb({status:"Time Limit Exceeded"});
        return res.json({ status: "Time Limit Exceeded", message: "" });
      }
      await SaveToDb({status:"Run Time Error"});
      return res.json({
        status: "Run Time Error",
        message: err2.stderr || err2.message
      });
    }
  }

  try {
    // --- FIX STARTS HERE: The full contents and generationConfig are restored ---
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Evaluate the following code for cleanliness as if it were written during a software engineering interview.

1. Assign a cleanliness score out of 100.
2. Justify the score briefly.
3. Give actionable feedback on:
   - Code formatting and readability
   - Naming conventions
   - Modularity and structure
   - Elimination of duplication (DRY principle)
   - Best practices (avoid bad habits, use idiomatic constructs)

Respond in the following JSON format:
{
  "score": <number>,
  "feedback": "<combined explanation and feedback>"
}

Here is the candidate's code:

${code}`
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0,
        topK: 1,
        topP: 1,
        maxOutputTokens: 1024
      }
    });
    // --- FIX ENDS HERE ---

    let responseText = await result.response.text();
    const jsonStartIndex = responseText.indexOf('{');
    const jsonEndIndex = responseText.lastIndexOf('}');

    if (jsonStartIndex === -1 || jsonEndIndex === -1) {
        throw new Error("Could not find a valid JSON object in the AI response.");
    }

    const jsonString = responseText.substring(jsonStartIndex, jsonEndIndex + 1);
    const response = JSON.parse(jsonString);

    await SaveToDb({
      status: "Accepted",
      message: {
        score: response.score,
        feedback: response.feedback,
      },
    });

    cleanUp();
    return res.json({
      status: "Accepted",
      message: {
        score: response.score,
        feedback: response.feedback,
      },
    });
  } catch (err) {
    cleanUp();
    console.error("AI Evaluation failed:", err);

    const statusCode = err.status || 500;
    const statusText = err.statusText || "AI Evaluation Failed";
    
    return res.status(statusCode).json({
      status: statusText,
      message: "Code passed all test cases, but AI feedback could not be generated. Please try again later.",
    });
  }


  async function SaveToDb(result){
    const submissionData = {
      code: code,
      problem: id,
      user: userId,
      status: result.status
    };

    if (result.message && result.message.score !== undefined) {
      submissionData.score = result.message.score;
    }
    if (result.message && result.message.feedback !== undefined) {
      submissionData.feedback = result.message.feedback;
    }

    const newSubmission = new Submission(submissionData);
    await newSubmission.save();
  }
});

const PORT = 7000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Compiler is running on http://0.0.0.0:${PORT}`);
});