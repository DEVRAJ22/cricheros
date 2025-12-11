export const FIELD_ZONES = [
  { name: "Fine Leg", min: 200, max: 250 },
  { name: "Square Leg", min: 160, max: 200 },
  { name: "Mid-Wicket", min: 130, max: 160 },
  { name: "Long-On", min: 110, max: 130 },
  { name: "Straight", min: 85, max: 110 },
  { name: "Long-Off", min: 60, max: 85 },
  { name: "Cover", min: 30, max: 60 },
  { name: "Point", min: 0, max: 30 }, // Handle wrapping logic 0-30
  { name: "Third Man", min: 300, max: 360 },
  { name: "Point", min: 360, max: 360 } // Edge case
];

// Helper to get zone from angle
export const getFieldZone = (angle: number): string => {
  // Normalize angle to 0-360
  let normAngle = angle % 360;
  if (normAngle < 0) normAngle += 360;

  // Special handling for Point which wraps around 0/360
  if (normAngle >= 0 && normAngle <= 30) return "Point";
  if (normAngle >= 330 && normAngle <= 360) return "Third Man"; // Adjusted based on table gap, assume 3rd man covers the rest

  const zone = FIELD_ZONES.find(z => normAngle >= z.min && normAngle < z.max);
  return zone ? zone.name : "the field";
};

export const COMMENTARY_TEMPLATES = {
  dot: [
    "Perfect good length ball by {bowler}. {batter} defends it back.",
    "Tight line from {bowler}. Dot ball.",
    "Beaten! {bowler} squares up {batter}. No run.",
    "Straight to the fielder at {field_zone}."
  ],
  single: [
    "{batter} works it to {field_zone} for a comfortable single.",
    "Quick single taken towards {field_zone}.",
    "Pushed gently to {field_zone}, they scamper through for one."
  ],
  twoThree: [
    "Nicely guided to {field_zone}. They steal two runs.",
    "Good running between the wickets — {runs} taken.",
    "Plugged in the gap at {field_zone}, excellent running."
  ],
  four: [
    "Crisp boundary! {batter} drives through {field_zone} for four.",
    "Beautiful timing! Races away to the {field_zone} fence.",
    "{batter} pierces the gap at {field_zone} — four runs!"
  ],
  six: [
    "MASSIVE six! {batter} sends it over {field_zone}.",
    "That's huge! Right into the crowd at {field_zone}.",
    "{batter} launches it — 6 runs!"
  ],
  wicket: [
    "OUT! {batter} edges to {fielder} — {bowler} gets the breakthrough!",
    "Clean bowled! {bowler} completely beats {batter}.",
    "Caught at {field_zone}! Smart bowling from {bowler}.",
    "Run out! Tragedy for {batter}."
  ],
  wide: [
    "Wide ball from {bowler}. Too far outside off.",
    "Drifting down leg, wide signalled."
  ],
  noBall: [
    "No-ball! Overstepping from {bowler}.",
    "No-ball! Free hit coming up."
  ]
};
