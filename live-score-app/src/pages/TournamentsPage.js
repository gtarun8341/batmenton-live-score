import React, { useState, useEffect } from 'react';
import { Table } from 'react-bootstrap';
import axios from 'axios';
import { API_URL, WEBSOCKET_URL } from './apiConfig';
import Navigation from './Navbar';

const cleanUpString = (str) => {
  if (typeof str === 'string') {
    // Remove leading and trailing double quotes
    str = str.replace(/^"(.*)"$/, '$1');
    // Replace escaped double quotes with regular double quotes
    str = str.replace(/\\"/g, '"');
    // Remove any remaining double quotes
    str = str.replace(/"/g, '');
  }
  return str;
};

const TournamentsPage = () => {
  const [tournaments, setTournaments] = useState([]);

  useEffect(() => {
    // Fetch tournaments from your API
    axios.get(`${API_URL}/api/tournaments`)
      .then(response => setTournaments(response.data))
      .catch(error => console.error('Error:', error));
  }, []);

  const parsePrizeData = (prizeData) => {
    try {
      const prizes = JSON.parse(JSON.parse(prizeData));
      if (Array.isArray(prizes)) {
        // Return a formatted string for each prize
        return prizes.map(prize => `${prize.heading}: ${prize.detail}`).join(', ');
      }
    } catch (error) {
      console.error('Error parsing prize data:', error);
      return 'Error parsing prize data'; // Return an error message if parsing fails
    }
  };
  const formatDateString = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, options);
  };

  return (
    <div>
      <Navigation />
      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>S.No</th>
            <th>Date</th>
            <th>Tournament Name</th>
            <th>Venue</th>
            <th>Events</th>
            <th>Entry Fee</th>
            <th>Prize</th>
          </tr>
        </thead>
        <tbody>
          {tournaments.map((tournament, index) => {
            const formattedDate = formatDateString(tournament.date);
            const tournamentName = cleanUpString(tournament.tournament_name);
            const venue = cleanUpString(tournament.venue);
            const eventsString = cleanUpString(tournament.events);
            const entryFee = cleanUpString(tournament.entry_fee);
            const prizeString = parsePrizeData(tournament.prize);

            return (
              <tr key={index}>
                <td>{index + 1}</td>
                <td>{formattedDate}</td>
                <td>{tournamentName}</td>
                <td>{venue}</td>
                <td>{eventsString}</td>
                <td>{entryFee}</td>
                <td>{prizeString}</td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default TournamentsPage;