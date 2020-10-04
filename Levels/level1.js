const level1 = { 
    planets : [
    { x: 50, y: 50, size: 20, color: '#F0F', orbitDistance: 30 },
    { x: 50, y: 125, size: 20, color: '#0FF', orbitDistance: 30 },
    { x: 125, y: 150, size: 20, color: '#0FF', orbitDistance: 30 },
    { x: 180 , y: 150, size: 10, color: '#0FF', orbitDistance: 30 },
    { x: 240, y: 140, size: 10, color: '#0FF', orbitDistance: 30 },
    { x: 300, y: 170, size: 10, color: '#0FF', orbitDistance: 20 },
    { x: 330, y: 210, size: 10, color: '#0FF', orbitDistance: 20 },

    { x: 520, y: 160, size: 240, color: '#0FF', orbitDistance: 50 },
    { x: 1000, y: 120, size: 150, color: '#0FF', orbitDistance: 50 },
    { x: 1460, y: 100, size: 40, color: '#0FF', orbitDistance: 50 },
    { x: 1450, y: 350, size: 40, color: '#0FF', orbitDistance: 50 },
    { x: 1480, y: 520, size: 60, color: '#0FF', orbitDistance: 50 },

    { x: 500, y: 460, size: 40, color: '#0FF', orbitDistance: 50 },
    { x: 790, y: 440, size: 40, color: '#0FF', orbitDistance: 50 },
    { x: 620, y: 500, size: 40, color: '#0FF', orbitDistance: 50 },
    
    { x: 740, y: 650, size: 120, color: '#0FF', orbitDistance: 50 },
    { x: 920, y: 690, size: 30, color: '#0FF', orbitDistance: 50 },
    { x: 1300, y: 680, size: 80, color: '#0FF', orbitDistance: 50 },
    { x: 1100, y: 660, size: 80, color: '#0FF', orbitDistance: 50 },

    { x: 1500, y: 700, size: 35, color: '#FF0', orbitDistance: 50 },
    ],
    background : 'Assets/Sprites/Fond5.png',
    music : 'Assets/Music/LEVEL1_2.mp3',
    asteroidLines = [
        { points: [
            { x: 100, y: 500 }, 
            { x: 400, y: 510 }, 
            { x: 500, y: 430 }, 
            { x: 1200, y: 600 }
        ] },
      ],
};



export { level1 };