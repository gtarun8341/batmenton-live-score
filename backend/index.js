const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');
const cors = require('cors');
const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const http = require('http');


const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 3001;
app.use(cors());
app.use(bodyParser.json());
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test'
});
// const db = mysql.createConnection({
//   host: 'localhost',
//   user: 'u562946175_livescore',
//   password: 'Kanthu@2024',
//   database: 'u562946175_livescore'
// });

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to database');
});

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('WebSocket client connected');

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
  });
});

// app.post('/matches', (req, res) => {
//   const sql = 'INSERT INTO Matches SET ?';
//   db.query(sql, req.body, (err, result) => {
//     if (err) throw err;
//     wss.clients.forEach(client => {
//       if (client.readyState === WebSocket.OPEN) {
//         client.send(JSON.stringify(req.body));
//       }
//     });
//     res.send(result);
//   });
// });

// Login endpoint
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM Matches WHERE umpireName = ? AND password = ?';

  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length > 0) {
      // Umpire found, generate and send a JWT for authentication
      const umpire = results[0];
      const token = generateJwt(umpire.umpireName);

      res.json({ token });
    } else {
      // Umpire not found or invalid credentials
      res.status(401).json({ error: 'Invalid username or password' });
    }
  });
});
app.post('/admin/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM Admins WHERE username = ? AND password = ?'; // Assuming your admin table is named 'Admins'

  db.query(sql, [username, password], (err, results) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    if (results.length > 0) {
      // Admin found, generate and send a JWT for authentication
      const admin = results[0];
      const token = generateJwt(admin.username); // Generate a token with the admin's username

      res.json({ token });
    } else {
      // Admin not found or invalid credentials
      res.status(401).json({ error: 'Invalid username or password' });
    }
  });
});
// Helper function to generate JWT
function generateJwt(umpireName) {
  const payload = { umpireName };
  const secretKey = 'your-secret-key';
  const expiresIn = '1h';

  return jwt.sign(payload, secretKey, { expiresIn });
}
app.post('/matches', (req, res) => {
  console.log(req.body)
  const { courtNumber, player1Name, player2Name, category, round, umpireName, userId, password, matchCode, status, totalSets, pointsPerSet, isDeuceMatch, deucePoints, tournamentId } = req.body;
  const sql = `INSERT INTO Matches (courtNumber, player1Name, player2Name, category, round, umpireName, userId, password, matchCode, status, totalSets, pointsPerSet, isDeuceMatch, deucePoints, tournamentId) VALUES (${courtNumber}, '${player1Name}', '${player2Name}', '${category}', ${round}, '${umpireName}', '${userId}', '${password}', '${matchCode}', '${status}', ${totalSets}, ${pointsPerSet}, ${isDeuceMatch}, ${deucePoints}, ${tournamentId})`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send('Match created');
      }
    });
    res.send({ message: 'Match created successfully' });
  });
});



