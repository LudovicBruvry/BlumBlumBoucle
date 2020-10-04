const level = {
    planets : [
    { x: 100, y: 400, size: 80, color: '#F0F', orbitDistance: 50 },
    { x: 300, y: 300, size: 20, color: '#0FF', orbitDistance: 50 },
    { x: 500, y: 500, size: 20, color: '#0FF', orbitDistance: 50 },
    { x: 800, y: 400, size: 30, color: '#0FF', orbitDistance: 50 },
    { x: 1000, y: 450, size: 100, color: '#0FF', orbitDistance: 50 },
    { x: 1200, y: 200, size: 20, color: '#0FF', orbitDistance: 50 },
    { x: 1250, y: 400, size: 80, color: '#0FF', orbitDistance: 50 },
    { x: 1500, y: 400, size: 20, color: '#0FF', orbitDistance: 50, isEnd: true }
    ],
    background : 'Assets/Sprites/Fond4.png',
    music : 'Assets/Music/LEVEL1_2.mp3',
    asteroidLines : [
        { points: [
            { x: 100, y: 500 },
            { x: 400, y: 510 },
            { x: 500, y: 430 },
            { x: 1200, y: 600 }
        ] },
    ],
};

export { level };
