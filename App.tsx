import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes, useParams, Link, useNavigate } from 'react-router-dom';
import TeamSetup from './components/TeamSetup';
import Scoreboard from './components/Scoreboard';
import AdminControls from './components/AdminControls';
import CommentaryFeed from './components/CommentaryFeed';
import WagonWheel from './components/WagonWheel';
import { MatchState } from './types';
import { getInitialMatchState } from './services/cricketLogic';

// --- Page Components ---

const Home = () => {
    const navigate = useNavigate();
    const [matchId, setMatchId] = useState('');
    
    const createNew = () => {
        const id = Date.now().toString(36);
        navigate(`/admin/${id}`);
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center">
                <h1 className="text-4xl font-extrabold text-green-700 mb-2">CricScore Live</h1>
                <p className="text-gray-500 mb-8">Lightweight Scorer & Scoreboard</p>
                
                <button onClick={createNew} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg mb-4 transition">
                    Create New Match
                </button>
                
                <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                    <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-gray-500">OR</span></div>
                </div>

                <div className="flex gap-2">
                    <input 
                        type="text" 
                        placeholder="Enter Match ID" 
                        className="flex-1 border p-2 rounded"
                        value={matchId}
                        onChange={e => setMatchId(e.target.value)}
                    />
                    <button onClick={() => matchId && navigate(`/match/${matchId}`)} className="bg-gray-800 text-white px-4 rounded">View</button>
                </div>
            </div>
        </div>
    );
};

const MatchView = ({ mode }: { mode: 'admin' | 'public' }) => {
    const { matchId } = useParams<{ matchId: string }>();
    const [match, setMatch] = useState<MatchState | null>(null);

    // Load initial state
    useEffect(() => {
        if (!matchId) return;
        
        const load = () => {
            const stored = localStorage.getItem(`match_${matchId}`);
            if (stored) {
                setMatch(JSON.parse(stored));
            } else if (mode === 'admin') {
                // Initialize if admin and not found
                // Only TeamSetup creates the initial object, so if not found in admin, we show setup
                setMatch(null); 
            }
        };

        load();

        // Listen for storage events (Sync tabs)
        const handleStorage = (e: StorageEvent) => {
            if (e.key === `match_${matchId}` && e.newValue) {
                setMatch(JSON.parse(e.newValue));
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [matchId, mode]);

    const handleUpdate = (newState: MatchState) => {
        setMatch(newState);
        localStorage.setItem(`match_${matchId}`, JSON.stringify(newState));
    };

    if (!matchId) return <div>Invalid Match ID</div>;

    // Admin: Setup State
    if (mode === 'admin' && (!match || match.status === 'setup')) {
        return <div className="min-h-screen bg-gray-100 py-8"><TeamSetup matchId={matchId} onComplete={handleUpdate} /></div>;
    }

    // Public: Loading State
    if (!match) return <div className="p-10 text-center text-gray-500">Waiting for match data...</div>;

    return (
        <div className="min-h-screen bg-gray-100 pb-10">
            {/* Header */}
            <div className="bg-white border-b sticky top-0 z-10 px-4 py-3 flex justify-between items-center shadow-sm">
                <Link to="/" className="font-bold text-green-700">CricScore Live</Link>
                <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Match ID: {matchId}</div>
            </div>

            <div className="container mx-auto max-w-4xl p-4 space-y-6">
                
                <Scoreboard match={match} />
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Column */}
                    <div className="lg:col-span-2 space-y-6">
                        {mode === 'admin' && (
                            <AdminControls match={match} onUpdate={handleUpdate} />
                        )}
                         <CommentaryFeed balls={match.balls} />
                    </div>

                    {/* Sidebar Column */}
                    <div className="space-y-6">
                        <div className="bg-white p-4 rounded shadow">
                            <h3 className="font-bold text-gray-700 mb-4 text-center">Wagon Wheel</h3>
                            <WagonWheel 
                                mode="display" 
                                balls={match.balls} 
                                lastBallDirection={match.balls[0]?.fieldDirection}
                            />
                        </div>
                        {/* More stats could go here */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin/:matchId" element={<MatchView mode="admin" />} />
        <Route path="/match/:matchId" element={<MatchView mode="public" />} />
      </Routes>
    </HashRouter>
  );
}
