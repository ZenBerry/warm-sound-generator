function generateRandomSound() {
  // Set up the audio context
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  const audioContext = new AudioContext();

  // Create an oscillator node for the base note
  const baseOscillator = audioContext.createOscillator();
  baseOscillator.frequency.value = 600; // Base frequency of 440Hz
  baseOscillator.type = 'sine'; // Use a sawtooth waveform for the base note

  // Create a waveshaper node for adding warmth and saturation
  const waveshaper = audioContext.createWaveShaper();
  waveshaper.curve = makeWarmCurve(Math.random() * 6500 + 3200); // Random warmth between 200 and 800

  // Create an oscillator node for frequency modulation
  const modOscillator = audioContext.createOscillator();
  modOscillator.frequency.value = Math.random() * 4 + 0.5; // Random modulation frequency between 0.5 and 4 Hz
  modOscillator.type = 'sawtooth'; // Use a sawtooth waveform for the modulation oscillator

  // Create a gain node for controlling the modulation depth
  const modGain = audioContext.createGain();
  modGain.gain.value = Math.random() * 40 + 10; // Random modulation depth between 10 and 50

  // Generate random harmonics
  const harmonics = [];
  const harmonicCount = Math.floor(Math.random() * 20) + 5; // Random number of harmonics between 5 and 24
  for (let i = 1; i <= harmonicCount; i++) {
    const randomDetune = Math.random() * 100 - 50; // Random detune between -50 and +50 Hz
    const randomGain = Math.random() * 0.5 + 0.1; // Random gain between 0.1 and 0.6
    harmonics.push({ frequency: baseOscillator.frequency.value * i + randomDetune, gain: randomGain });
  }

  // Create a low-pass filter node
  const filter = audioContext.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = Math.random() * 1500 + 500; // Random cutoff frequency between 500 and 2000 Hz //nice
  filter.Q.value = 1; // Adjust the resonance to control the filter's characteristics

  // Create an amplitude modulation node
  const modulation = audioContext.createGain();
  modulation.gain.value = Math.random() * 0.004 + 0.001; // Random modulation depth between 0.01 and 0.05

  // Connect the nodes
  baseOscillator.connect(waveshaper);
  waveshaper.connect(filter);
  filter.connect(modulation);
  modulation.connect(audioContext.destination);

  // Connect the modulation oscillator and harmonics to the modulation gain
  modOscillator.connect(modGain);
  modGain.connect(baseOscillator.frequency);

  // Connect the harmonics to the filter
  harmonics.forEach((harmonic) => {
    const gainNode = audioContext.createGain();
    gainNode.gain.value = harmonic.gain;

    const oscillatorNode = audioContext.createOscillator();
    oscillatorNode.frequency.value = harmonic.frequency;
    oscillatorNode.type = 'sine'; // Use a sine waveform for the harmonics

    oscillatorNode.connect(gainNode);
    gainNode.connect(filter);

    const randomAttack = Math.random() * 0.1 + 0.1; // Random attack duration between 0.1 and 0.2 seconds
    const randomRelease = Math.random() * 0.1 + 0.1; // Random release duration between 0.1 and 0.2 seconds

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(harmonic.gain, audioContext.currentTime + randomAttack);
    gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + randomAttack + randomRelease);

    oscillatorNode.start();
    oscillatorNode.stop(audioContext.currentTime + randomAttack + randomRelease + 2); // Stop each harmonic after attack, release, and 2 seconds
  });

  // Start the base oscillator, modulation oscillator, and harmonics
  baseOscillator.start();
  modOscillator.start();

  // Stop the oscillators after a certain duration (e.g., 10 seconds)
  const duration = 1000; // Duration in milliseconds
  setTimeout(() => {
    baseOscillator.stop();
    modOscillator.stop();
  }, duration);
}

// Helper function to create a warm curve for waveshaping
function makeWarmCurve(amount) {
  const curve = new Float32Array(65536);
  const k = (2 * amount) / (1 - amount);

  for (let i = 0; i < 65536; ++i) {
    const x = (i - 32768) / 32768;
    curve[i] = (1 + k) * x / (1 + k * Math.abs(x));
  }

  return curve;
}

// Call the function to generate a random sound
generateRandomSound();

const generateButton = document.getElementById('generateButton');

// Attach an event listener to the button for the 'click' event
generateButton.addEventListener('click', generateRandomSound);
