const level = {
  planets: [
    { x: 100, y: 450, size: 15, image: Math.floor(Math.random() * 12), orbitDistance: 50 , isStart: true },
    { x: 100, y: 575, size: 15, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 100, y: 700, size: 15, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 100, y: 825, size: 15, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 100, y: 100, size: 15, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 450, y: 220, size: 350, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 800, y: 50, size: 30, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 1250, y: 125, size: 150, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 1250, y: 400, size: 200, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 775, y: 350, size: 200, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 1800, y: 75, size: 15, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 1800, y: 200, size: 15, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 1800, y: 325, size: 15, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 1825, y: 825, size: 60, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 1600, y: 825, size: 15, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 1450, y: 700, size: 15, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 1300, y: 575, size: 15, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 900, y: 575, size: 15, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 500, y: 500, size: 10, image: Math.floor(Math.random() * 12), orbitDistance: 30 },
    { x: 300, y: 825, size: 15, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 500, y: 750, size: 150, image: Math.floor(Math.random() * 12), orbitDistance: 50 },
    { x: 700, y: 650, size: 150, image: Math.floor(Math.random() * 12), orbitDistance: 50 },

    { x: 1850, y: 450, size: 15, image: Math.floor(Math.random() * 12), orbitDistance: 50, isEnd: true },
  ],
  background: './Assets/Sprites/Fond6.jpg',
  music: './Assets/Music/LEVEL2.mp3',
  levelNumber: 1,
  asteroidLines: [
    {
      points: [
        { x: 100, y: 500 },
        { x: 400, y: 510 },
        { x: 500, y: 430 },
        { x: 1200, y: 600 },
      ],
    },
  ],
};

export { level }