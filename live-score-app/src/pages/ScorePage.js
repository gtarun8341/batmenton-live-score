// ScorePage.js
import React, { useState } from 'react';
import AdminScore from './AdminScore';
import Scores from './Scores';

function ScorePage() {
  const [lastPlayerScoredByMatch, setLastPlayerScoredByMatch] = useState({});

  const adminScoreProps = {
    lastPlayerScoredByMatch,
    setLastPlayerScoredByMatch,
  };

  const scoresProps = {
    lastPlayerScoredByMatch,
  };

  return (
    <div>
      {/* Render AdminScore with the state and setter function */}
      <AdminScore {...adminScoreProps} />

      {/* Render Scores with the state to display the symbol */}
      <Scores {...scoresProps} />
    </div>
  );
}

export default ScorePage;
