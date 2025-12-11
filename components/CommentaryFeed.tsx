import React from 'react';
import { Ball } from '../types';

const CommentaryFeed: React.FC<{ balls: Ball[] }> = ({ balls }) => {
  return (
    <div className="bg-white rounded shadow p-4">
      <h3 className="font-bold text-gray-700 mb-4 border-b pb-2">Commentary</h3>
      <div className="space-y-4 max-h-[500px] overflow-y-auto">
        {balls.length === 0 && <p className="text-gray-400 text-center py-4">Match hasn't started yet.</p>}
        {balls.map((ball) => (
          <div key={ball.id} className="flex gap-4 items-start border-b border-gray-100 pb-3 last:border-0">
            <div className="flex flex-col items-center min-w-[3rem]">
                <span className="text-xs font-bold text-gray-500">{ball.overNumber}.{ball.ballNumber}</span>
                <div className={`mt-1 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold text-white
                    ${ball.outcome.runs === 6 ? 'bg-red-500' : 
                      ball.outcome.runs === 4 ? 'bg-blue-500' : 
                      ball.outcome.isWicket ? 'bg-red-700' : 'bg-gray-400'}`}>
                    {ball.outcome.isWicket ? 'W' : ball.outcome.runs}
                </div>
            </div>
            <div>
                <p className="text-gray-800 text-sm leading-relaxed">{ball.commentary}</p>
                {ball.outcome.isWicket && <span className="text-xs font-bold text-red-600 uppercase tracking-wide">Wicket - {ball.outcome.wicketType}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentaryFeed;
