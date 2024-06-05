// Results.js
import React, { useEffect, useState } from 'react';
import { Card, ListGroup, Container, Row, Col, Badge, Form } from 'react-bootstrap';
import Navigation from './Navbar';
import axios from 'axios';
import { API_URL, WEBSOCKET_URL } from './apiConfig';

function Results() {
  const [scores, setScores] = useState([]);
  const [tournamentFilter, setTournamentFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [categoryNames, setCategoryNames] = useState([]);

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await axios.get(`${API_URL}/completedresults`);
        // console.log(response.data);

        // Parse the sets data from each result
        const parsedScores = response.data.map(result => ({
          ...result,
          sets: JSON.parse(result.sets),
          // Extract date without time
          dateWithoutTime: result.created_at.split('T')[0],
        }));

        setScores(parsedScores);

        // Extract unique dates for the dropdown
        const uniqueDates = [...new Set(parsedScores.map(score => score.dateWithoutTime))];
        setAvailableDates(uniqueDates);

        // Extract unique categories for the dropdown
        const uniqueCategories = [...new Set(parsedScores.map(score => score.category))];
        setCategoryNames(uniqueCategories);
      } catch (error) {
        console.error(error);
      }
    };

    // Fetch scores immediately
    fetchScores();

    const socket = new WebSocket(`${WEBSOCKET_URL}`); // Update the port if necessary

    // socket.onopen = () => {
    //   console.log('WebSocket connection opened');
    // };
    
    // socket.onclose = () => {
    //   console.log('WebSocket connection closed');
    // };
    
    // socket.onerror = (error) => {
    //   console.error('WebSocket error:', error);
    // };
    
    // When a match result is received via WebSocket, trigger the fetchScores function to update results
    socket.onmessage = (event) => {
      const message = event.data;
      // console.log('Received message:', message);
      if (message === 'Match result updated') {
        fetchScores(); // Call the existing fetchScores function to update results
      }
    };
    
    // Cleanup WebSocket connection when the component unmounts
    return () => {
      socket.close();
      // console.log('WebSocket connection closed');
    };
  }, []);

  const handleTournamentChange = (e) => {
    setTournamentFilter(e.target.value);
  };

  const handleDateChange = (e) => {
    setDateFilter(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  const filteredScores = scores.filter(score =>
    (!tournamentFilter || score.tournamentName === tournamentFilter) &&
    (!dateFilter || score.dateWithoutTime === dateFilter) &&
    (!categoryFilter || score.category === categoryFilter)
  );

  const tournamentNames = [...new Set(scores.map(score => score.tournamentName))];

  return (
    <div>
      <Navigation />
      <Container>
        <Row className="mb-4">
          <Col xs={12} md={4} lg={4}>
            <Form.Group controlId="tournamentFilter">
              <Form.Label>Select Tournament:</Form.Label>
              <Form.Control as="select" onChange={handleTournamentChange}>
                <option value="">All Tournaments</option>
                {tournamentNames.map((name, index) => (
                  <option key={index} value={name}>{name}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col xs={12} md={4} lg={4}>
            <Form.Group controlId="dateFilter">
              <Form.Label>Select Date:</Form.Label>
              <Form.Control as="select" onChange={handleDateChange}>
                <option value="">All Dates</option>
                {availableDates.map((date, index) => (
                  <option key={index} value={date}>{date}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
          <Col xs={12} md={4} lg={4}>
            <Form.Group controlId="categoryFilter">
              <Form.Label>Select Category:</Form.Label>
              <Form.Control as="select" onChange={handleCategoryChange}>
                <option value="">All Categories</option>
                {categoryNames.map((category, index) => (
                  <option key={index} value={category}>{category}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          {Array.isArray(filteredScores) &&
            filteredScores.map((score, index) => (
              <Col key={index} xs={12} md={6} lg={6} xl={6} className="mb-4">
                <Card className="shadow-sm p-0">
                  <div className="d-flex">
                    <div
                      className="d-flex align-items-center justify-content-center court-column"
                      style={{
                        backgroundColor: '#343a40',
                        color: '#fff',
                        writingMode: 'vertical-rl',
                        transform: 'rotate(180deg)',
                      }}
                    >
                      Court {score.courtNumber}
                    </div>
                    <div className="flex-grow-1">
                    <Card.Header className="text-white d-flex justify-content-between" style={{ backgroundColor: 'dodgerblue' }}>
                    <div style={{ width: '150px' }}><b>{score.category}</b></div>
<div><b>{score.round}</b></div>

</Card.Header>
                      <ListGroup variant="flush">
                        <ListGroup.Item className="d-flex" style={{ border: 'none' }}>
                          <span style={{ width: '150px' }}>{score.player1Name}</span>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', flexGrow: 1 }}>
                            {score.sets.map((set, setIndex) => (
                              <div key={setIndex} style={{ width: '55px' }}>
                                <Card className="text-center">
                                  <Card.Body>{set.score1}</Card.Body>
                                </Card>
                              </div>
                            ))}
                          </div>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex">
                          <span style={{ width: '150px' }}>{score.player2Name}</span>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', flexGrow: 1 }}>
                            {score.sets.map((set, setIndex) => (
                              <div key={setIndex} style={{ width: '55px' }}>
                                <Card className="text-center">
                                  <Card.Body>{set.score2}</Card.Body>
                                </Card>
                              </div>
                            ))}
                          </div>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex">
                          <span style={{ width: '150px' }}>Winner</span>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', flexGrow: 1 }}>
                          <Badge variant="success">{score.winner}</Badge>
                          </div>
                        </ListGroup.Item>
                      </ListGroup>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
        </Row>
      </Container>
    </div>
  );
}

export default Results;
