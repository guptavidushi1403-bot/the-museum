/** The Intimacy room — a candle in a dark room. */
import { createRoom } from './room.js';
import { makeIntimacy } from '../map/regions.js';

export const { enter } = createRoom({
  id: 'intimacy',
  phenomenon: makeIntimacy,
  air: (sound) => {
    const d = sound.drone({ frequencies: [392], spread: 2 });
    d.set(0.008, 4);
    return d;
  },
  painting: {
    slug: 'pearl-earring',
    title: 'Girl with a Pearl Earring',
    artist: 'Johannes Vermeer',
    year: 'c. 1665',
    aspect: 0.876,
    palette: [[210, 45, 60], [48, 70, 70], [28, 40, 35]],
  },
});
