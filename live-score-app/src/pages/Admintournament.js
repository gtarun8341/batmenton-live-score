import React, { useState, useEffect } from 'react';
import { Form, Button, Table, Col, Row } from 'react-bootstrap';
import axios from 'axios';
import { API_URL, WEBSOCKET_URL } from './apiConfig';
import Navigation from './Navbar';

const Admintournament = () => {
  const [tournaments, setTournaments] = useState([]);
  const [newTournament, setNewTournament] = useState({
    date: '',
    tournamentName: '',
    venue: '',
    events: '',
    entryFee: '',
    prizes: [
      {
        heading: '',
        detail: ''
      }
    ]
  });

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/tournaments`);
        setTournaments(response.data);
      } catch (error) {
        console.error('Error fetching tournaments:', error);
      }
    };

    fetchTournaments();

    const socket = new WebSocket(`${WEBSOCKET_URL}`);

    socket.onmessage = (event) => {
      const message = event.data;
      // console.log('Received message:', message);
      if (message === 'Match result updated') {
        fetchTournaments();
      }
    };

    return () => {
      socket.close();
      // console.log('WebSocket connection closed');
    };
  }, []);

  const handleChange = (e) => {
    setNewTournament({
      ...newTournament,
      [e.target.name]: e.target.value
    });
  };

  const handlePrizeChange = (index, field, value) => {
    const newPrizes = [...newTournament.prizes];
    newPrizes[index][field] = value;
    setNewTournament({
      ...newTournament,
      prizes: newPrizes
    });
  };

  const addPrize = () => {
    setNewTournament({
      ...newTournament,
      prizes: [...newTournament.prizes, { heading: '', detail: '' }]
    });
  };

  const handleDelete = async (tournamentId) => {
    try {
      const response = await axios.delete(`${API_URL}/api/tournaments/${tournamentId}`);
      if (response.status === 200) {
        // console.log('Tournament deleted successfully');
        setTournaments(tournaments.filter(tournament => tournament.id !== tournamentId));
      } else {
        console.error('Error deleting tournament');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formattedTournament = {
      ...newTournament,
      prizes: JSON.stringify(newTournament.prizes)
    };

    try {
      const response = await axios.post(`${API_URL}/api/tournaments`, formattedTournament, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        // console.log('Tournament saved successfully');
        setTournaments(prevTournaments => [...prevTournaments, { ...newTournament }]);
        setNewTournament({
          date: '',
          tournamentName: '',
          venue: '',
          events: '',
          entryFee: '',
          prizes: [
            {
              heading: '',
              detail: ''
            }
          ]
        });
        window.location.reload();
      } else {
        console.error('Error saving tournament');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const cleanUpString = (str) => {
    if (typeof str === 'string') {
      str = str.replace(/^"(.*)"$/, '$1');
      str = str.replace(/\\"/g, '"');
      str = str.replace(/"/g, '');
    }
    return str;
  };

  const parsePrizeData = (prizeData) => {
    try {
      if (prizeData && typeof prizeData === 'string') {
        const prizes = JSON.parse(prizeData);
        if (Array.isArray(prizes)) {
          return prizes.map(prize => `${prize.heading}: ${prize.detail}`).join(', ');
        }
      }
    } catch (error) {
      console.error('Error parsing prize data:', error);
    }
    return prizeData;
  };

  return (
    <div>
      <Navigation />

      <Row>
        <Col xs={12}>
          <Table responsive striped bordered hover>
            <thead>
              <tr>
                <th>Date</th>
                <th>Tournament Name</th>
                <th>Venue</th>
                <th>Events</th>
                <th>Entry Fee</th>
                <th>Prize</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {tournaments && tournaments.map((tournament, index) => {
                const date = cleanUpString(tournament.date);
                const tournamentName = cleanUpString(tournament.tournament_name);
                const venue = cleanUpString(tournament.venue);
                const eventsString = cleanUpString(tournament.events);
                const entryFee = cleanUpString(tournament.entry_fee);
                const prizeString = parsePrizeData(tournament.prize);

                return (
                  <tr key={index}>
                    <td>{date}</td>
                    <td>{tournamentName}</td>
                    <td>{venue}</td>
                    <td>{eventsString}</td>
                    <td>{entryFee}</td>
                    <td>{prizeString}</td>
                    <td>
                      <Button variant="danger" onClick={() => handleDelete(tournament.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
              <tr>
                <td><Form.Control type="date" name="date" value={newTournament.date} onChange={handleChange} /></td>
                <td><Form.Control type="text" name="tournamentName" value={newTournament.tournamentName} onChange={handleChange} /></td>
                <td><Form.Control type="text" name="venue" value={newTournament.venue} onChange={handleChange} /></td>
                <td><Form.Control as="textarea" name="events" value={newTournament.events} onChange={handleChange} /></td>
                <td><Form.Control type="text" name="entryFee" value={newTournament.entryFee} onChange={handleChange} /></td>
                <td>
                  {newTournament.prizes.map((prize, index) => (
                    <div key={index}>
                      <Form.Control type="text" name="prizeHeading" value={prize.heading} onChange={(e) => handlePrizeChange(index, 'heading', e.target.value)} />
                      <Form.Control type="text" name="prizeDetail" value={prize.detail} onChange={(e) => handlePrizeChange(index, 'detail', e.target.value)} />
                    </div>
                  ))}
                  <Button type="button" onClick={addPrize}>Add another prize</Button>
                </td>
                <td><Button type="submit" onClick={handleSubmit}>Add Tournament</Button></td>
              </tr>
            </tbody>
          </Table>
        </Col>
      </Row>
    </div>
  );
};

export default Admintournament;
