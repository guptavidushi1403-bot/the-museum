/** The Awe room — under the gathering wave. */
import { createRoom } from './room.js';
import { makeAwe } from '../map/regions.js';

export const { enter } = createRoom({
  id: 'awe',
  phenomenon: makeAwe,
  air: (sound) => sound.noise({ color: 'brown', level: 0.03, fadeIn: 4, filter: { frequency: 200 } }),
  painting: {
    slug: 'great-wave',
    title: 'Under the Wave off Kanagawa',
    artist: 'Katsushika Hokusai',
    year: 'c. 1830–32',
    aspect: 1.475,
    palette: [[214, 65, 40], [202, 15, 88], [40, 30, 80]],
  },
});
