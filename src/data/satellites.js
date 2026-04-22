export const SATELLITES = {

    Earth: [
      {
        name: 'Moon',
        size: 0.27,
        distance: 3.5,
        orbitSpeed: 0.03,
        rotationSpeed: 0.01,
        texture: '/textures/moons/earth_moon.jpg',
        tilt: 0.089,
        eccentricity: 0.055,
        tidalLock: true
      }
    ],
  
    Mars: [
      {
        name: 'Phobos',
        size: 0.08,
        distance: 1.8,
        orbitSpeed: 0.06,
        rotationSpeed: 0.01,
        texture: '/textures/moons/phobos.jpg',
        tilt: 0.01,
        eccentricity: 0.015,
        tidalLock: true
      },
      {
        name: 'Deimos',
        size: 0.05,
        distance: 2.8,
        orbitSpeed: 0.035,
        rotationSpeed: 0.01,
        texture: '/textures/moons/deimos.jpg',
        tilt: 0.02,
        eccentricity: 0.0005,
        tidalLock: true
      }
    ],
  
    Jupiter: [
      {
        name: 'Io',
        size: 0.2,
        distance: 2.8,
        orbitSpeed: 0.07,
        texture: '/textures/moons/io.jpg',
        tilt: 0.01,
        eccentricity: 0.004,
        tidalLock: true
      },
      {
        name: 'Europa',
        size: 0.18,
        distance: 3.2,
        orbitSpeed: 0.055,
        texture: '/textures/moons/europa.jpg',
        tilt: 0.008,
        eccentricity: 0.009,
        tidalLock: true
      },
      {
        name: 'Ganymede',
        size: 0.25,
        distance: 4.8,
        orbitSpeed: 0.045,
        texture: '/textures/moons/ganymede.jpg',
        tilt: 0.003,
        eccentricity: 0.001,
        tidalLock: true
      },
      {
        name: 'Callisto',
        size: 0.22,
        distance: 6.5,
        orbitSpeed: 0.035,
        texture: '/textures/moons/callisto.jpg',
        tilt: 0.005,
        eccentricity: 0.007,
        tidalLock: true
      }
    ],
  
    Saturn: [
      {
        name: 'Titan',
        size: 0.23,
        distance: 5,
        orbitSpeed: 0.045,
        texture: '/textures/moons/titan.png',
        tilt: 0.02,
        eccentricity: 0.028,
        tidalLock: true
      }
    ],
  
    Uranus: [
      {
        name: 'Titania',
        size: 0.15,
        distance: 3.5,
        orbitSpeed: 0.035,
        texture: '/textures/moons/titania.jpg',
        tilt: 0.05,
        eccentricity: 0.002,
        tidalLock: true
      }
    ],
  
    Neptune: [
      {
        name: 'Triton',
        size: 0.18,
        distance: 3.5,
        orbitSpeed: 0.04,
        texture: '/textures/moons/triton.jpg',
        tilt: 0.27,
        eccentricity: 0.00002,
        tidalLock: true
      }
    ]
  }