const level = {
    planets : [
    { x: 100, y: 400, size: 80, image: 'earth', orbitDistance: 50 },
    { x: 300, y: 300, size: 20, image: 'saumon', orbitDistance: 50 },
    { x: 500, y: 500, size: 20, image: 'crateres', orbitDistance: 50 },
    { x: 800, y: 400, size: 30, image: 'crateres', orbitDistance: 50 },
    { x: 1000, y: 450, size: 100, image: 'saumon', orbitDistance: 50 },
    { x: 1200, y: 200, size: 20, image: 'saumon', orbitDistance: 50 },
    { x: 1400, y: 400, size: 80, image: 'crateres', orbitDistance: 50 },
    { x: 1800, y: 400, size: 50, image: 'earth', orbitDistance: 50 }
    ],
    background : 'Assets/Sprites/Fond4.jpg',
    music : 'Assets/Music/LEVEL1_2.mp3',
    asteroidLines :
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
