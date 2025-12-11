import React, { useState } from 'react';
import { MatchState, Player } from '../types';
import { getInitialMatchState } from '../services/cricketLogic';

interface TeamSetupProps {
  matchId: string;
  onComplete: (match: MatchState) => void;
}

const TeamSetup: React.FC<TeamSetupProps> = ({ matchId, onComplete }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [teamAName, setTeamAName] = useState('');
  const [teamBName, setTeamBName] = useState('');
  const [teamAPlayers, setTeamAPlayers] = useState<string[]>(Array(11).fill(''));
  const [teamBPlayers, setTeamBPlayers] = useState<string[]>(Array(11).fill(''));

  const handleStartStep2 = () => {
    if (teamAName && teamBName) setStep(2);
  };

  const handleFinish = () => {
    const match = getInitialMatchState(matchId);
    match.teamA = {
      name: teamAName,
      playingXI: teamAPlayers.map((n, i) => ({ id: `a${i}`, name: n || `Player A${i + 1}` }))
    };
    match.teamB = {
      name: teamBName,
      playingXI: teamBPlayers.map((n, i) => ({ id: `b${i}`, name: n || `Player B${i + 1}` }))
    };
    match.status = 'live'; // Ready for toss/openers logic which is inside Admin view
    
    // Save initial state
    localStorage.setItem(`match_${matchId}`, JSON.stringify(match));
    onComplete(match);
  };

  const updatePlayerName = (team: 'A' | 'B', index: number, val: string) => {
    if (team === 'A') {
      const newP = [...teamAPlayers];
      newP[index] = val;
      setTeamAPlayers(newP);
    } else {
      const newP = [...teamBPlayers];
      newP[index] = val;
      setTeamBPlayers(newP);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Match Setup</h2>
      
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Team A Name</label>
            <input 
              type="text" 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
              value={teamAName}
              onChange={(e) => setTeamAName(e.target.value)}
              placeholder="e.g. India"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Team B Name</label>
            <input 
              type="text" 
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 border p-2"
              value={teamBName}
              onChange={(e) => setTeamBName(e.target.value)}
              placeholder="e.g. Australia"
            />
          </div>
          <button 
            onClick={handleStartStep2}
            disabled={!teamAName || !teamBName}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:opacity-50"
          >
            Next: Enter Players
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">{teamAName} Playing XI</h3>
              {teamAPlayers.map((p, i) => (
                <input 
                  key={`a-${i}`}
                  type="text"
                  placeholder={`Player ${i + 1}`}
                  value={p}
                  onChange={(e) => updatePlayerName('A', i, e.target.value)}
                  className="block w-full text-sm border-gray-300 rounded mb-2 border p-1"
                />
              ))}
            </div>
            <div>
              <h3 className="font-semibold mb-2">{teamBName} Playing XI</h3>
              {teamBPlayers.map((p, i) => (
                <input 
                  key={`b-${i}`}
                  type="text"
                  placeholder={`Player ${i + 1}`}
                  value={p}
                  onChange={(e) => updatePlayerName('B', i, e.target.value)}
                  className="block w-full text-sm border-gray-300 rounded mb-2 border p-1"
                />
              ))}
            </div>
          </div>
          <button 
            onClick={handleFinish}
            className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700"
          >
            Start Match
          </button>
        </div>
      )}
    </div>
  );
};

export default TeamSetup;
