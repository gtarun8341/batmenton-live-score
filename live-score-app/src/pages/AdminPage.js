import React, { useState, useEffect } from 'react';
import { Form, Button, Table, Row, Col,ButtonGroup } from 'react-bootstrap';
import axios from 'axios';
import Modal from 'react-modal';
import ScoreSetting from './ScoreSetting';
import Navigation from './Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL, WEBSOCKET_URL } from './apiConfig';

Modal.setAppElement('#root'); // Set the app element for React Modal

function AdminPage() {
  const initialFormData = {
    courtNumber: '',
    player1Name: '',
    player2Name: '',
    category: '',
    round: '',
    umpireName: '',
    userId: '',
    password: '',
    matchCode: '',
    status: ''
  };
  const [tournamentName, setTournamentName] = useState('');
  const [tournamentId, setTournamentId] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [tournamentExists, setTournamentExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState(Array(6).fill(initialFormData));
  const [showScoreSetting, setShowScoreSetting] = useState(false);
  const [scoreSettingData, setScoreSettingData] = useState(null);
  const [selectedCourtIndex, setSelectedCourtIndex] = useState(null);

  const handleSaveScoreSetting = (data) => {
    const newFormData = [...formData];
    const updatedCourtData = {
      ...newFormData[selectedCourtIndex],
      totalSets: data.totalSets,
      pointsPerSet: data.pointsPerSet,
      isDeuceMatch: data.isDeuceMatch,
      deucePoints: data.isDeuceMatch ? data.deucePoints : 0, // Set to null if Deuce Match is unchecked
    };
    newFormData[selectedCourtIndex] = updatedCourtData;
    setFormData(newFormData);
    setShowScoreSetting(false);
  };
  
  

  const handleOpenScoreSetting = async (index) => {
    setShowScoreSetting(true);
    setSelectedCourtIndex(index);
    setScoreSettingData({
      totalSets: formData[index].totalSets,
      pointsPerSet: formData[index].pointsPerSet,
      isDeuceMatch: formData[index].isDeuceMatch,
      deucePoints: formData[index].deucePoints,
    });
  };

  const handleCloseScoreSetting = () => {
    setShowScoreSetting(false);
  };

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await axios.get(`${API_URL}/tournaments`);
        if (response.data.length > 0) {
          setTournamentId(response.data[0].id);
          setTournamentName(response.data[0].name);
        }
      } catch (error) {
        console.error(error);
      }
    };

    // Fetch tournaments immediately
    fetchTournaments();
  }, []);

  useEffect(() => {
    const fetchCourts = async () => {
      try {
        const response = await axios.get(`${API_URL}/courts`);
        const data = Array(6).fill(initialFormData);
        response.data.forEach((court) => {
          data[court.courtNumber - 1] = court;
        });
        for (let i = 0; i < data.length; i++) {
            if (!data[i]) {
              data[i] = initialFormData;
            }
          }
        setFormData(data);
      } catch (error) {
        console.error(error);
      }
    };

    // Fetch courts immediately
    fetchCourts();
    const socket = new WebSocket(`${WEBSOCKET_URL}`); // Update the port if necessary

    socket.onmessage = (event) => {
      const message = event.data;
      // console.log('Received message:', message);
      if (
        message === 'Match created' 

      ) {
        fetchCourts(); // Call the existing fetchScores function to update results
      }
    };

    // Cleanup WebSocket connection when the component unmounts
    return () => {
      socket.close();
      // console.log('WebSocket connection closed');
    };
  }, []);

  const handleChange = (e, index) => {
    const newFormData = [...formData];
    newFormData[index] = { ...newFormData[index], [e.target.name]: e.target.value };
    setFormData(newFormData);
  };

  const handleSubmit = async (e, index) => {
    e.preventDefault();
    const courtData = { ...formData[index], courtNumber: index + 1, tournamentId };
  
    // Wait for handleSaveScoreSetting to complete before proceeding
    await handleSaveScoreSetting(scoreSettingData, selectedCourtIndex);
  
    try {
      const response = await axios.post(`${API_URL}/matches`, courtData);
      // console.log(`Match for court ${index + 1} created:`, response.data);
      toast.success('created successful', {
        position: 'top-right',
        autoClose: 3000, // Auto-close the notification after 3 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error('created failed', {
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
  
  
  const handleDelete = async (index) => {
    try {
      const response = await axios.delete(`${API_URL}/matches/${index + 1}`);
      // console.log(`Match for court ${index + 1} deleted:`, response.data);
      toast.success('deleted successful', {
        position: 'top-right',
        autoClose: 3000, // Auto-close the notification after 3 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      const newFormData = [...formData];
      newFormData[index] = initialFormData;
      setFormData(newFormData);
    } catch (error) {
      toast.error('deleted failed', {
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

  const handleModify = async (index) => {
    const courtData = { ...formData[index], courtNumber: index + 1 };
    try {
      const response = await axios.put(`${API_URL}/matches/${index + 1}`, courtData);
      // console.log(`Match for court ${index + 1} modified:`, response.data);
      toast.success('modified successful', {
        position: 'top-right',
        autoClose: 3000, // Auto-close the notification after 3 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      const newFormData = [...formData];
      newFormData[index] = courtData;
      setFormData(newFormData);
    } catch (error) {
      toast.error('modidied failed', {
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

  const handleTournamentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/tournaments`, { name: tournamentName });
      // console.log('Tournament created:', response.data);
      toast.success('created successful', {
        position: 'top-right',
        autoClose: 3000, // Auto-close the notification after 3 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      setTournamentId(response.data.insertId); // Set tournamentId to the ID of the created tournament
    } catch (error) {
      toast.error('created failed', {
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

  const handleTournamentModify = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API_URL}/tournaments/${tournamentId}`, { name: tournamentName });
      // console.log('Tournament modified:', response.data);
      toast.success('modified successful', {
        position: 'top-right',
        autoClose: 3000, // Auto-close the notification after 3 seconds
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error('modified failed', {
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
      <ToastContainer /> {/* Add ToastContainer here */}

      <Form onSubmit={handleTournamentSubmit}>
        <Form.Group controlId="tournamentName">
          <Form.Label>Tournament Name</Form.Label>
          <Form.Control type="text" value={tournamentName} onChange={(e) => setTournamentName(e.target.value)} />
          {/* Add margin or padding below the input field */}
          <div style={{ marginBottom: '10px' }}></div>
        </Form.Group>

        {loading ? (
          <p>Loading...</p>
        ) : (
          <ButtonGroup>
              <Button variant="warning" onClick={handleTournamentModify}>
                Modify Tournament
              </Button>
              <Button variant="primary" type="submit">
                Save Tournament
              </Button>
          </ButtonGroup>
        )}

        {/* Add margin or padding below the buttons */}
        <div style={{ marginBottom: '20px' }}></div>
      </Form>

      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>Court Number</th>
            <th>Player 1 Name</th>
            <th>Player 2 Name</th>
            <th>Category</th>
            <th>Round</th>
            <th>Umpire Name</th>
            <th>User ID</th>
            <th>Password</th>
            <th>Match Code</th>
            <th>Score Setting</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {formData.map((data, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>
                <Form.Control type="text" name="player1Name" value={data.player1Name} onChange={(e) => handleChange(e, index)} />
              </td>
              <td>
                <Form.Control type="text" name="player2Name" value={data.player2Name} onChange={(e) => handleChange(e, index)} />
              </td>
              <td>
                <Form.Control type="text" name="category" value={data.category} onChange={(e) => handleChange(e, index)} />
              </td>
              <td>
                <Form.Control type="text" name="round" value={data.round} onChange={(e) => handleChange(e, index)} />
              </td>
              <td>
                <Form.Control type="text" name="umpireName" value={data.umpireName} onChange={(e) => handleChange(e, index)} />
              </td>
              <td>
                <Form.Control type="text" name="userId" value={data.userId} onChange={(e) => handleChange(e, index)} />
              </td>
              <td>
                <Form.Control type="text" name="password" value={data.password} onChange={(e) => handleChange(e, index)} />
              </td>
              <td>
                <Form.Control type="text" name="matchCode" value={data.matchCode} onChange={(e) => handleChange(e, index)} />
              </td>
              <td>
                <Button onClick={() => handleOpenScoreSetting(index)}>Score Setting</Button>
                <Modal isOpen={showScoreSetting}>
                  <ScoreSetting onSave={(data) => handleSaveScoreSetting(data, selectedCourtIndex)} onClose={handleCloseScoreSetting} data={scoreSettingData} />
                </Modal>
              </td>
              <td>
                <Form.Control as="select" name="status" value={data.status} onChange={(e) => handleChange(e, index)}>
                  <option value="">Select...</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="live">Live</option>
                </Form.Control>
              </td>
              <td>
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <ButtonGroup>
                    {data.courtNumber !== '' ? (
                      <Button variant="warning" onClick={() => handleModify(index)}>
                        Modify
                      </Button>
                    ) : (
                      <Button variant="primary" type="submit" onClick={(e) => handleSubmit(e, index)}>
                        Submit
                      </Button>
                    )}
                    <Button variant="danger" onClick={() => handleDelete(index)}>
                      Delete
                    </Button>
                  </ButtonGroup>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}

export default AdminPage;