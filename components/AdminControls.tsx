import React, { useState, useEffect } from 'react';
import { MatchState, Player, BallOutcome, FieldDirection } from '../types';
import { processBall } from '../services/cricketLogic';
import WagonWheel from './WagonWheel';

interface AdminControlsProps {
  match: MatchState;
  onUpdate: (updatedMatch: MatchState) => void;
}

const AdminControls: React.FC<AdminControlsProps> = ({ match, onUpdate }) => {
  const [runs, setRuns] = useState<number>(0);
  const [extraType, setExtraType] = useState<string>('none');
  const [isWicket, setIsWicket] = useState(false);
  const [wicketType, setWicketType] = useState<string>('bowled');
  const [direction, setDirection] = useState<FieldDirection | undefined>(undefined);
  
  // Selection States for Openers/Bowlers
  const [selectedStriker, setSelectedStriker] = useState('');
  const [selectedNonStriker, setSelectedNonStriker] = useState('');
  const [selectedBowler, setSelectedBowler] = useState('');

  const battingTeam = match.battingTeamId === 'TeamA' ? match.teamA : match.teamB;
  const bowlingTeam = match.bowlingTeamId === 'TeamA' ? match.teamA : match.teamB;

  // Derive available players (not out)
  const isBatsmanSet = match.currentBatsmen.strikerId && match.currentBatsmen.nonStrikerId;
  const isBowlerSet = !!match.currentBowlerId;

  useEffect(() => {
    // Reset inputs on new ball
    setRuns(0);
    setExtraType('none');
    setIsWicket(false);
    setDirection(undefined);
  }, [match.balls.length]);

  const handleScoreSubmit = () => {
    if (!match.currentBatsmen.strikerId || !match.currentBowlerId) {
      alert("Set batsman and bowler first!");
      return;
    }

    // Convert UI state to BallOutcome
    const outcome: BallOutcome = {
      runs: runs,
      extras: (extraType === 'wide' || extraType === 'no-ball') ? 1 : 0, // Simplified +1 for w/nb
      extraType: extraType as any,
      isWicket,
      wicketType: isWicket ? (wicketType as any) : 'none'
    };

    const newMatchState = processBall(match, outcome, direction);
    onUpdate(newMatchState);
  };

  const setOpeners = () => {
      if(selectedStriker === selectedNonStriker) {
          alert("Striker and Non-Striker cannot be the same");
          return;
      }
      const updated = { ...match };
      updated.currentBatsmen.strikerId = selectedStriker;
      updated.currentBatsmen.nonStrikerId = selectedNonStriker;
      onUpdate(updated);
  };

  const setNewBowler = () => {
      const updated = { ...match };
      updated.currentBowlerId = selectedBowler;
      onUpdate(updated);
  };
  
  const setNewStriker = () => {
      const updated = { ...match };
      updated.currentBatsmen.strikerId = selectedStriker;
      onUpdate(updated);
  };

  // -- Render Logic --

  // 1. Initial Batsmen Selection
  if (!match.currentBatsmen.strikerId || !match.currentBatsmen.nonStrikerId) {
    // Case A: Start of Innings (Both Missing)
    if (!match.currentBatsmen.strikerId && !match.currentBatsmen.nonStrikerId) {
        return (
            <div className="bg-white p-6 rounded shadow">
              <h3 className="text-lg font-bold mb-4">Select Opening Batsmen</h3>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <select className="border p-2 rounded" value={selectedStriker} onChange={e => setSelectedStriker(e.target.value)}>
                    <option value="">Select Striker</option>
                    {battingTeam.playingXI.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select className="border p-2 rounded" value={selectedNonStriker} onChange={e => setSelectedNonStriker(e.target.value)}>
                    <option value="">Select Non-Striker</option>
                    {battingTeam.playingXI.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <button onClick={setOpeners} disabled={!selectedStriker || !selectedNonStriker} className="bg-green-600 text-white px-4 py-2 rounded">Set Batsmen</button>
            </div>
        );
    }
    // Case B: Fall of Wicket (Striker Missing)
    return (
        <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-bold mb-4">Wicket Fell! Select New Batsman</h3>
             <select className="border p-2 rounded mb-4 w-full" value={selectedStriker} onChange={e => setSelectedStriker(e.target.value)}>
                <option value="">Select New Batsman</option>
                {battingTeam.playingXI
                    .filter(p => p.id !== match.currentBatsmen.nonStrikerId) // Exclude current non-striker
                    // In a real app, exclude already out players too
                    .map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={setNewStriker} disabled={!selectedStriker} className="bg-green-600 text-white px-4 py-2 rounded">Next Batsman In</button>
        </div>
    );
  }

  // 2. Bowler Selection (Start of Match or End of Over)
  if (!match.currentBowlerId) {
     return (
        <div className="bg-white p-6 rounded shadow">
            <h3 className="text-lg font-bold mb-4">Select Bowler</h3>
             <select className="border p-2 rounded mb-4 w-full" value={selectedBowler} onChange={e => setSelectedBowler(e.target.value)}>
                <option value="">Select Bowler</option>
                {bowlingTeam.playingXI.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <button onClick={setNewBowler} disabled={!selectedBowler} className="bg-green-600 text-white px-4 py-2 rounded">Start Over</button>
        </div>
    );
  }

  // 3. Main Scoring Interface
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Inputs */}
        <div className="bg-white p-4 rounded shadow space-y-4">
            <h3 className="font-bold border-b pb-2">Scoring Control</h3>
            
            {/* Runs */}
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">Runs (off bat)</label>
                <div className="flex gap-2 mt-1">
                    {[0,1,2,3,4,6].map(r => (
                        <button 
                            key={r}
                            onClick={() => setRuns(r)}
                            className={`flex-1 py-2 rounded border font-bold ${runs === r ? 'bg-green-600 text-white border-green-600' : 'bg-gray-50 hover:bg-gray-100'}`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Extras */}
            <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase">Extras</label>
                <div className="flex gap-2 mt-1">
                    {['none', 'wide', 'no-ball', 'bye', 'leg-bye'].map(e => (
                        <button 
                            key={e}
                            onClick={() => setExtraType(e)}
                            className={`flex-1 py-1 text-xs rounded border capitalize ${extraType === e ? 'bg-blue-600 text-white border-blue-600' : 'bg-gray-50'}`}
                        >
                            {e === 'none' ? 'None' : e}
                        </button>
                    ))}
                </div>
            </div>

             {/* Wicket Toggle */}
             <div>
                <label className="flex items-center gap-2 cursor-pointer bg-red-50 p-2 rounded border border-red-100">
                    <input type="checkbox" checked={isWicket} onChange={e => setIsWicket(e.target.checked)} className="w-5 h-5 text-red-600" />
                    <span className="font-bold text-red-700">WICKET</span>
                </label>
                {isWicket && (
                     <select 
                        className="mt-2 w-full p-2 border rounded"
                        value={wicketType}
                        onChange={e => setWicketType(e.target.value)}
                    >
                        <option value="bowled">Bowled</option>
                        <option value="caught">Caught</option>
                        <option value="lbw">LBW</option>
                        <option value="run-out">Run Out</option>
                        <option value="stumped">Stumped</option>
                     </select>
                )}
            </div>

            <button 
                onClick={handleScoreSubmit}
                className="w-full bg-black text-white py-3 rounded text-lg font-bold hover:bg-gray-800 transition-colors"
            >
                Record Ball
            </button>
        </div>

        {/* Right: Wagon Wheel Input */}
        <div className="bg-white p-4 rounded shadow flex flex-col items-center">
            <h3 className="font-bold border-b pb-2 w-full text-center mb-4">Shot Direction</h3>
            <div className="relative">
                <WagonWheel mode="input" onDirectionSelect={setDirection} />
                {!direction && <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-400 text-sm font-medium bg-white/20">Click on circle</div>}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Tap where the ball went to generate commentary.</p>
        </div>
    </div>
  );
};

export default AdminControls;
