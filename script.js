const cursor = document.querySelector('.cursor');
const progress = document.querySelector('.progress span');
const track = document.querySelector('.horizontal-track');
const menuButton = document.querySelector('.menu-button');

window.addEventListener('pointermove', (event) => {
  cursor.style.left = `${event.clientX}px`;
  cursor.style.top = `${event.clientY}px`;
});

document.querySelectorAll('a, button, [data-cursor]').forEach((element) => {
  element.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
  element.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
});

window.addEventListener('scroll', () => {
  const scrollable = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.width = `${(window.scrollY / scrollable) * 100}%`;

  const explore = document.querySelector('.explore');
  const bounds = explore.getBoundingClientRect();
  if (bounds.top < window.innerHeight && bounds.bottom > 0) {
    const travel = Math.min(360, Math.max(0, (window.innerHeight - bounds.top) * 0.22));
    track.style.setProperty('--track-shift', `${-travel}px`);
  }
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
  document.body.classList.toggle('menu-open', !isOpen);
});

document.querySelectorAll('.menu-panel a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open menu');
    document.body.classList.remove('menu-open');
  });
});

document.querySelectorAll('.thing-row').forEach((row) => {
  row.addEventListener('mouseenter', () => {
    const colors = { yellow: '#dfe7c8', blue: '#c5ddd7', pink: '#d9a69b', green: '#aec4aa' };
    row.style.setProperty('--row-color', colors[row.dataset.color]);
  });
});

const audioPlayer = document.querySelector('#audio-player');
const songPicker = document.querySelector('#song-picker');
const playlist = document.querySelector('#playlist');
const playButton = document.querySelector('#play-song');
const previousButton = document.querySelector('#previous-song');
const nextButton = document.querySelector('#next-song');
const progressInput = document.querySelector('#song-progress');
const currentTimeLabel = document.querySelector('#current-time');
const durationLabel = document.querySelector('#song-duration');
const nowPlayingTitle = document.querySelector('#now-playing-title');
let songs = [];
let activeSongIndex = -1;
const bundledSong = {
  name: 'WhatsApp Audio 2026-09-14 at 10.41.47 PM',
  type: 'audio/mpeg',
  url: encodeURI('WhatsApp Audio 2026-09-14 at 10.41.47 PM.mpeg')
};

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return '00:00';
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
};

const renderPlaylist = () => {
  playlist.innerHTML = '';
  if (!songs.length) {
    playlist.innerHTML = '<p class="playlist-empty">Your playlist is waiting.</p>';
    return;
  }
  songs.forEach((song, index) => {
    const item = document.createElement('button');
    item.className = `playlist-item${index === activeSongIndex ? ' is-active' : ''}`;
    item.type = 'button';
    item.innerHTML = `<span>${String(index + 1).padStart(2, '0')}</span><strong>${song.name}</strong><small>${song.type.split('/')[1]?.toUpperCase() || 'AUDIO'}</small>`;
    item.addEventListener('click', () => loadSong(index, true));
    playlist.appendChild(item);
  });
};

const loadSong = (index, shouldPlay = false) => {
  if (!songs[index]) return;
  activeSongIndex = index;
  audioPlayer.src = songs[index].url;
  nowPlayingTitle.textContent = songs[index].name.toUpperCase();
  progressInput.value = 0;
  currentTimeLabel.textContent = '00:00';
  renderPlaylist();
  if (shouldPlay) audioPlayer.play();
};

songPicker.addEventListener('change', (event) => {
  songs.forEach((song) => {
    if (song.url.startsWith('blob:')) URL.revokeObjectURL(song.url);
  });
  songs = [...event.target.files].map((file) => ({ name: file.name.replace(/\.[^/.]+$/, ''), type: file.type, url: URL.createObjectURL(file) }));
  loadSong(0);
});

playButton.addEventListener('click', () => {
  if (!songs.length) return songPicker.click();
  if (audioPlayer.paused) audioPlayer.play();
  else audioPlayer.pause();
});
previousButton.addEventListener('click', () => loadSong(Math.max(0, activeSongIndex - 1), true));
nextButton.addEventListener('click', () => loadSong((activeSongIndex + 1) % songs.length, true));
audioPlayer.addEventListener('play', () => { playButton.textContent = 'PAUSE'; });
audioPlayer.addEventListener('pause', () => { playButton.textContent = 'PLAY'; });
audioPlayer.addEventListener('loadedmetadata', () => { durationLabel.textContent = formatTime(audioPlayer.duration); });
audioPlayer.addEventListener('timeupdate', () => {
  progressInput.value = audioPlayer.duration ? (audioPlayer.currentTime / audioPlayer.duration) * 100 : 0;
  currentTimeLabel.textContent = formatTime(audioPlayer.currentTime);
});
audioPlayer.addEventListener('ended', () => nextButton.click());
progressInput.addEventListener('input', () => {
  if (audioPlayer.duration) audioPlayer.currentTime = (progressInput.value / 100) * audioPlayer.duration;
});

songs = [bundledSong];
loadSong(0);