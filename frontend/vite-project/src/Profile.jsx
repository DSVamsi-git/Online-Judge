import { useState, useEffect } from 'react'; 
import './App.css';
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom';

const server_URI = import.meta.env.VITE_SERVER_URI;

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");  

    if (token) {
      axios.get(`${server_URI}/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      .then(() => setLoading(false))
      .catch(() => navigate('/login'));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  if (loading) return <div>Loading...</div>;
  return (
            <>
            <h1>Profile</h1>
            <h2>
            <a href = "/problems">Problems page</a>
            </h2>
            </>
        );
}
