/** The Serenity room — beside still water. */
import { createRoom } from './room.js';
import { makeSerenity } from '../map/regions.js';

export const { enter } = createRoom({
  id: 'serenity',
  phenomenon: makeSerenity,
  air: (sound) => sound.noise({ color: 'pink', level: 0.02, fadeIn: 4, filter: { frequency: 380 } }),
  painting: {
    slug: 'water-lilies',
    title: 'Water Lilies',
    artist: 'Claude Monet',
    year: 'c. 1915–26',
    aspect: 3.0,
    palette: [[175, 40, 55], [340, 45, 76], [150, 30, 50]],
  },
});