app.delete('/matches/:courtNumber', (req, res) => {
  const courtNumber = req.params.courtNumber;

  // Step 1: Get the matchId based on courtNumber
  const getMatchIdQuery = 'SELECT id FROM Matches WHERE courtNumber = ?';

  db.query(getMatchIdQuery, [courtNumber], (err, matchIdResult) => {
    if (err) {
      console.error('Error getting matchId:', err);
      return res.status(500).send('Internal Server Error');
    }

    if (matchIdResult.length === 0) {
      return res.status(404).send('Match not found');
    }

    const matchId = matchIdResult[0].id;

    // Step 2: Delete sets with the specified matchId
    const deleteSetsQuery = 'DELETE FROM Sets WHERE matchId = ?';

    db.query(deleteSetsQuery, [matchId], (err, setsResult) => {
      if (err) {
        console.error('Error deleting sets:', err);
        return res.status(500).send('Internal Server Error');
      }

      // Step 3: Delete the match record
      const deleteMatchQuery = 'DELETE FROM Matches WHERE courtNumber = ?';

      db.query(deleteMatchQuery, [courtNumber], (err, matchResult) => {
        if (err) {
          console.error('Error deleting match:', err);
          return res.status(500).send('Internal Server Error');
        }

        wss.clients.forEach(client => {
          if (client.readyState === WebSocket.OPEN) {
            client.send('Match deleted');
          }
        });

        // Send a response indicating success
        res.send({ setsResult, matchResult });
      });
    });
  });
});
app.post('/api/tournaments', (req, res) => {
  const { date, tournamentName, venue, events, entryFee, prizes } = req.body;

  const query = 'INSERT INTO upcomingtournaments (date, tournament_name, venue, events, entry_fee, prize) VALUES (?, ?, ?, ?, ?, ?)';
  const values = [date, tournamentName, venue, JSON.stringify(events), JSON.stringify(entryFee), JSON.stringify(prizes)];

  db.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
    } else {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send('tournament added');
        }
      });
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send('tournament added');
        }
      });
      res.status(200).send('Tournament saved successfully');
    }
  });
});
app.get('/api/tournaments', (req, res) => {
  db.query('SELECT * FROM upcomingtournaments', (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
    } else {
      res.json(results);
    }
  });
});
app.delete('/api/tournaments/:id', (req, res) => {
  const tournamentId = req.params.id;

  // Check if tournamentId is provided
  if (!tournamentId) {
    return res.status(400).send('Tournament ID is required for deletion');
  }

  // Perform the deletion
  const query = 'DELETE FROM upcomingtournaments WHERE id = ?';
  db.query(query, [tournamentId], (err, result) => {
    if (err) {
      console.error(err);
      res.status(500).send('Server error');
    } else if (result.affectedRows === 0) {
      res.status(404).send('Tournament not found');
    } else {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send('tournament deleted');
        }
      });
      res.status(200).send('Tournament deleted successfully');
    }
  });
});

app.put('/matches/:courtNumber', (req, res) => { // Add a PUT endpoint to update a match
  const sql = 'UPDATE Matches SET ? WHERE courtNumber = ?';
  db.query(sql, [req.body, req.params.courtNumber], (err, result) => {
    if (err) throw err;
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send('Match modified');
      }
    });
    res.send(result);
  });
});

app.get('/courts', (req, res) => {
  db.query('SELECT * FROM Matches', (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.get('/matches/scheduled', (req, res) => {
  const sql = `
    SELECT Matches.*, Tournaments.name AS tournamentName
    FROM Matches
    INNER JOIN Tournaments ON Matches.tournamentId = Tournaments.id
    WHERE Matches.status = 'scheduled'
  `;
  db.query(sql, (err, result) => {
    console.log(result)
    if (err) throw err;
    res.send(result);
  });
});

app.get('/matches/live', (req, res) => {
  const sql = `
    SELECT Matches.*, Tournaments.name AS tournamentName
    FROM Matches
    INNER JOIN Tournaments ON Matches.tournamentId = Tournaments.id
    WHERE Matches.status = 'live'
  `;
  db.query(sql, (err, result) => {    if (err) throw err;
    res.send(result);
  });
});

app.get('/matches/empirelive', (req, res) => {
  // Extract the umpireName from the JWT
  const token = req.headers.authorization.split(' ')[1]; // Assumes 'Bearer <token>' format
  console.log(token)

  const decodedToken = jwt.verify(token, 'your-secret-key'); // Replace with your actual secret key
  const umpireName = decodedToken.umpireName;
console.log(umpireName)
  
  const sql = `
    SELECT Matches.*, Tournaments.name AS tournamentName
    FROM Matches
    INNER JOIN Tournaments ON Matches.tournamentId = Tournaments.id
    WHERE Matches.status = 'live' AND Matches.umpireName = ?
  `;

  db.query(sql, [umpireName], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.get('/matches/livescore', (req, res) => {
  const sql = `
    SELECT Matches.*, Tournaments.name AS tournamentName
    FROM Matches
    INNER JOIN Tournaments ON Matches.tournamentId = Tournaments.id
    WHERE Matches.status = 'live'
  `;
  db.query(sql, (err, matches) => {
    if (err) throw err;

    // For each match, fetch its sets
    matches.forEach((match, index) => {
      const sql = `SELECT * FROM Sets WHERE matchId = ${match.id}`;
      db.query(sql, (err, sets) => {
        if (err) throw err;
        match.sets = sets;

        // Send the response when all matches have been processed
        if (index === matches.length - 1) {
          res.send(matches);
        }
      });
    });
  });
});


app.post('/tournaments', (req, res) => {
  const sql = 'INSERT INTO Tournaments SET ?';
  db.query(sql, req.body, (err, result) => {
    if (err) throw err;

    // Notify clients when a tournament is added
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send('Tournament added');
      }
    });

    res.send(result);
  });
});

app.put('/tournaments/:id', (req, res) => {
  const sql = 'UPDATE Tournaments SET ? WHERE id = ?';
  db.query(sql, [req.body, req.params.id], (err, result) => {
    if (err) throw err;

    // Notify clients when a tournament is changed
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send('Tournament changed');
      }
    });

    res.send(result);
  });
});

app.get('/tournaments', (req, res) => {
  const sql = 'SELECT * FROM Tournaments';
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});


// // Endpoint to get live matches
// app.get('/matches/live', (req, res) => {
//   const sql = 'SELECT * FROM Matches WHERE status = "live"';
//   db.query(sql, (err, result) => {
//     if (err) throw err;
//     res.send(result);
//   });
// });

app.get('/match/:id', (req, res) => {
  const { id } = req.params;
  const sql = `SELECT * FROM Sets WHERE matchId = ${id}`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.put('/match/:id', (req, res) => {
  const { sets } = req.body;
  const { id } = req.params;
  const { data, player } = req.body;
  console.log( data, player,"dh")
  sets.forEach(set => {
    const sql = `INSERT INTO Sets (matchId, setNumber, score1, score2) VALUES (${id}, ${set.setNumber}, ${set.score1}, ${set.score2}) ON DUPLICATE KEY UPDATE score1 = ${set.score1}, score2 = ${set.score2}`;
    db.query(sql, (err, result) => {
      if (err) throw err;
    });
  });
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      const { data, player } = req.body;
      console.log( data, player,"dh")

      client.send(JSON.stringify({ message: 'score updated', data, player }));
    }
  });

  res.send({ message: 'Match updated' });
});


