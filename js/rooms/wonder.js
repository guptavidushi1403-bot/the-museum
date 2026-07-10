/** The Wonder room — inside the turning of stars. */
import { createRoom } from './room.js';
import { makeWonder } from '../map/regions.js';

export const { enter } = createRoom({
  id: 'wonder',
  phenomenon: makeWonder,
  air: (sound) => {
    const d = sound.drone({ frequencies: [1046.5, 1318.5], spread: 6 });
    d.set(0.012, 3);
    return d;
  },
  painting: {
    slug: 'starry-night',
    title: 'The Starry Night',
    artist: 'Vincent van Gogh',
    year: '1889',
    aspect: 1.25,
    palette: [[222, 60, 62], [46, 85, 66], [228, 50, 38]],
  },
});
