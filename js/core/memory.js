/**
 * Visit traces — the museum quietly remembers.
 *
 * Data layer only: which rooms were entered, which paintings were completed
 * (a completion means the Return ritual finished). However a room chooses
 * to surface a trace, it must stay subtle — never a badge, counter, or
 * achievement marker. Falls back to in-memory storage when localStorage is
 * unavailable, so the museum works (without remembering) in private modes.
 */
export function createMemory({ storage = null, key = 'the-museum:traces' } = {}) {
  const store = storage ?? pickStorage();

  function read() {
    try {
      const raw = store.getItem(key);
      if (raw) {
        const data = JSON.parse(raw);
        if (data && typeof data === 'object') {
          return { rooms: data.rooms ?? {}, paintings: data.paintings ?? {} };
        }
      }
    } catch {
      // Unreadable traces are simply forgotten.
    }
    return { rooms: {}, paintings: {} };
  }

  function write(data) {
    try {
      store.setItem(key, JSON.stringify(data));
    } catch {
      // Storage full or blocked — the museum just doesn't remember this.
    }
  }

  function touch(record) {
    const now = new Date().toISOString();
    record.first ??= now;
    record.last = now;
    record.count = (record.count ?? 0) + 1;
    return record;
  }

  return {
    /** The visitor entered an emotion room. */
    rememberRoom(roomId) {
      const data = read();
      data.rooms[roomId] = touch(data.rooms[roomId] ?? {});
      write(data);
    },

    /** The visitor completed a painting's Return ritual. */
    rememberReturn(paintingId) {
      const data = read();
      data.paintings[paintingId] = touch(data.paintings[paintingId] ?? {});
      write(data);
    },

    roomVisits(roomId) {
      return read().rooms[roomId]?.count ?? 0;
    },

    hasReturned(paintingId) {
      return Boolean(read().paintings[paintingId]);
    },

    all() {
      return read();
    },

    forget() {
      try {
        store.removeItem(key);
      } catch {
        // Nothing to forget.
      }
    },
  };
}

function pickStorage() {
  try {
    const probe = '__museum_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    const memory = new Map();
    return {
      getItem: (k) => (memory.has(k) ? memory.get(k) : null),
      setItem: (k, v) => memory.set(k, String(v)),
      removeItem: (k) => memory.delete(k),
    };
  }
}