app.post('/send-result', (req, res) => {
  const {
    courtNumber,
    player1Name,
    player2Name,
    matchCode,
    tournamentName,
    category,
    round,
    totalSets,
    pointsPerSet,
    isDeuceMatch,
    deucePoints,
    winner,
    sets
  } = req.body;

  const sql = `
    INSERT INTO CompletedResults
    (courtNumber, player1Name, player2Name, matchCode, tournamentName, category, round, totalSets, pointsPerSet, isDeuceMatch, deucePoints, winner, sets)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql, [courtNumber, player1Name, player2Name, matchCode, tournamentName, category, round, totalSets, pointsPerSet, isDeuceMatch, deucePoints, winner, sets], (err, result) => {
    if (err) {
      console.error('Error storing completed match data:', err);
      res.status(500).send('Internal Server Error');
    } else {
      console.log('Completed match data stored successfully');
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send('Match result updated');
        }
      });
      res.status(200).send('OK');
    }
  });
});


app.get('/completedresults', (req, res) => {
  const sql = `SELECT * FROM CompletedResults`;

  db.query(sql, (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }

    res.send(result);
  });
});
app.post('/score-settings', (req, res) => {
  const { matchCode, totalSets, pointsPerSet, isDeuceMatch, deucePoints } = req.body;
  const sql = `INSERT INTO ScoreSettings (matchCode, totalSets, pointsPerSet, isDeuceMatch, deucePoints) VALUES (${matchCode}, ${totalSets}, ${pointsPerSet}, ${isDeuceMatch}, ${deucePoints})`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send({ message: 'Score settings created successfully' });
  });
});

app.put('/score-settings/:matchCode', (req, res) => {
  const { totalSets, pointsPerSet, isDeuceMatch, deucePoints } = req.body;
  const { matchCode } = req.params;
  const sql = `UPDATE ScoreSettings SET totalSets = ${totalSets}, pointsPerSet = ${pointsPerSet}, isDeuceMatch = ${isDeuceMatch}, deucePoints = ${deucePoints} WHERE matchCode = ${matchCode}`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send({ message: 'Score settings updated successfully' });
  });
});



server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
