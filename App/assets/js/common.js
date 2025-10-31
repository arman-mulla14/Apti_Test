const Common = {
  setTheme() {
    // Hook for future theme toggles
    document.documentElement.dataset.theme = 'dark';
  },
  formatDuration(ms) {
    const total = Math.floor(ms / 1000);
    const m = Math.floor(total / 60).toString().padStart(2, '0');
    const s = (total % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }
};


