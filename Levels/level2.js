const level = {
  planets: [
    { x: 100, y: 450, size: 15, image: Math.floor(Math.random() * 12), orbitDistance: 50 , isStart: true },
    { x: 100, y: 575, size: 15, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 100, y: 700, size: 15, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 100, y: 825, size: 15, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 130, y: 75, size: 15, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 450, y: 220, size: 350, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 800, y: 50, size: 30, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 1250, y: 125, size: 150, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 1250, y: 375, size: 180, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 775, y: 350, size: 200, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 1800, y: 75, size: 15, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 1825, y: 200, size: 25, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 1830, y: 325, size: 40, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 1825, y: 825, size: 60, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 1600, y: 825, size: 15, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 1450, y: 700, size: 15, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 1300, y: 575, size: 15, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 900, y: 575, size: 15, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 500, y: 500, size: 10, image: Math.floor(Math.random() * 12), orbitDistance: 30 },
    { x: 300, y: 825, size: 15, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 500, y: 750, size: 150, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 750, y: 800, size: 150, image: Math.floor(Math.random() * 12), orbitDistance: 50 },

    { x: 1825, y: 450, size: 60, image: Math.floor(Math.random() * 12), orbitDistance: 50, isEnd: true },
  ],
  background: './Assets/Sprites/Fond6.jpg',
  music: './Assets/Music/LEVEL2.mp3',
  levelNumber: 2,
  asteroidLines: [
    {
      points: [
        { x: 175, y: 150 },
        { x: 225, y: 750 },
      ],
    },
    {
      points: [
        { x: 250, y: 425 },
        { x: 625, y: 450 },
      ],
    },
    {
      points: [
        { x: 650, y: 490 },
        { x: 900, y: 500 },
      ],
    },
    {
      points: [
        { x: 950, y: 500 },
        { x: 1600, y: 525 },
      ],
    },
    {
      points: [
        { x: 1750, y: 150 },
        { x: 1600, y: 750 },
      ],
    },
    {
      points: [
        { x: 675, y: 125 },
        { x: 1050, y: 250 },
      ],
    },
    {
      points: [
        { x: 1400, y: 125 },
        { x: 1600, y: 250 },
      ],
    },
    {
      points: [
        { x: 1100, y: 600 },
        { x: 1600, y: 900 },
      ],
    },
    {
      points: [
        { x: 450, y: 600 },
        { x: 750, y: 650 },
      ],
    },
  ],
};

export { level }