const level = {
  planets: [
    { x: 100, y: 400, size: 90, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 300, y: 300, size: 30, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 500, y: 500, size: 30, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 800, y: 400, size: 40, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 1000, y: 450, size: 100, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 1200, y: 200, size: 30, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 1400, y: 400, size: 90, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 1800, y: 400, size: 60, image: Math.floor(Math.random() * 12), orbitDistance: 50, isEnd: true },
  ],
  background: 'Assets/Sprites/Fond4.jpg',
  music: 'Assets/Music/LEVEL1_2.mp3',
  asteroidLines:
    [
      {
        points: [
          { x: 500, y: 100 },
          { x: 800, y: 300 },
        ],
      },
      {
        points: [
          { x: 650, y: 600 },
          { x: 850, y: 490 },
        ],
      },
      {
        points: [
          { x: 1000, y: 350 },
          { x: 1150, y: 250 },
        ],
      },
    ],
};

export { level };
