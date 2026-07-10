/** The Longing room — between two lights that reach. */
import { createRoom } from './room.js';
import { makeLonging } from '../map/regions.js';

export const { enter } = createRoom({
  id: 'longing',
  phenomenon: makeLonging,
  air: (sound) => {
    const d = sound.drone({ frequencies: [196, 197.4], spread: 0 });
    d.set(0.016, 3);
    return d;
  },
  painting: {
    slug: 'two-fridas',
    title: 'The Two Fridas',
    artist: 'Frida Kahlo',
    year: '1939',
    aspect: 1.0,
    palette: [[353, 62, 46], [38, 30, 85], [190, 35, 45]],
  },
});
