// Game variables
let gameSeq = [];
let userSeq = [];
let btns = ["red", "yellow", "green", "blue"];
let started = false;
let level = 0;
let highestScore = localStorage.getItem("highestScore") || 0;
let canClick = false; // Flag to control when user can click buttons
let gameSpeed = 500; // Speed of the game flash sequence (milliseconds)

// DOM elements
const gameStatus = document.getElementById("game-status");
const levelDisplay = document.getElementById("level");
const startBtn = document.getElementById("start-btn");
const btnContainer = document.querySelector(".btn-container");

// Update highest score display
document.querySelector("h1").innerText = `SIMON GAME`;
gameStatus.innerText = `Highest Score: ${highestScore}`;

// Start game with button instead of keypress
startBtn.addEventListener("click", function() {
    if (!started) {
        startGame();
    }
});

function startGame() {
    console.log("Game is started");
    started = true;
    startBtn.disabled = true;
    startBtn.style.opacity = "0.6";
    startBtn.innerText = "PLAYING...";
    levelUp();
}

function gameFlash(btn) {
    return new Promise((resolve) => {
        btn.classList.add("gameflash");
        setTimeout(function () {
            btn.classList.remove("gameflash");
            resolve();
        }, gameSpeed);
    });
}

function userflash(btn) {
    btn.classList.add("userflash");
    setTimeout(function () {
        btn.classList.remove("userflash");
    }, 250);
}

// Play audio for each button
function playSound(color) {
    // Create audio context on first user interaction
    if (!window.audioContext) {
        window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Different frequencies for different buttons
    const frequencies = {
        red: 329.63, // E4
        green: 261.63, // C4
        yellow: 392.00, // G4
        blue: 196.00 // G3
    };
    
    const oscillator = window.audioContext.createOscillator();
    const gainNode = window.audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = frequencies[color];
    oscillator.connect(gainNode);
    gainNode.connect(window.audioContext.destination);
    
    // Fade out the sound
    gainNode.gain.setValueAtTime(0.5, window.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, window.audioContext.currentTime + 0.5);
    
    oscillator.start();
    oscillator.stop(window.audioContext.currentTime + 0.5);
}

// Function to play the entire sequence
async function playSequence() {
    canClick = false; // Disable clicks during sequence playback
    
    // Play each button in sequence with delay
    for (let i = 0; i < gameSeq.length; i++) {
        let color = gameSeq[i];
        let btn = document.querySelector(`.${color}`);
        await new Promise(resolve => setTimeout(resolve, 250)); // Short pause between buttons
        playSound(color);
        await gameFlash(btn);
    }
    
    canClick = true; // Enable clicks after sequence is complete
    gameStatus.innerText = "Your turn!";
}

async function levelUp() {
    userSeq = [];
    level++;
    gameStatus.innerText = `Level ${level}`;
    levelDisplay.innerText = level;
    
    // Add random color to sequence
    let randIdx = Math.floor(Math.random() * 4);
    let randColor = btns[randIdx];
    gameSeq.push(randColor);
    
    // Give a slight pause before playing sequence
    await new Promise(resolve => setTimeout(resolve, 800));
    gameStatus.innerText = "Watch carefully...";
    await playSequence();
}

function checkAns(idx) {
    // If correct button was pressed
    if (userSeq[idx] === gameSeq[idx]) {
        // If completed the current sequence
        if (userSeq.length === gameSeq.length) {
            gameStatus.innerText = "Correct! Next level...";
            setTimeout(levelUp, 1000);
        }
    } else {
        gameOver();
    }
}

function gameOver() {
    playErrorSound();
    
    gameStatus.innerHTML = `Game over! Your score: <b>${level}</b>`;
    startBtn.disabled = false;
    startBtn.style.opacity = "1";
    startBtn.innerText = "PLAY AGAIN";
    
    // Update highest score if current level is higher
    if (level > highestScore) {
        highestScore = level;
        localStorage.setItem("highestScore", highestScore);
        gameStatus.innerHTML = `New High Score! <b>${level}</b>`;
    }
    
    // Flash the game container
    btnContainer.classList.add("game-over");
    setTimeout(() => {
        btnContainer.classList.remove("game-over");
    }, 300);
    
    reset();
}

function playErrorSound() {
    if (!window.audioContext) {
        window.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    const oscillator = window.audioContext.createOscillator();
    const gainNode = window.audioContext.createGain();
    
    oscillator.type = 'square';
    oscillator.frequency.value = 100;
    oscillator.connect(gainNode);
    gainNode.connect(window.audioContext.destination);
    
    gainNode.gain.setValueAtTime(0.3, window.audioContext.currentTime);
    oscillator.start();
    
    setTimeout(() => {
        gainNode.gain.exponentialRampToValueAtTime(0.01, window.audioContext.currentTime + 0.3);
        setTimeout(() => {
            oscillator.stop();
        }, 300);
    }, 300);
}

function btnPress() {
    // Ignore clicks when sequence is playing
    if (!canClick || !started) return;
    
    let btn = this;
    let userColor = btn.getAttribute("id");
    
    playSound(userColor);
    userflash(btn);
    userSeq.push(userColor);
    
    checkAns(userSeq.length - 1);
}

// Add event listeners to buttons
let allbtns = document.querySelectorAll(".btn");
for (let btn of allbtns) {
    btn.addEventListener("click", btnPress);
}

function reset() {
    started = false;
    canClick = false;
    gameSeq = [];
    userSeq = [];
    level = 0;
    levelDisplay.innerText = "0";
}

// Add game-over animation to CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
        20%, 40%, 60%, 80% { transform: translateX(10px); }
    }
    
    .game-over {
        animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        background-color: #E63946 !important;
    }
`;
document.head.appendChild(style);