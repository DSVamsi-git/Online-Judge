import './App.css';
import './index.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Home'
import Login from './Login';
import Signup from './Signup';
import Profile from './Profile';
import ProblemTable from './ProblemTable';
import ProblemPage from './ProblemPage';
import Submissions from './Submissions';
import AddProblem from './AddProblem';
import ModifyProblem from './ModifyProblem';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Profile />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/problems" element={<ProblemTable />} />
        <Route path="/problems/:id" element={<ProblemPage />} />
        <Route path="/problems/:id/submissions" element={<Submissions/>}/>
        <Route path="/AddProblem" element={<AddProblem/>}/>
        <Route path="/problems/:id/modify" element={<ModifyProblem/>}/>
      </Routes>
    </Router>
  );
}

export default App;
