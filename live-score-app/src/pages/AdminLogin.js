import React, { useState } from 'react';
import axios from 'axios';
import { Card, Form, Button, Container } from 'react-bootstrap';
import Navigation from './Navbar';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { toast, ToastContainer } from 'react-toastify'; // Import toast and ToastContainer
import { API_URL, WEBSOCKET_URL } from './apiConfig';
import 'react-toastify/dist/ReactToastify.css'; // Import the default style

function AdminLogin() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate(); // Create a navigate function

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/admin/login`, { username, password });

      if (response.data.token) {
        localStorage.setItem('adminToken', response.data.token);
        // console.log('Login successful');
        toast.success('Login successful', {
          position: 'top-right',
          autoClose: 3000, // Auto-close the notification after 3 seconds
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        navigate('/adminpage');
      } 
    } catch (error) {
      toast.error('Invalid username or password', {
        position: 'top-right',
        autoClose: 3000, // Auto-close the notification after 3 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      console.error(error);
    }
  };
  return (
    <div>
    <Navigation />
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: "100vh" }}>
      <div className="w-100" style={{ maxWidth: "400px" }}>
        <Card>
          <Card.Body>
            <h2 className="text-center mb-4">Admin Login</h2>
            <Form onSubmit={handleSubmit}>
              <Form.Group id="username">
                <Form.Label>Username</Form.Label>
                <Form.Control type="text" value={username} onChange={e => setUsername(e.target.value)} required />
              </Form.Group>
              <Form.Group id="password">
                <Form.Label>Password</Form.Label>
                <Form.Control type="password" value={password} onChange={e => setPassword(e.target.value)} required />
              </Form.Group>
              <Button className="w-100" type="submit">Log In</Button>
            </Form>
            <ToastContainer /> {/* Add ToastContainer here */}

          </Card.Body>
        </Card>
      </div>
    </Container>
    </div>
  );
}

export default AdminLogin;
