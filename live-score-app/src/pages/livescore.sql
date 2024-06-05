CREATE TABLE Matches (
  id INT AUTO_INCREMENT PRIMARY KEY,
  courtNumber INT,
  player1Name VARCHAR(255),
  player2Name VARCHAR(255),
  category VARCHAR(255),
  round VARCHAR(255),
  umpireName VARCHAR(255),
  userId VARCHAR(255),
  password VARCHAR(255),
  matchCode VARCHAR(255)
);
ALTER TABLE Matches ADD status VARCHAR(255);
ALTER TABLE Matches
ADD COLUMN totalSets INT,
ADD COLUMN pointsPerSet INT,
ADD COLUMN isDeuceMatch BOOLEAN,
ADD COLUMN deucePoints INT;

CREATE TABLE IF NOT EXISTS Tournaments (id INT AUTO_INCREMENT, name VARCHAR(255), PRIMARY KEY(id))
ALTER TABLE Matches ADD COLUMN IF NOT EXISTS tournamentId INT, ADD FOREIGN KEY (tournamentId) REFERENCES Tournaments(id)
CREATE TABLE Sets (
  id INT AUTO_INCREMENT PRIMARY KEY,
  matchId INT,
  setNumber INT,
  score1 INT,
  score2 INT,
  UNIQUE (matchId, setNumber),
  FOREIGN KEY (matchId) REFERENCES Matches(id)
);
CREATE TABLE IF NOT EXISTS CompletedResults (
  id INT AUTO_INCREMENT PRIMARY KEY,
  courtNumber VARCHAR(255),
  player1Name VARCHAR(255),
  player2Name VARCHAR(255),
  matchCode VARCHAR(255),
  tournamentName VARCHAR(255),
  category VARCHAR(255),
  round INT,
  totalSets INT,
  pointsPerSet INT,
  isDeuceMatch BOOLEAN,
  deucePoints INT,
  winner VARCHAR(255),
  sets JSON

);
CREATE TABLE IF NOT EXISTS CompletedResults (
  id INT AUTO_INCREMENT PRIMARY KEY,
  courtNumber VARCHAR(255),
  player1Name VARCHAR(255),
  player2Name VARCHAR(255),
  matchCode VARCHAR(255),
  tournamentName VARCHAR(255),
  category VARCHAR(255),
  round INT,
  totalSets INT,
  pointsPerSet INT,
  isDeuceMatch BOOLEAN,
  deucePoints INT,
  winner VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  sets JSON
);

CREATE TABLE tournaments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  date DATE NOT NULL,
  tournament_name VARCHAR(255) NOT NULL,
  venue VARCHAR(255) NOT NULL,
  events LONGTEXT,
  entry_fee LONGTEXT,
  prize LONGTEXT
);
