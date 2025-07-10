const express = require('express');
const app = express();
const cors = require('cors');
const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config({ path: "./.env" });
const Problem = require('./models/Problem');
const User = require('./models/User');
const Submission = require('./models/Submission');
const verifyToken = require('./middlewares/auth');
const verifyAdmin = require('./middlewares/permission');

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("✅Server Connected to MongoDB Atlas");
}).catch((err) => {
  console.error("❌ Error connecting server to MongoDB:", err.message);
});

app.use(cors());
app.use(express.json());


app.get('/', (req, res) => {
  res.send("working🚀");
});

app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const userExisting = await User.findOne({ username });

    if (!userExisting) {
      return res.status(404).json({ message: "User doesn't exist ❌" });
    }

    const passwordValid = await bcrypt.compare(password, userExisting.password);

    if (!passwordValid) {
      return res.status(400).json({ message: "Invalid password ❌" });
    }

    const token = jwt.sign(
      { username: userExisting.username, role: userExisting.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: '30d' }
    );

    res.status(200).json({
      message: "Welcome back ✅",
      token: token
    });

  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Server side error ❌" });
  }
});


app.post('/signup', async (req, res) => {
  const userExists = await User.findOne({ username: req.body.username });

  if (userExists) {
    res.send("Username already exists ❌");
  } else {
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    NewUser = new User({
      username: req.body.username,
      password: hashedPassword
    });
    await NewUser.save();
    res.send("Signup successful ✅");
  }
});

app.get('/profile', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    const submissions = await Submission.aggregate([
      {
      $match : { 
          user: user._id,
          status: "Accepted"
        },
     },     
     {
        $lookup: {
          from: "problems",                     
          localField: "problem",                 
          foreignField: "_id",                   
          as: "referencedProblem"
        }
     },{
        $unwind: "$referencedProblem"      
      }
    ]).sort({ createdAt: -1 });
    const stats = await Submission.aggregate([
      {
        $match: {
          user: user._id,
          status: "Accepted"
        }
      },
      {
        $lookup: {
          from: "problems",                     
          localField: "problem",                 
          foreignField: "_id",                   
          as: "problemUserSubmissions"
        }
      },
      {
        $unwind: "$problemUserSubmissions"      
      },
      {
        $group: {
          _id: "$problemUserSubmissions.Difficulty",  
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      'stats': stats,
      'submissions':submissions,
      'user':{
        'username':user.username,
        'role' : user.role
      }
    })
  } catch (err) {
    console.log(err.message);
    res.status(500).json(err.message);
  }
});

app.get('/problems', verifyToken, async (req, res) => {
  try {
    const problemSet = await Problem.find({});
    res.status(200).json(problemSet);
  } catch (err) {
    res.status(500).json({ message: "Server error while fetching problems" });
  }
});

app.get('/problems/:id', verifyToken, async (req, res) => {
  try {
    const problem = await Problem.findOne({ _id: req.params.id });
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }
    res.status(200).json({problem:problem,user:{role:req.user.role}});
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});
// Make sure this import is correct


app.post('/AddProblem', verifyToken, verifyAdmin, async (req, res) => {  console.log("line 168");
  try {
    const newProblem = new Problem({
      ProblemHeading: req.body.ProblemHeading,
      Description: req.body.Description,
      Difficulty: req.body.Difficulty,
      testcases: req.body.testcases,
      Author: req.user.username // ✅ secure: use from token, not body
    });

    await newProblem.save(); // ✅ await needed here

    res.status(201).json({ message: "Problem saved successfully ✅" });
  } catch (err) {
    console.error("❌ Error saving problem:", err.message);
    res.status(500).json({ message: "Server error saving problem ❌" });
  }
});

app.put('/problems/:id/modify', verifyToken, verifyAdmin, async (req, res) => {
  try {                                                                console.log('line 188');
    const UpdatedProblem = {
      'ProblemHeading': req.body.ProblemHeading,
      'Description': req.body.Description,
      'Difficulty': req.body.Difficulty,
      'testcases': req.body.testcases,
      'Author': req.user.username
    };                                                                console.log('line 195');
    const updated = await Problem.findByIdAndUpdate(req.params.id, UpdatedProblem);
    if (updated) {
      res.status(200).json({ 'message': "Updated Successfully" });
    } else {
      res.status(404).json({ 'message': "Problem Not found" });
    }

  } catch (err) {
    console.error("❌ Error saving problem:", err.message);
    res.status(500).json({ message: "Server error saving problem ❌" });
  }
});

app.delete('/problems/:id', verifyToken, verifyAdmin, async (req, res) => {
  try {
    const {id} = req.params;                                                                  
    const problem = await Problem.findOne({ _id : id });                                     
    if(problem.Author!==req.user.username){                                                   
     return res.status(403).json({message:`contact author : ${problem.Author}`});                 
    }
    const deleted = await Problem.findByIdAndDelete(req.params.id);
    if (deleted) {
      res.status(200).json({ 'message': "Problem deleted" });
    }
    else {
      res.status(404).json({ 'message': "Problem Not Found" });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ 'message': `${err.message}` });
  }
})

app.get('/problems/:id/submissions', verifyToken, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.user.username });
    const { id } = req.params;
    const submissions = await Submission.find({ user: user._id, problem: id }).sort({ createdAt: -1 });
    res.json(submissions);
  } catch (err) {
    console.log(err.message);
    res.status(500).json(err.message);
  }
})

app.get('/problems/:id/modify', verifyToken, verifyAdmin,  async (req, res) => {
  try {
    const {id} = req.params;                                                                  
    const problem = await Problem.findOne({ _id : id });                                     
    if(problem.Author!==req.user.username){                                                   
     return res.status(403).json({message:`contact author : ${problem.Author}`});                 
    }
    res.json(problem);                                                                        
  } catch (err) {
    console.log(err.message);
    res.status(500).json(err.message);
  }  
})

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
