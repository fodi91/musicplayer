'use strict';
import { songs } from './songs.js';

const playBtnEl = document.querySelector('.play-btn');
const playerEl = document.querySelector('.player');
const playBtnIconEl = document.querySelector('.play-btn__icon');
const imageEl = document.querySelector('.music-info__img-container img');
const musicTitleEl = document.querySelector('.music-info__title');
const musicAuthorEl = document.querySelector('.music-info__author');
const playerSourceEl = document.querySelector('.player__source');
const prevBtnEl = document.querySelector('.prev-btn');
const nextBtnEl = document.querySelector('.next-btn');
const musicDurationEl = document.querySelector('.music-info__duration');
const musicCurrentTimeEl = document.querySelector('.music-info__currenttime');
const volumeRangeInputEl = document.querySelector('.volume-range__input');
const volumePlusEl = document.querySelector('#volume-plus');
const volumeMinusEl = document.querySelector('#volume-minus');
const muteButtonEl = document.querySelector('.mute__button');
const seekBarInputEl = document.querySelector('.seekbar__input');
const playlistEl = document.querySelector('.playlist');
const rootEl = document.querySelector(':root');
class App {
  #songs = songs;
  #songIndex = 0;

  constructor() {
    this._renderSong();
    this._renderPlaylist(this.#songs);

    playBtnEl.addEventListener('click', this._controlPlayButton.bind(this));
    nextBtnEl.addEventListener('click', this._nextSong.bind(this));
    prevBtnEl.addEventListener('click', this._prevSong.bind(this));
    playerEl.addEventListener('ended', this._nextSong.bind(this));
    playerEl.addEventListener(
      'loadedmetadata',
      this._durationDisplay.bind(this)
    );
    playerEl.addEventListener(
      'timeupdate',
      this._currentTimeDisplay.bind(this)
    );
    playerEl.addEventListener('play', this._activeSong.bind(this));
    playerEl.addEventListener('play', this._changeColor.bind(this));
    playlistEl.addEventListener('click', this._playPlaylistSong.bind(this));
    muteButtonEl.addEventListener('click', this._controlMuteButton.bind(this));
    volumePlusEl.addEventListener('click', this._increaseVolume.bind(this));
    volumeMinusEl.addEventListener('click', this._decreaseVolume.bind(this));
    volumeRangeInputEl.addEventListener('input', this._playerVolume.bind(this));
    playerEl.addEventListener('timeupdate', this._showProgress.bind(this));
    seekBarInputEl.addEventListener('input', this._controlSeekBar.bind(this));
  }
  _renderSong() {
    this._playerVolume();
    musicTitleEl.textContent = this.#songs[this.#songIndex].title;
    musicAuthorEl.textContent = this.#songs[this.#songIndex].author;
    playerSourceEl.src = this.#songs[this.#songIndex].url;
    playerEl.load();
  }
  _controlPlayButton() {
    playerEl.classList.toggle('play');
    if (playerEl.classList.contains('play')) {
      playBtnIconEl.classList.remove('fa-play');
      playBtnIconEl.classList.add('fa-pause');
      playBtnEl.setAttribute('aria-label', 'Pause');
      imageEl.classList.add('animation__play');
      playerEl.play();
    } else {
      playBtnIconEl.classList.remove('fa-pause');
      playBtnIconEl.classList.add('fa-play');
      playBtnEl.setAttribute('aria-label', 'Play');
      imageEl.classList.remove('animation__play');
      playerEl.pause();
    }
  }
  _nextSong() {
    this.#songIndex++;
    if (this.#songIndex > this.#songs.length - 1) {
      this.#songIndex = 0;
    }
    this._renderSong();
    if (playerEl.classList.contains('play')) {
      playerEl.play();
    }
  }
  _prevSong() {
    this.#songIndex--;
    if (this.#songIndex < 0) {
      this.#songIndex = this.#songs.length - 1;
    }
    this._renderSong();
    if (playerEl.classList.contains('play')) {
      playerEl.play();
    }
  }
  _durationDisplay(e) {
    const { duration } = e.srcElement;
    const date = new Date(null);
    date.setSeconds(duration);
    const musicDuration = date.toISOString().substring(14, 19);
    musicDurationEl.textContent = musicDuration;
  }
  _currentTimeDisplay(e) {
    const { currentTime } = e.srcElement;
    const date = new Date(null);
    date.setSeconds(currentTime);
    const musicCurrentTime = date.toISOString().substring(14, 19);
    musicCurrentTimeEl.textContent = musicCurrentTime;
  }
  _playerVolume() {
    playerEl.volume = volumeRangeInputEl.value;
  }
  _increaseVolume() {
    if (volumeRangeInputEl.value === 1) return;
    let numb = Number(volumeRangeInputEl.value);
    numb += 0.1;
    volumeRangeInputEl.value = numb;
    this._playerVolume();
    if (playerEl.volume !== 0) {
      muteButtonEl.classList.remove('fa-volume-mute');
      muteButtonEl.classList.add('fa-volume-up');
    }
  }
  _decreaseVolume() {
    if (volumeRangeInputEl.value === 0) return;
    let numb = Number(volumeRangeInputEl.value);
    numb -= 0.1;
    volumeRangeInputEl.value = numb;
    this._playerVolume();
    if (playerEl.volume === 0) {
      muteButtonEl.classList.remove('fa-volume-up');
      muteButtonEl.classList.add('fa-volume-mute');
    }
  }
  _controlMuteButton() {
    if (playerEl.volume !== 0) {
      volumeRangeInputEl.value = 0;
      this._playerVolume();
      muteButtonEl.classList.remove('fa-volume-up');
      muteButtonEl.classList.add('fa-volume-mute');
    } else {
      volumeRangeInputEl.value = 0.5;
      this._playerVolume();
      muteButtonEl.classList.remove('fa-volume-mute');
      muteButtonEl.classList.add('fa-volume-up');
    }
  }
  //seekbar
  _controlSeekBar(e) {
    playerEl.currentTime = (playerEl.duration / 100) * seekBarInputEl.value;
  }
  _showProgress() {
    const currentPercentage = Math.round(
      (playerEl.currentTime / playerEl.duration) * 100
    );
    seekBarInputEl.value = isNaN(currentPercentage) ? 0 : currentPercentage; //needed isNaN, because of initial value
  }
  _renderPlaylist(data) {
    data.forEach(song => {
      let markup = `<li class="playlist__song" data-id="${song.id}">
      <div class="playlist__song__author">${song.author}</div> <span>-</span>
      <div class="playlist__song__title">${song.title}</div>
    </li>`;
      playlistEl.insertAdjacentHTML('beforeend', markup);
    });
  }

  _playPlaylistSong(e) {
    const clicked = e.target.closest('.playlist__song');
    if (!clicked) return;
    this.#songIndex = clicked.dataset.id;
    this._renderSong();
    this._controlPlayButton();
    // when i click a song a playlist, play automatic always
    if (!playerEl.classList.contains('play')) {
      this._controlPlayButton();
    }
  }
  _activeSong(e) {
    const activeSongUrl = e.srcElement.innerHTML.slice(47, -87);
    const activeSongObject = this.#songs.find(
      element => element.url === activeSongUrl
    );
    const activeSongId = activeSongObject.id;
    const playlistSongs = playlistEl.querySelectorAll('.playlist__song');
    const activePlaylistSongEl = playlistSongs[activeSongId];
    playlistSongs.forEach(element => element.classList.remove('active-song'));
    activePlaylistSongEl.classList.add('active-song');
  }
  _changeColor() {
    const colors = [
      '#f03e3e',
      '#d6336c',
      '#7048e8',
      '#1c7ed6',
      '#1098ad',
      '#0ca678',
      '#37b24d',
      '#74b816',
      '#f59f00',
      '#f76707',
    ];
    const randomColor = colors[Math.trunc(Math.random() * colors.length)];

    rootEl.style.setProperty('--main-color', randomColor);
  }
}

const app = new App();
