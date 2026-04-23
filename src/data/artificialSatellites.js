// src/data/artificialSatellites.js

export const ARTIFICIAL_SATELLITES = {
    Earth: [
        {
            name: 'ISS',
            model: '/models/iss.glb',
            type: 'orbit',
            size: 0.01,
            distance: 2.2,
            orbitSpeed: 0.05,
            inclination: 0.51
        },
        {
            name: 'Hubble',
            model: '/models/hubble.glb',
            type: 'orbit',
            size: 0.001,
            distance: 2.4,
            orbitSpeed: 0.04,
            inclination: 0.49
        },
        {
            name: 'Voyager 1',
            model: '/models/voyager.glb',
            type: 'escape',
            size: 0.05,
            distance: 65,
            orbitSpeed: 0.0003
        },
        {
            name: 'Parker Solar Probe',
            model: '/models/parker.glb',
            type: 'solarOrbit',
            size: 0.1,
            distance: 3.5,
            orbitSpeed: 0.02,
            inclination: 0.3,
            eccentricity: 0.3, 
        },
        {
            name: 'James Webb',
            model: '/models/james_web.glb',
            type: 'lagrange',
            size: 0.02,
            distance: 7,
            orbitSpeed: 0.01
        }
    ]
}