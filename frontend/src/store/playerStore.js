import { create } from 'zustand';

const usePlayerStore = create((set) => ({
  currentSong:  null,
  queue:        [],
  isPlaying:    false,
  currentIndex: 0,

  setQueue: (songs) => set({
    queue:        songs,
    currentIndex: 0,
    currentSong:  songs[0] || null,
  }),

  playSong: (song, index) => set({
    currentSong:  song,
    currentIndex: index,
    isPlaying:    true,
  }),

  nextSong: () => set((state) => {
    const next = state.currentIndex + 1;
    if (next < state.queue.length) {
      return {
        currentIndex: next,
        currentSong:  state.queue[next],
        isPlaying:    true,
      };
    }
    return {};
  }),

  prevSong: () => set((state) => {
    const prev = state.currentIndex - 1;
    if (prev >= 0) {
      return {
        currentIndex: prev,
        currentSong:  state.queue[prev],
        isPlaying:    true,
      };
    }
    return {};
  }),

  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
}));

export default usePlayerStore;