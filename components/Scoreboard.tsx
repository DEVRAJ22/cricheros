import React from 'react';
import { MatchState, Player } from '../types';

const Scoreboard: React.FC<{ match: MatchState }> = ({ match }) => {
  const battingTeam = match.battingTeamId === 'TeamA' ? match.teamA : match.teamB;
  const bowlingTeam = match.bowlingTeamId === 'TeamA' ? match.teamA : match.teamB;

  const striker = battingTeam.playingXI.find(p => p.id === match.currentBatsmen.strikerId);
  const nonStriker = battingTeam.playingXI.find(p => p.id === match.currentBatsmen.nonStrikerId);
  const bowler = bowlingTeam.playingXI.find(p => p.id === match.currentBowlerId);

  // Calculate simple live stats for display (in a real app, these would be aggregated properly in logic)
  const getPlayerRuns = (pid: string) => {
    return match.balls.filter(b => b.outcome.runs > 0 && b.strikerId === pid).reduce((acc, b) => acc + b.outcome.runs, 0);
  };
  const getPlayerBalls = (pid: string) => {
      return match.balls.filter(b => b.strikerId === pid && b.outcome.extraType !== 'wide').length;
  };
  
  // Current Partnership calculation could go here

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
      {/* Main Score Header */}
      <div className="bg-green-700 text-white p-6">
        <div className="flex justify-between items-center">
            <div>
                <h1 className="text-3xl font-bold">{battingTeam.name}</h1>
                <p className="text-green-200 text-sm">vs {bowlingTeam.name}</p>
            </div>
            <div className="text-right">
                <div className="text-5xl font-bold tracking-tight">
                    {match.totalRuns}/{match.wickets}
                </div>
                <div className="text-xl opacity-90">
                    Overs: {match.overs}.{match.ballsInCurrentOver}
                </div>
            </div>
        </div>
        <div className="mt-4 flex gap-4 text-sm font-medium opacity-80">
            <span>CRR: {(match.totalRuns / Math.max(0.1, match.overs + match.ballsInCurrentOver/6)).toFixed(2)}</span>
            {/* Project score logic could be added */}
        </div>
      </div>

      {/* Batsmen & Bowler Strip */}
      <div className="bg-gray-50 p-4 grid grid-cols-1 md:grid-cols-2 gap-4 border-b">
         {/* Batsmen */}
         <div>
            <table className="w-full text-sm">
                <thead>
                    <tr className="text-gray-500 text-left border-b">
                        <th className="pb-1 font-normal">Batsman</th>
                        <th className="pb-1 font-normal text-right">R</th>
                        <th className="pb-1 font-normal text-right">B</th>
                        <th className="pb-1 font-normal text-right">4s</th>
                        <th className="pb-1 font-normal text-right">6s</th>
                        <th className="pb-1 font-normal text-right">SR</th>
                    </tr>
                </thead>
                <tbody>
                    {[striker, nonStriker].map((p, idx) => {
                        if(!p) return null;
                        const r = getPlayerRuns(p.id);
                        const b = getPlayerBalls(p.id);
                        const sr = b > 0 ? ((r/b)*100).toFixed(1) : '0.0';
                        return (
                            <tr key={p.id} className={idx === 0 ? "font-bold text-gray-900" : "text-gray-700"}>
                                <td className="py-2">{p.name} {idx === 0 ? '*' : ''}</td>
                                <td className="text-right">{r}</td>
                                <td className="text-right">{b}</td>
                                <td className="text-right">-</td>
                                <td className="text-right">-</td>
                                <td className="text-right">{sr}</td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
         </div>

         {/* Bowler */}
         <div className="md:border-l md:pl-4">
             <div className="flex justify-between items-center mb-2">
                 <span className="text-xs text-gray-500 uppercase font-bold">Current Bowler</span>
             </div>
             {bowler ? (
                 <div className="flex justify-between items-center">
                     <span className="font-bold text-lg">{bowler.name}</span>
                     <div className="text-sm space-x-3">
                        {/* Stats calculation omitted for brevity, would sum from balls array */}
                        <span>0-12 (1.4)</span> 
                     </div>
                 </div>
             ) : <span className="text-gray-400 italic">No bowler selected</span>}
             
             {/* This Over Balls */}
             <div className="flex gap-1 mt-3">
                 {match.balls.slice(0, match.ballsInCurrentOver).reverse().map((b, i) => ( // balls are stored newest first
                     <div key={b.id} className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-xs font-bold border border-gray-300">
                         {b.outcome.isWicket ? 'W' : b.outcome.runs + (b.outcome.extras > 0 ? 'wd' : '')}
                     </div>
                 ))}
             </div>
         </div>
      </div>
    </div>
  );
};

export default Scoreboard;
