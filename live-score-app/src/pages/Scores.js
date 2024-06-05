// Scores.js
import React, { useEffect, useState } from 'react';
import { Card, ListGroup, Container, Row, Col, Badge } from 'react-bootstrap';
import Navigation from './Navbar';
import axios from 'axios';
import shuttlecockIcon from '../shuttle-cock.png';
import { API_URL, WEBSOCKET_URL } from './apiConfig';

function Scores() {
  const [scores, setScores] = useState([]);
  const [updatedMatch, setUpdatedMatch] = useState({ matchCode: null, player: null });
  const width = window.innerWidth;

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await axios.get(`${API_URL}/matches/livescore`);
        // console.log(response.data);
        setScores(response.data);
      } catch (error) {
        console.error(error);
      }
    };

    // Fetch scores immediately
    fetchScores();
    const socket = new WebSocket(`${WEBSOCKET_URL}`); // Update the port if necessary

    socket.onmessage = (event) => {
      let message;
      try {
        message = JSON.parse(event.data);
        // console.log('Received JSON message:', message);
      } catch (error) {
        // If parsing as JSON fails, treat it as a plain text message
        console.error('Error parsing WebSocket message as JSON. Treating as plain text.');
        message = event.data;
        // console.log('Received plain text message:', message);
      }    
        // console.log('Received message:', message);
      if (
        message === 'Match created' ||
        message === 'Match modified' ||
        message === 'Match deleted' ||
        message === 'Tournament added' ||
        message === 'Tournament changed'
      ) {
        fetchScores(); // Call the existing fetchScores function to update results
      }else if (message.message === 'score updated') {
        const { data, player } = message;
        // console.log('Match Code:', data);
        // console.log('Player:', player);
        setUpdatedMatch({ matchCode: data, player });

        // Call the existing fetchScores function to update results
        fetchScores();
      }
    };

    // Cleanup WebSocket connection when the component unmounts
    return () => {
      socket.close();
      // console.log('WebSocket connection closed');
    };
  }, []);
  let iconSize;
  if (width < 600) {
    iconSize = '50px';
  } else if (width > 900) {
    iconSize = '50px';
  } else {
    iconSize = '50px';
  }
  
  return (
    <div>
      <Navigation />
      <Container>
      <h1 className="text-center mb-4"style={{ color: 'blueviolet' }}>
  Badminton Live Score
</h1>

        <h1 className="text-center mb-4"style={{ color: 'red' }}>
          {scores[0]?.tournamentName}
        </h1>
        <Row>
          {Array.isArray(scores) &&
            scores.map((score, index) => (
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
                        <ListGroup.Item className="d-flex"style={{ border: 'none' }}>
                        <span style={{ width: '150px' }}>
                            {score.player1Name}{' '}
                          </span>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', flexGrow: 1 }}>
                          {updatedMatch.matchCode === score.matchCode &&
    updatedMatch.player === score.player1Name && <img src={shuttlecockIcon} alt="shuttlecock" style={{ width: iconSize, height: 'auto' }} />}
                            {score.sets.map((set, setIndex) => (
                              <div key={setIndex} style={{ width: '55px' }}>
                                <Card className="text-center">
                                  <Card.Body>{set.score1}</Card.Body>
                                </Card>
                              </div>
                            ))}
                          </div>
                        </ListGroup.Item>
                        <ListGroup.Item className="d-flex" >
                        <span style={{ width: '150px' }}>
                            {score.player2Name}{' '}
                          </span>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', flexGrow: 1 }}>
                          {updatedMatch.matchCode === score.matchCode &&
        updatedMatch.player === score.player2Name && 
        <img src={shuttlecockIcon} alt="shuttlecock" style={{ width: iconSize, height: 'auto' }} />}
                            {score.sets.map((set, setIndex) => (
                              <div key={setIndex} style={{ width: '55px' }}>
                                <Card className="text-center">
                                  <Card.Body>{set.score2}</Card.Body>
                                </Card>
                              </div>
                            ))}
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

export default Scores;
