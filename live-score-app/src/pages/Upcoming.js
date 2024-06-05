// Upcoming.js
import React, { useEffect, useState } from 'react';
import { Card, ListGroup, Container, Row, Col,Badge } from 'react-bootstrap';
import Navigation from './Navbar';
import axios from 'axios';
import { API_URL, WEBSOCKET_URL } from './apiConfig';

function Upcoming() {
  const [scheduledMatches, setScheduledMatches] = useState([]);

  useEffect(() => {
    const fetchScheduledMatches = async () => {
      try {
        const response = await axios.get(`${API_URL}/matches/scheduled`);
        // console.log(response.data);
        setScheduledMatches(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    // Fetch scheduled matches immediately
    fetchScheduledMatches();
    const socket = new WebSocket(`${WEBSOCKET_URL}`); // Update the port if necessary

    socket.onopen = () => {
      // console.log('WebSocket connection opened');
    };
    
    socket.onclose = () => {
      // console.log('WebSocket connection closed');
    };
    
    socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
    
    // When a match result is received via WebSocket, trigger the fetchScores function to update results
    socket.onmessage = (event) => {
      const message = event.data;
      // console.log('Received message:', message);
      if (
        message === 'Match created' ||
        message === 'Match modified' ||
        message === 'Match deleted' ||
        message === 'Tournament added' ||
        message === 'Tournament changed'
      )  {
        fetchScheduledMatches(); // Call the existing fetchScores function to update results
      }
    };
    
    // Cleanup WebSocket connection when the component unmounts
    return () => {
      socket.close();
      // console.log('WebSocket connection closed');
    };
  }, []);

  return (
    <div>
      <Navigation />
      <Container>
      <h1 className="text-center mb-4"style={{ color: 'red' }}>
          {scheduledMatches[0]?.tournamentName}
        </h1>
        <Row>
          {Array.isArray(scheduledMatches) &&
            scheduledMatches.map((scheduledMatches, index) => (
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
                      Court {scheduledMatches.courtNumber}
                    </div>
                    <div className="flex-grow-1">
                    <Card.Header className="text-white d-flex justify-content-between" style={{ backgroundColor: 'dodgerblue' }}>
                    <div style={{ width: '150px' }}><b>{scheduledMatches.category}</b></div>
<div><b>{scheduledMatches.round}</b></div>

                      </Card.Header>
                      <ListGroup variant="flush">
                        <ListGroup.Item className="d-flex"style={{ border: 'none' }}>
                          <span style={{ width: '150px' }}>{scheduledMatches.player1Name}</span>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex">
                          <span style={{ width: '150px' }}>{scheduledMatches.player2Name}</span>
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

export default Upcoming;
