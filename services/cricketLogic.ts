import { MatchState, BallOutcome, Ball, Player, Team, FieldDirection } from '../types';
import { COMMENTARY_TEMPLATES, getFieldZone } from '../constants';

export const getInitialMatchState = (id: string): MatchState => ({
  id,
  teamA: { name: 'Team A', playingXI: [] },
  teamB: { name: 'Team B', playingXI: [] },
  battingTeamId: 'TeamA',
  bowlingTeamId: 'TeamB',
  currentBatsmen: { strikerId: '', nonStrikerId: '' },
  currentBowlerId: '',
  totalRuns: 0,
  wickets: 0,
  overs: 0,
  ballsInCurrentOver: 0,
  balls: [],
  status: 'setup',
  playerStats: {}
});

const generateCommentary = (
  outcome: BallOutcome,
  bowlerName: string,
  strikerName: string,
  direction?: FieldDirection
): string => {
  let templates: string[] = [];
  const zone = direction ? getFieldZone(direction.angle) : "mid-wicket";

  if (outcome.isWicket) templates = COMMENTARY_TEMPLATES.wicket;
  else if (outcome.extraType === 'wide') templates = COMMENTARY_TEMPLATES.wide;
  else if (outcome.extraType === 'no-ball') templates = COMMENTARY_TEMPLATES.noBall;
  else if (outcome.runs === 0) templates = COMMENTARY_TEMPLATES.dot;
  else if (outcome.runs === 4) templates = COMMENTARY_TEMPLATES.four;
  else if (outcome.runs === 6) templates = COMMENTARY_TEMPLATES.six;
  else if (outcome.runs >= 2) templates = COMMENTARY_TEMPLATES.twoThree;
  else templates = COMMENTARY_TEMPLATES.single;

  const template = templates[Math.floor(Math.random() * templates.length)];

  return template
    .replace('{bowler}', bowlerName)
    .replace('{batter}', strikerName)
    .replace('{runs}', outcome.runs.toString())
    .replace('{field_zone}', zone)
    .replace('{fielder}', 'the fielder');
};

export const processBall = (match: MatchState, outcome: BallOutcome, direction?: FieldDirection): MatchState => {
  const newState = { ...match };
  
  // Helpers
  const battingTeam = newState.battingTeamId === 'TeamA' ? newState.teamA : newState.teamB;
  const bowlingTeam = newState.bowlingTeamId === 'TeamA' ? newState.teamA : newState.teamB;
  
  const striker = battingTeam.playingXI.find(p => p.id === newState.currentBatsmen.strikerId);
  const bowler = bowlingTeam.playingXI.find(p => p.id === newState.currentBowlerId);

  if (!striker || !bowler) return newState; // Should ensure validation before calling

  // 1. Update Score
  const runScored = outcome.runs;
  const extraRuns = outcome.extras;
  const totalBallRuns = runScored + extraRuns;
  
  newState.totalRuns += totalBallRuns;

  if (outcome.isWicket) {
    newState.wickets += 1;
  }

  // 2. Generate Commentary
  const commentary = generateCommentary(outcome, bowler.name, striker.name, direction);

  // 3. Create Ball Object
  const newBall: Ball = {
    id: Date.now().toString(),
    overNumber: newState.overs,
    ballNumber: newState.ballsInCurrentOver + 1,
    bowlerId: bowler.id,
    strikerId: striker.id,
    nonStrikerId: newState.currentBatsmen.nonStrikerId,
    outcome,
    fieldDirection: direction,
    commentary,
    timestamp: Date.now()
  };

  newState.balls = [newBall, ...newState.balls]; // Prepend for feed

  // 4. Update Overs logic
  const isLegalDelivery = outcome.extraType !== 'wide' && outcome.extraType !== 'no-ball';
  
  if (isLegalDelivery) {
    newState.ballsInCurrentOver += 1;
    if (newState.ballsInCurrentOver === 6) {
      newState.overs += 1;
      newState.ballsInCurrentOver = 0;
      // End of over: Swap strike
      const temp = newState.currentBatsmen.strikerId;
      newState.currentBatsmen.strikerId = newState.currentBatsmen.nonStrikerId;
      newState.currentBatsmen.nonStrikerId = temp;
      
      // Rotate bowler logic would happen in UI (admin selects next bowler)
      // We assume the UI will prompt for a new bowler if newState.ballsInCurrentOver === 0
      newState.currentBowlerId = ''; 
    }
  }

  // 5. Rotate Strike on Runs
  // Note: If it's the last ball of the over, we swapped strike above. 
  // If runs are odd, we swap again (effectively keeping original striker if odd runs on last ball? No, standard rules apply sequentially).
  // Standard rule: 
  // 1. Runs run change strike.
  // 2. Then Over end changes strike.
  
  // Let's redo strike rotation carefully.
  // First, swap based on runs run (excluding boundary runs technically, but for simplicity assuming runs=ran runs unless 4/6)
  // Simplification: 1, 3 runs -> Swap. 4, 6 -> No swap.
  // If byes/legbyes + runs are odd -> Swap.
  
  const runsToCheckForSwap = outcome.runs; // Usually extras don't cause swap unless they are ran, but here simple model.
  if (runsToCheckForSwap % 2 !== 0) {
     const temp = newState.currentBatsmen.strikerId;
     newState.currentBatsmen.strikerId = newState.currentBatsmen.nonStrikerId;
     newState.currentBatsmen.nonStrikerId = temp;
  }

  // If over ended, swap again
  // Wait, we did it above inside the if(ballsInCurrentOver === 6).
  // Is that correct order?
  // Last ball (6th): Hit for 1. 
  // 1. Odd run -> Swap (Striker is now NonStriker).
  // 2. Over end -> Swap (New Striker becomes NonStriker).
  // Result: Original Striker faces next over. Correct.

  // 6. Handle Wicket (Update Current Batsmen)
  if (outcome.isWicket) {
      // The striker is out (simplification: assume striker is always the one out unless runout at non-striker end specified)
      // In this simple app, we assume Striker is out.
      // We set strikerId to empty string, UI must prompt to select new batsman.
      newState.currentBatsmen.strikerId = '';
  }

  return newState;
};
