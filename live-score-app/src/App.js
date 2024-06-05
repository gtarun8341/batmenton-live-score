import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Scores from './pages/Scores';
import Results from './pages/Results';
import Upcoming from './pages/Upcoming';
import AdminLogin from './pages/AdminLogin';
import AdminScore from './pages/AdminScore';
import AccountCreation from './pages/AccountCreation';
import EmpireLogin from './pages/EmpireLogin';
import AdminPage from './pages/AdminPage';
import withAuthProtection from './pages/withAuthProtection'; // Import the HOC
import Admintournament from './pages/Admintournament'; // Import the HOC
import TournamentsPage from './pages/TournamentsPage'; // Import the HOC

function App() {
  const ProtectedAdminScore = withAuthProtection(AdminScore, 'umpire'); // Create a protected version of AdminScore for umpires
  const ProtectedAdminPage = withAuthProtection(AdminPage, 'admin'); // Create a protected version of AdminPage for admins
  const ProtectedAdmintournament = withAuthProtection(Admintournament, 'admin');

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Scores />} />
        <Route path="/results" element={<Results />} />
        <Route path="/upcoming" element={<Upcoming />} />
        <Route path="/adminlogin" element={<AdminLogin />} />
        <Route path="/adminscore" element={<ProtectedAdminScore />} /> {/* Use the protected version here */}
        <Route path="/accountcreation" element={<AccountCreation />} />
        <Route path="/umpirelogin" element={<EmpireLogin />} />
        <Route path="/adminpage" element={<ProtectedAdminPage />} /> {/* Use the protected version here */}
        <Route path="/admintournament" element={<ProtectedAdmintournament />} />
        <Route path="/tournamentspage" element={<TournamentsPage />} /> {/* Use the protected version here */}

      </Routes>
    </Router>
  );
}

export default App;
