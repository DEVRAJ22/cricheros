import React, { useRef, useState } from 'react';
import { FieldDirection, Ball } from '../types';

interface WagonWheelProps {
  mode: 'input' | 'display';
  onDirectionSelect?: (direction: FieldDirection) => void;
  balls?: Ball[];
  lastBallDirection?: FieldDirection;
}

const WagonWheel: React.FC<WagonWheelProps> = ({ mode, onDirectionSelect, balls = [], lastBallDirection }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [tempLine, setTempLine] = useState<{ x: number, y: number } | null>(null);

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode !== 'input' || !onDirectionSelect || !svgRef.current) return;

    const rect = svgRef.current.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Mouse coords relative to SVG center
    const mx = e.clientX - rect.left - centerX;
    const my = e.clientY - rect.top - centerY;

    // Normalize to -1 to 1
    const x = mx / (rect.width / 2);
    const y = my / (rect.height / 2);

    // Calculate Angle (Degrees)
    let angle = (Math.atan2(my, mx) * 180) / Math.PI;
    if (angle < 0) angle += 360;

    // Calculate Distance (0 to 1)
    const distance = Math.min(Math.sqrt(x * x + y * y), 1);

    setTempLine({ x, y });
    onDirectionSelect({ x, y, angle, distance });
  };

  const getLineColor = (run: number) => {
    if (run === 6) return '#ef4444'; // Red-500
    if (run === 4) return '#3b82f6'; // Blue-500
    if (run === 0) return '#d1d5db'; // Gray-300
    return '#eab308'; // Yellow-500 for 1,2,3
  };

  // Filter balls to show on wheel (e.g., current innings)
  const displayBalls = balls.filter(b => b.fieldDirection);

  return (
    <div className="relative w-full aspect-square max-w-[400px] mx-auto bg-green-50 rounded-full border-4 border-green-700 overflow-hidden shadow-inner">
       {/* Grass pattern overlay could go here */}
       <svg 
        ref={svgRef}
        viewBox="-1 -1 2 2" 
        className={`w-full h-full ${mode === 'input' ? 'cursor-crosshair' : ''}`}
        onClick={handleClick}
      >
        {/* Field Circles */}
        <circle cx="0" cy="0" r="1" fill="none" stroke="#15803d" strokeWidth="0.02" opacity="0.5" />
        <circle cx="0" cy="0" r="0.6" fill="none" stroke="#15803d" strokeWidth="0.01" opacity="0.3" strokeDasharray="0.1 0.1" />
        <rect x="-0.1" y="-0.2" width="0.2" height="0.4" fill="#e5e7eb" opacity="0.6" />

        {/* Historical Lines (Display Mode) */}
        {mode === 'display' && displayBalls.map((ball) => (
          <line
            key={ball.id}
            x1="0"
            y1="0"
            x2={ball.fieldDirection!.x * ball.fieldDirection!.distance}
            y2={ball.fieldDirection!.y * ball.fieldDirection!.distance}
            stroke={getLineColor(ball.outcome.runs)}
            strokeWidth="0.015"
            strokeLinecap="round"
            opacity="0.6"
          />
        ))}

        {/* Last Ball Highlight (Display Mode) */}
        {mode === 'display' && lastBallDirection && (
           <line
           x1="0"
           y1="0"
           x2={lastBallDirection.x * lastBallDirection.distance}
           y2={lastBallDirection.y * lastBallDirection.distance}
           stroke="white"
           strokeWidth="0.03"
           strokeLinecap="round"
           className="animate-pulse"
         />
        )}

        {/* Input Feedback Line */}
        {mode === 'input' && tempLine && (
          <line
            x1="0"
            y1="0"
            x2={tempLine.x}
            y2={tempLine.y}
            stroke="black"
            strokeWidth="0.02"
            strokeDasharray="0.05 0.05"
          />
        )}
      </svg>
      
      {/* Legend */}
      {mode === 'display' && (
        <div className="absolute bottom-2 right-2 text-[10px] bg-white/80 p-1 rounded backdrop-blur-sm">
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-gray-300"></div>0</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-500"></div>1-3</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500"></div>4</div>
          <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-red-500"></div>6</div>
        </div>
      )}
    </div>
  );
};

export default WagonWheel;
