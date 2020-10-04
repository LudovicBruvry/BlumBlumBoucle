let song;

function preload() {
    song = loadSound('./Assets/Music/menu.mp3');
    getAudioContext().resume();
}

function touchStarted() {
  getAudioContext().resume();
}

function setup() {
  createCanvas(0, 0);
  getAudioContext().resume(); 
  song.setVolume(0.4);
  song.loop();
}
