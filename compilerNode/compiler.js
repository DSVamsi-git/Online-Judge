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
const verifyToken = require('../backend/middlewares/auth');
const verifyAdmin = require('../backend/middlewares/permission');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { exec } = require('child_process');
const { stdout, stderr } = require('process');
const { promisify } = require('util');
const execAsync = promisify(exec);

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

  const compileCommand = `g++ ${cppfile} -o ${executableFile}`;
  try {
    await execAsync(compileCommand);
  } catch (err) {
    cleanUp();
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
        return res.json({
          status: `Wrong Answer on testcase ${i + 1}`,
          message: ""
        });
      }
    } catch (err2) {
      cleanUp();
      if (err2.killed && err2.signal === 'SIGTERM') {
        return res.json({ status: "Time Limit Exceeded", message: "" });
      }
      return res.json({
        status: "Run Time Error",
        message: err2.stderr || err2.message
      });
    }
  }

  cleanUp();
  return res.json({
    status: "Accepted",
    message: ""
  });

  function cleanUp() {
    for (const file of filesToClean) {
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }
  }
});

PORT=7000
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
