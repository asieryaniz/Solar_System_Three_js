// src/data/artificialSatellites.js

export const ARTIFICIAL_SATELLITES = {
    Earth: [
        {
            name: 'ISS',
            model: '/models/iss.glb',
            type: 'orbit',
            size: 0.01,
            distance: 2.2,
            orbitSpeed: 0.03,
            inclination: 0.51,
            info: {
                title: 'ISS (International Space Station)',
                description: 'A modular space station in low Earth orbit, serving as a microgravity laboratory for scientific research and international cooperation.',
                details: [
                    'Altitude: ~400 km',
                    'Speed: 28,000 km/h',
                    'Orbit period: ~90 minutes',
                    'Crew: 7 astronauts',
                    'Agencies: NASA, Roscosmos, ESA, JAXA, CSA'
                ],
                image: '/images/iss.jpg'
            }
        },
        {
            name: 'Hubble',
            model: '/models/hubble.glb',
            type: 'orbit',
            size: 0.001,
            distance: 2.4,
            orbitSpeed: 0.02,
            inclination: 0.49,
            info: {
                title: 'Hubble Space Telescope',
                description: 'A space telescope that has provided some of the most detailed visible-light images, helping to revolutionize astronomy.',
                details: [
                    'Launched: 1990',
                    'Altitude: ~540 km',
                    'Orbit period: ~95 minutes',
                    'Operated by: NASA / ESA',
                    'Key discoveries: Deep Field, expanding universe'
                ],
                image: '/images/hubble.jpeg'
            }
        },
        {
            name: 'Voyager 1',
            model: '/models/voyager.glb',
            type: 'escape',
            size: 0.1,
            distance: 65,
            orbitSpeed: 0.0003,
            info: {
                title: 'Voyager 1',
                description: 'The farthest human-made object from Earth, currently traveling through interstellar space.',
                details: [
                    'Launched: 1977',
                    'Status: Active',
                    'Distance: ~24+ billion km from Earth',
                    'Speed: ~61,000 km/h',
                    'Mission: Study outer planets and interstellar space'
                ],
                image: '/images/voyager.jpg'
            }
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
            info: {
                title: 'Parker Solar Probe',
                description: 'A NASA mission that travels closer to the Sun than any spacecraft in history to study the solar corona.',
                details: [
                    'Launched: 2018',
                    'Closest approach: ~6 million km to Sun',
                    'Top speed: ~700,000 km/h',
                    'Mission: Study solar wind and corona',
                    'Heat shield: withstands 1300°C'
                ],
                image: '/images/parker.png'
            }
        },
        {
            name: 'James Webb',
            model: '/models/james_web.glb',
            type: 'lagrange',
            size: 0.02,
            distance: 7,
            orbitSpeed: 0.01,
            info: {
                title: 'James Webb Space Telescope (JWST)',
                description: 'The most powerful space telescope ever built, observing the universe in infrared from the Sun–Earth L2 point.',
                details: [
                    'Launched: 2021',
                    'Location: Sun–Earth L2 (~1.5 million km)',
                    'Wavelength: Infrared',
                    'Mission: Early universe, exoplanets',
                    'Mirror diameter: 6.5 meters'
                ],
                image: '/images/james.png'
            }
        }
    ]
}