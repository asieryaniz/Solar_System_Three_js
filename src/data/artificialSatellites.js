// src/data/artificialSatellites.js

export const ARTIFICIAL_SATELLITES = {
    Earth: [
        {
            name: 'ISS',
            model: '/models/iss.glb',
            size: 0.01,
            distance: 2.2,
            orbitSpeed: 0.05,
            inclination: 0.51
        },
        {
            name: 'Hubble',
            model: '/models/hubble.glb',
            size: 0.001,
            distance: 2.4,
            orbitSpeed: 0.04,
            inclination: 0.49
        }
    ]
}