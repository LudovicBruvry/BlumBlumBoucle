const level = {
  planets: [
    { x: 50, y: 50, size: 20, image: 'crateres', orbitDistance: 30 },
    { x: 50, y: 125, size: 20, image: 'earth', orbitDistance: 30 },
    { x: 125, y: 150, size: 20, image: 'saumon', orbitDistance: 30 },
    { x: 180, y: 150, size: 10, image: 'crateres', orbitDistance: 30 },
    { x: 240, y: 140, size: 10, image: 'earth', orbitDistance: 30 },
    { x: 300, y: 170, size: 10, image: 'saumon', orbitDistance: 20 },
    { x: 330, y: 210, size: 10, image: 'saumon', orbitDistance: 20 },

    { x: 520, y: 160, size: 240, image: 'earth', orbitDistance: 50 },
    { x: 1000, y: 120, size: 150, image: 'crateres', orbitDistance: 50 },
    { x: 1460, y: 100, size: 40, image: 'earth', orbitDistance: 50 },
    { x: 1450, y: 350, size: 40, image: 'crateres', orbitDistance: 50 },
    { x: 1480, y: 520, size: 60, image: 'saumon', orbitDistance: 50 },

    { x: 850, y: 300, size: 40, image: 'crateres', orbitDistance: 50 },
    { x: 790, y: 440, size: 40, image: 'saumon', orbitDistance: 50 },
    { x: 620, y: 500, size: 40, image: 'earth', orbitDistance: 50 },

    { x: 740, y: 650, size: 120, image: 'crateres', orbitDistance: 50 },
    { x: 920, y: 690, size: 30, image: 'crateres', orbitDistance: 50 },
    { x: 1300, y: 680, size: 80, image: 'saumon', orbitDistance: 50 },
    { x: 1100, y: 660, size: 80, image: 'saumon', orbitDistance: 50 },

    { x: 1800, y: 775, size: 60, image: 'earth', orbitDistance: 50 },
  ],
  background: 'Assets/Sprites/Fond5.jpg',
  music: 'Assets/Music/LEVEL1_2.mp3',
  asteroidLines: [
    {
      points: [
        { x: 100, y: 500 },
        { x: 675, y: 350 },
      ],
    },
    {
      points: [
        { x: 750, y: 100 },
        { x: 1000, y: 350 },
      ],
    },
    {
      points: [
        { x: 900, y: 600 },
        { x: 950, y: 350 },
      ],
    },
    {
      points: [
        { x: 1200, y: 200 },
        { x: 1350, y: 450 },
      ],
    },
    {
      points: [
        { x: 1000, y: 550 },
        { x: 1300, y: 450 },
      ],
    },
    {
      points: [
        { x: 1550, y: 120 },
        { x: 1750, y: 700 },
      ],
    },
    {
      points: [
        { x: 100, y: 25 },
        { x: 350, y: 125 },
      ],
    },
  ],
};

export { level };
