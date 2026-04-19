// src/data/planets.js

export const PLANETS = [
    {
      name: 'Mercury',
      size: 0.4,
      distance: 4,
      orbitSpeed: 0.02,
      rotationSpeed: 0.01,
      texture: '/textures/mercury.png',
      info: {
        radius: '2,439 km',
        day: '58.6 Earth days',
        year: '88 days',
        moons: 0,
        description: 'The smallest planet and closest to the Sun, with extreme temperature variations.'
      }
    },
    {
      name: 'Venus',
      size: 0.9,
      distance: 6,
      orbitSpeed: 0.015,
      rotationSpeed: 0.008,
      texture: '/textures/venus.jpg',
      info: {
        radius: '6,052 km',
        day: '243 Earth days',
        year: '225 days',
        moons: 0,
        description: 'A toxic planet with a thick atmosphere and the hottest surface in the solar system.'
      }
    },
    {
      name: 'Earth',
      size: 1,
      distance: 8,
      orbitSpeed: 0.01,
      rotationSpeed: 0.02,
      texture: '/textures/earth.jpg',
      info: {
        radius: '6,371 km',
        day: '24 hours',
        year: '365 days',
        moons: 1,
        description: 'Our home planet, the only known world with life.'
      }
    },
    {
      name: 'Mars',
      size: 0.6,
      distance: 10,
      orbitSpeed: 0.008,
      rotationSpeed: 0.018,
      texture: '/textures/mars.jpeg',
      info: {
        radius: '3,390 km',
        day: '24.6 hours',
        year: '687 days',
        moons: 2,
        description: 'Known as the Red Planet, Mars has the largest volcano in the solar system.'
      }
    },
    {
      name: 'Jupiter',
      size: 2.5,
      distance: 14,
      orbitSpeed: 0.004,
      rotationSpeed: 0.04,
      texture: '/textures/jupiter.jpg',
      info: {
        radius: '69,911 km',
        day: '10 hours',
        year: '12 years',
        moons: 95,
        description: 'The largest planet, a gas giant with a famous Great Red Spot storm.'
      }
    },
    {
      name: 'Saturn',
      size: 2.2,
      distance: 18,
      orbitSpeed: 0.003,
      rotationSpeed: 0.038,
      texture: '/textures/saturn.jpg',
      info: {
        radius: '58,232 km',
        day: '10.7 hours',
        year: '29 years',
        moons: 146,
        description: 'A gas giant famous for its spectacular ring system.'
      }
    },
    {
      name: 'Uranus',
      size: 1.6,
      distance: 22,
      orbitSpeed: 0.002,
      rotationSpeed: 0.03,
      texture: '/textures/uranus.jpeg',
      info: {
        radius: '25,362 km',
        day: '17 hours',
        year: '84 years',
        moons: 27,
        description: 'An ice giant that rotates on its side, making it unique among planets.'
      }
    },
    {
      name: 'Neptune',
      size: 1.5,
      distance: 26,
      orbitSpeed: 0.0015,
      rotationSpeed: 0.028,
      texture: '/textures/neptune.jpeg',
      info: {
        radius: '24,622 km',
        day: '16 hours',
        year: '165 years',
        moons: 14,
        description: 'The farthest planet, known for its deep blue color and strong winds.'
      }
    }
]