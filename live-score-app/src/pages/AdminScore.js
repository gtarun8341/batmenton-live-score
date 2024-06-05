import React, { useState, useEffect } from 'react';
import { Form, Button, Container, Card, Row, Col } from 'react-bootstrap';
import axios from 'axios';
import Navigation from './Navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_URL, WEBSOCKET_URL } from './apiConfig';
import shuttlecockIcon from '../shuttle-cock.png';

function AdminScore() {
  const [matches, setMatches] = useState([]);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [sets, setSets] = useState([]);
  const [currentSetIndex, setCurrentSetIndex] = useState(0);
  const [playerSymbol, setPlayerSymbol] = useState(null);
  const [isRotated, setIsRotated] = useState(window.innerWidth < 768); // Initial check
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const token = localStorage.getItem('umpireToken');
        const response = await axios.get(`${API_URL}/matches/empirelive`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setMatches(response.data);
      } catch (error) {
        console.error(error);
      }
    };
  
    const handleWindowResize = () => {
      const aspectRatio = window.innerWidth / window.innerHeight;
      const isPortrait = aspectRatio < 1.0; // Check if aspect ratio is less than 1 for portrait mode
    
      setIsRotated(isPortrait && window.innerWidth < 768);
    };
    
  
    fetchMatches();
    const socket = new WebSocket(`${WEBSOCKET_URL}`);
  
    socket.onmessage = (event) => {
      const message = event.data;
      // console.log('Received message:', message);
      if (message === 'Match created' || message === 'Match modified') {
        fetchMatches();
      }
    };
  
    window.addEventListener('resize', handleWindowResize);
  
    return () => {
      socket.close();
      window.removeEventListener('resize', handleWindowResize);
      // console.log('WebSocket connection closed');
    };
  }, []);
  
  

  useEffect(() => {
    const fetchMatchData = async () => {
      try {
        const response = await axios.get(`${API_URL}/match/${selectedMatch.id}`);
        if (!response.data || response.data.length === 0) {
          setSets([{ setNumber: 1, score1: 0, score2: 0 }]);
          setCurrentSetIndex(0);
        } else {
          setSets(response.data);
          setCurrentSetIndex(response.data.length - 1);
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (selectedMatch) {
      fetchMatchData();
    }
  }, [selectedMatch]);

  const handleMatchChange = (e) => {
    const match = matches.find(m => m.matchCode === (e.target.value));
    setSelectedMatch(match);
    setSets(match.sets || []);
  };

  const handleAddSet = () => {
    if (selectedMatch && sets.length < selectedMatch.totalSets) {
      // Check if any player has won the majority of sets
      const player1SetsWon = sets.filter(set => set.score1 > set.score2).length;
      const player2SetsWon = sets.filter(set => set.score2 > set.score1).length;
  
      if (player1SetsWon > player2SetsWon && player1SetsWon >= Math.ceil(selectedMatch.totalSets / 2)) {
        handleDeclareMatchWinner('Player 1');
      } else if (player2SetsWon > player1SetsWon && player2SetsWon >= Math.ceil(selectedMatch.totalSets / 2)) {
        handleDeclareMatchWinner('Player 2');
      } else {
        const newSetNumber = sets.length + 1;
        setSets(prevSets => [...prevSets, { setNumber: newSetNumber, score1: 0, score2: 0 }]);
        setCurrentSetIndex(sets.length);
      }
    }
  };
  

  const isMatchCompleted = (matchData) => {
    const { totalSets, pointsPerSet } = matchData;

    if (sets.length !== totalSets) {
      return false;
    }

    return sets.every(set => set.score1 >= pointsPerSet && set.score2 >= pointsPerSet);
  };

  const determineWinner = () => {
    const totalScorePlayer1 = sets.reduce((total, set) => total + set.score1, 0);
    const totalScorePlayer2 = sets.reduce((total, set) => total + set.score2, 0);

    if (totalScorePlayer1 > totalScorePlayer2) {
      return selectedMatch.player1Name;
    } else if (totalScorePlayer2 > totalScorePlayer1) {
      return selectedMatch.player2Name;
    } else {
      return 'Draw';
    }
  };
  const handleScoreChange = (setIndex, player, increment, e, currentPlayer) => {
    const newSets = [...sets];
    const updatedScore = newSets[setIndex][player] + increment;
  
    // Update the score
    newSets[setIndex][player] = updatedScore;
  
    const playerSymbol = (currentPlayer === 'player1') ? selectedMatch.player1Name : selectedMatch.player2Name;
    setPlayerSymbol(playerSymbol);
  
    // Call handleSubmit with the updated sets
    handleSubmit(e, newSets, playerSymbol);
  
    // Check if the match is completed after the score change
    if (isMatchCompleted(selectedMatch)) {
      const winner = determineWinner(selectedMatch);
      // console.log('Match completed. Winner:', winner);
    }
  
    setSets(newSets);
  };
  
  
  
  const handleDeclareSetWinner = (setIndex) => {
    const totalSets = selectedMatch.totalSets;
    const player1SetsWon = sets.filter(set => set.score1 === selectedMatch.pointsPerSet).length;
    const player2SetsWon = sets.filter(set => set.score2 === selectedMatch.pointsPerSet).length;

    if (player1SetsWon >= Math.ceil(totalSets / 2) || player2SetsWon >= Math.ceil(totalSets / 2)) {
      handleDeclareMatchWinner(player1SetsWon > player2SetsWon ? 'Player 1' : 'Player 2');
    } else if (sets.length < totalSets - 1) {
      handleAddSet();
    } else if (sets.length === totalSets - 1 && player1SetsWon === player2SetsWon) {
      handleAddSet();
    } else {
      const winner = determineWinner();
      handleDeclareMatchWinner(winner);
    }
  };

  const handleDeclareMatchWinner = (winner) => {
    // console.log('Match Winner:', winner);
  };

  const handleSubmit = async (event, matchData, playerIncreased) => {
    event.preventDefault();
    try {
      const response = await axios.put(`${API_URL}/match/${selectedMatch.id}`, { sets: matchData, data: selectedMatch.matchCode, player: playerIncreased });
      // console.log('Match updated:', response.data);
      if (isMatchCompleted(response.data)) {
        const winner = determineWinner();
        // console.log('Winner:', winner);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSendResult = async () => {
    try {
      const winner = determineWinner();

      const completedMatchData = {
        courtNumber: selectedMatch.courtNumber,
        player1Name: selectedMatch.player1Name,
        player2Name: selectedMatch.player2Name,
        matchCode: selectedMatch.matchCode,
        tournamentName: selectedMatch.tournamentName,
        category: selectedMatch.category,
        round: selectedMatch.round,
        totalSets: selectedMatch.totalSets,
        pointsPerSet: selectedMatch.pointsPerSet,
        isDeuceMatch: selectedMatch.isDeuceMatch,
        deucePoints: selectedMatch.deucePoints,
        winner: winner,
        sets: JSON.stringify(sets)
      };

      const response = await axios.post(`${API_URL}/send-result`, completedMatchData);
      // console.log(response.data);
      toast.success('Result sent successfully!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } catch (error) {
      toast.error('Result sent failed!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      console.error(error);
    }
  };
  const renderSets = (player) => (
    <div className="sets-info" style={{ display: 'flex', width: '100%', flexDirection: player === 'player1' ? 'row-reverse' : 'row' }}>
      {/* Left part for sets */}
      <div style={{ width: '10%' }}>
        {sets.map((set, index) => (
          <div key={index} className={`set-info border p-2 mb-2 ${index === currentSetIndex ? 'playing-set' : ''}`} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <p style={{ margin: 0 }}>{player === 'player1' ? set.score1 : set.score2}</p>
          </div>
        ))}
      </div>
  
      {/* Right part for the number */}
      <div style={{ width: '90%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', paddingLeft: '10px' }}>
        <h2 style={{ fontSize: '10em', margin: 0 }}>
          {player === 'player1' ? sets[currentSetIndex]?.score1 : sets[currentSetIndex]?.score2}
        </h2>
      </div>
    </div>
    
  );
  
  
  const renderPlayerName = (playerName, currentPlayerSymbol) => (
    <div className="player-name-box border p-3 mb-3" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      {playerName === currentPlayerSymbol && playerName === selectedMatch.player2Name && 
        <img 
          src={shuttlecockIcon} 
          alt="shuttlecock" 
          style={{ width: '5%', height: 'auto' }} 
        />
      }
      <h4 style={{ flexGrow: 1, textAlign: 'center' }}>{playerName}</h4>
      {playerName === currentPlayerSymbol && playerName === selectedMatch.player1Name && 
        <img 
          src={shuttlecockIcon} 
          alt="shuttlecock" 
          style={{ width: '5%', height: 'auto' }} 
        />
      }
    </div>
  );
  
  
  return (
    <div>
          {/* <style>
      {`
        @media (max-width: 767px) {
          .player-info {
            flex-direction: column;
          }

          .buttons-box {
            flex-direction: column;
          }

          .symbol-box {
            margin-right: 0;
          }
        }
      `}
    </style> */}
      <Navigation />
      {isRotated ? (
        <div className="rotate-message" style={{ textAlign: 'center', fontWeight: 'bold', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
  <p>Please rotate your device for a better experience.</p>
</div>

      ) : (
      <Container>
        <ToastContainer />
        <h1 className="text-center mb-4" style={{ color: 'blueviolet' }}>
          Badminton Live Score
        </h1>
        {selectedMatch && (
          <h2 className="text-center mb-4" style={{ color: 'blueviolet' }}>
            {selectedMatch.category}
          </h2>
        )}
        <div className="d-flex justify-content-between mb-3">
          <Button variant="primary" onClick={handleAddSet} disabled={!selectedMatch}>
            Add Set
          </Button>
          <Button variant="success" onClick={handleSendResult} disabled={!selectedMatch}>
            Send Result
          </Button>
        </div>
        <Form onSubmit={(e) => handleSubmit(e, sets, playerSymbol)}>
          <Form.Group controlId="match">
            <Form.Label>Match</Form.Label>
            <Form.Control as="select" value={selectedMatch?.matchCode} onChange={handleMatchChange}>
              <option value="">Select...</option>
              {matches.map(match => (
                <option key={match.matchCode} value={match.matchCode}>{match.matchCode}</option>
              ))}
            </Form.Control>
          </Form.Group>
          {selectedMatch && (
            <Row>
              {/* Player 1 Card */}
              <Col xs={12} sm={6}>
                <Card>
                  <Card.Body>
                    <div className="player-info">
                      {renderPlayerName(selectedMatch.player1Name, playerSymbol)}
                      {renderSets('player1')}
                      <div className="buttons-box d-flex justify-content-start border p-3">
                        <div className="symbol-box " style={{ marginRight: '50%' }}>
                          <Button onClick={(e) => handleScoreChange(currentSetIndex, 'score1', -1, e, 'player1')} className="btn btn-danger score-button btn-lg">-</Button>
                        </div>
                        <div className="symbol-box">
                          <Button onClick={(e) => handleScoreChange(currentSetIndex, 'score1', 1, e, 'player1')} className="btn btn-success score-button btn-lg">+</Button>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              {/* Player 2 Card */}
              <Col xs={12} sm={6}>
                <Card>
                  <Card.Body>
                    <div className="player-info">
                      {renderPlayerName(selectedMatch.player2Name, playerSymbol)}
                      {renderSets('player2')}
                      <div className="buttons-box d-flex justify-content-between border p-3">
                        <div className="symbol-box" style={{ marginLeft: 'auto', marginRight: '50%' }}>
                          <Button onClick={(e) => handleScoreChange(currentSetIndex, 'score2', 1, e, 'player2')} className="btn btn-success score-button btn-lg">+</Button>
                        </div>
                        <div className="symbol-box">
                          <Button onClick={(e) => handleScoreChange(currentSetIndex, 'score2', -1, e, 'player2')} className="btn btn-danger score-button btn-lg">-</Button>
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Form>
      </Container>
            )}

    </div>
  );
}

export default AdminScore;