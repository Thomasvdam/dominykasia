const modifiers = [
  'Unsealed', 'Celestial', 'Forbidden', 'Infinite', 'Awakened', 'Abyssal',
  'Legendary', 'Transcendent', 'Moonlit', 'Cataclysmic', 'Reincarnated', 'Divine',
];
const titles = [
  'Dragon Emperor', 'Void Sovereign', 'Storm Ronin', 'Chaos Senpai',
  'Starblade Saint', 'Aura Overlord', 'Dimension Breaker', 'Final Boss',
  'Shadow Monarch', 'Cosmic Duelist', 'Demon King', 'Eclipse Guardian',
];
const techniques = [
  'Void Dragon Requiem', 'Infinite Aura Release', 'the Thousand-Sun Uppercut',
  'Forbidden Moonfall', 'the World-Ender Stance', 'Celestial Chaos Mode',
  'the Seven-Seal Awakening', 'the Ultimate Side-Eye', 'Reality Breaker',
  'the Final Form of Friendship', 'the Cosmic Uno Reverse', 'Eternal Thunder Domain',
];
const errands = [
  'get the last dumpling', 'skip the queue', 'find the Wi-Fi password',
  'win an argument in the group chat', 'make it to brunch', 'avoid a side quest',
  'open a stubborn jar', 'ask for extra sauce', 'get five more minutes of sleep',
  'beat the self-checkout machine', 'choose a profile picture', 'find the TV remote',
];
const trainingArcs = ['three seasons', '900 episodes', 'a thousand years', 'seven filler arcs', 'one suspiciously long weekend'];
const consequences = [
  'The animators demanded a raise.', 'The soundtrack switched to Latin.',
  'Even the final boss asked for a selfie.', 'The power scaler rage-quit.',
  'The tournament arc has been postponed.', 'His hair got its own opening theme.',
  'The moon filed a formal complaint.', 'The budget only covers one more transformation.',
];

/** Fresh anime nonsense for each card appearance; entirely browser-local. */
export function createCaption(random = Math.random) {
  const pick = values => values[Math.floor(random() * values.length)];
  const title = `The ${pick(modifiers)} ${pick(titles)}`;
  const stories = [
    () => `Unleashed ${pick(techniques)} just to ${pick(errands)}.`,
    () => `Trained for ${pick(trainingArcs)} to ${pick(errands)}. ${pick(consequences)}`,
    () => `${pick(techniques)} is only his warm-up. ${pick(consequences)}`,
    () => `Broke his limiter to ${pick(errands)}. ${pick(consequences)}`,
  ];
  return { title, blurb: pick(stories)() };
}
