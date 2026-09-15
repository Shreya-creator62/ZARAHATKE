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

  if (!track) return;

  const explore = document.querySelector('.explore');
  if (!explore) return;

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
let activeCollectionKey = localStorage.getItem('sukoon-active-collection') || 'lofi';

const bundledSong = {
  id: 'default-bundled',
  name: 'WhatsApp Audio 2026-09-14 at 10.41.47 PM',
  type: 'audio/mpeg',
  url: encodeURI('WhatsApp Audio 2026-09-14 at 10.41.47 PM.mpeg'),
  source: 'default',
  duration: '4:22'
};

const defaultCollections = {
  lofi: [
    { id: 'lofi-1', name: 'Night Drive', type: 'audio/mpeg', url: '', duration: '4:22', source: 'default' },
    { id: 'lofi-2', name: 'Rainy Rooftop', type: 'audio/mpeg', url: '', duration: '3:58', source: 'default' },
    { id: 'lofi-3', name: 'Soft Static', type: 'audio/mpeg', url: '', duration: '5:14', source: 'default' }
  ],
  lovy: [
    { id: 'lovy-1', name: 'Moonlit Words', type: 'audio/mpeg', url: '', duration: '3:41', source: 'default' },
    { id: 'lovy-2', name: 'Slow Bloom', type: 'audio/mpeg', url: '', duration: '4:06', source: 'default' },
    { id: 'lovy-3', name: 'Afterglow', type: 'audio/mpeg', url: '', duration: '3:29', source: 'default' }
  ],
  desi: [
    { id: 'desi-1', name: 'Chai & Chill', type: 'audio/mpeg', url: '', duration: '3:51', source: 'default' },
    { id: 'desi-2', name: 'City Lights', type: 'audio/mpeg', url: '', duration: '4:18', source: 'default' },
    { id: 'desi-3', name: 'Late Night Bites', type: 'audio/mpeg', url: '', duration: '3:45', source: 'default' }
  ],
  nineties: [
    { id: 'nineties-1', name: 'Backseat Story', type: 'audio/mpeg', url: '', duration: '4:12', source: 'default' },
    { id: 'nineties-2', name: 'Neon Dreams', type: 'audio/mpeg', url: '', duration: '3:57', source: 'default' },
    { id: 'nineties-3', name: 'Summer Glide', type: 'audio/mpeg', url: '', duration: '4:24', source: 'default' }
  ]
};

const formatTime = (seconds) => {
  if (!Number.isFinite(seconds)) return '00:00';
  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const remainingSeconds = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${minutes}:${remainingSeconds}`;
};

const getCollectionStorageKey = (key) => `sukoon-playlist-${key}`;

const getCollectionSongs = (key) => {
  try {
    const stored = JSON.parse(localStorage.getItem(getCollectionStorageKey(key)) || '[]');
    return Array.isArray(stored) ? stored.filter((song) => song && song.name) : [];
  } catch (error) {
    return [];
  }
};

const saveCollectionSongs = (key, list) => {
  localStorage.setItem(getCollectionStorageKey(key), JSON.stringify(list));
};

const mergeCollectionSongs = (key) => [
  ...(defaultCollections[key] || []),
  ...getCollectionSongs(key)
];

const renderCollectionLists = () => {
  document.querySelectorAll('.collection-group').forEach((group) => {
    const key = group.dataset.collection || group.querySelector('.collection-tag').textContent.toLowerCase().replace(/[^a-z]+/g, '');
    group.dataset.collection = key;

    const list = group.querySelector('.song-list');
    const items = mergeCollectionSongs(key);
    list.innerHTML = items.map((song) => {
      const duration = song.duration || (song.type ? (song.type.split('/')[1]?.toUpperCase() || 'AUDIO') : 'LOCAL');
      return `<li><span>${song.name}</span><small>${duration}</small></li>`;
    }).join('');

    const button = group.querySelector('.collection-top button');
    if (button) {
      button.dataset.collection = key;
      button.addEventListener('click', () => {
        activeCollectionKey = key;
        localStorage.setItem('sukoon-active-collection', key);
      });
    }

    group.addEventListener('click', () => {
      activeCollectionKey = key;
      localStorage.setItem('sukoon-active-collection', key);
    });
  });
};

const renderPlaylist = () => {
  if (!playlist) return;

  playlist.innerHTML = '';
  if (!songs.length) {
    playlist.innerHTML = '<p class="playlist-empty">Your playlist is waiting.</p>';
    return;
  }

  songs.forEach((song, index) => {
    const item = document.createElement('button');
    item.className = `playlist-item${index === activeSongIndex ? ' is-active' : ''}`;
    item.type = 'button';
    item.innerHTML = `
      <span>${String(index + 1).padStart(2, '0')}</span>
      <strong>${song.name}</strong>
      <small>${song.source === 'custom' ? 'LOCAL' : (song.type.split('/')[1]?.toUpperCase() || 'AUDIO')}</small>
    `;
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

const readFileAsDataUrl = (file) => new Promise((resolve, reject) => {
  const reader = new FileReader();
  reader.onload = () => resolve(reader.result);
  reader.onerror = () => reject(new Error('Failed to read file'));
  reader.readAsDataURL(file);
});

songPicker.addEventListener('change', async (event) => {
  const files = [...event.target.files || []];
  if (!files.length) return;

  const savedForCollection = getCollectionSongs(activeCollectionKey);
  const uploadedSongs = await Promise.all(files.map(async (file) => {
    const dataUrl = await readFileAsDataUrl(file);
    return {
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: file.name.replace(/\.[^/.]+$/, ''),
      type: file.type || 'audio/mpeg',
      url: dataUrl,
      duration: 'LOCAL',
      source: 'custom'
    };
  }));

  const nextCollectionSongs = [...savedForCollection, ...uploadedSongs];
  saveCollectionSongs(activeCollectionKey, nextCollectionSongs);
  renderCollectionLists();

  const playableSongs = nextCollectionSongs.filter((song) => song && song.url);
  if (playableSongs.length) {
    songs = playableSongs;
    loadSong(0, true);
  }

  songPicker.value = '';
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
renderCollectionLists();
renderPlaylist();
loadSong(0);