/**
 * Minimal event emitter shared by the core engine modules.
 */
export function createEmitter() {
  const channels = new Map();

  return {
    /** Subscribe. Returns an unsubscribe function. */
    on(event, handler) {
      let set = channels.get(event);
      if (!set) channels.set(event, (set = new Set()));
      set.add(handler);
      return () => set.delete(handler);
    },

    emit(event, detail) {
      const set = channels.get(event);
      if (!set) return;
      for (const handler of [...set]) handler(detail);
    },
  };
}
