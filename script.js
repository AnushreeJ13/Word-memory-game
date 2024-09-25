let numPlayers;
let players = [];
let currentPlayerIndex = 0;
let round = 1;
let currentWords = [];
let timeLimit = 10;
let timer;
let categories = [];
let isGameActive = false;
let backgroundMusic = document.getElementById('backgroundMusic');

// Start background music
backgroundMusic.play();

// Show the initial game name screen
function showInitialScreen() {
    document.getElementById('initialScreen').style.display = 'flex';
    setTimeout(() => {
        document.getElementById('initialScreen').style.display = 'none';
        document.getElementById('playerSelection').style.display = 'block';
    }, 3000); // Show for 3 seconds before transitioning
}

// Call the initial screen display function on load
window.onload = showInitialScreen;

function setPlayerCount() {
    numPlayers = parseInt(document.getElementById('numPlayers').value);
    if (numPlayers < 2 || numPlayers > 4) {
        alert("Please enter a valid number of players (2-4).");
        return;
    }
    players = Array.from({ length: numPlayers }, (_, i) => `Player ${i + 1}`);
    document.getElementById('playerSelection').style.display = 'none';
    document.getElementById('categorySelection').style.display = 'block';
    document.getElementById('startGameButton').style.display = 'inline';
}

function addCategory() {
    const category = document.getElementById('newCategory').value.trim();
    if (category) {
        categories.push(category);
        document.getElementById('newCategory').value = "";
        updateCategoryList();
    }
}

function updateCategoryList() {
    const categoryList = document.getElementById('categoryList');
    categoryList.innerHTML = "";
    categories.forEach(cat => {
        const li = document.createElement('li');
        li.textContent = cat;
        categoryList.appendChild(li);
    });
}

function startGame() {
    if (categories.length === 0) {
        alert("Please add at least one category.");
        return;
    }
    resetGame();
    document.getElementById('categorySelection').style.display = 'none';
    document.getElementById('game').style.display = 'block';
    document.getElementById('roundDisplay').style.display = 'block';
    document.getElementById('roundNumber').textContent = round;
    highlightCurrentPlayer();
    startRound();
}

function resetGame() {
    currentPlayerIndex = 0;
    round = 1;
    currentWords = [];
    timeLimit = 10;
    isGameActive = true;
    document.getElementById('timer').style.display = 'none';
    document.getElementById('status').textContent = "";
    document.getElementById('restartButton').style.display = 'none';
}

function startRound() {
    if (round > 1) {
        displayChainForRound();
    } else {
        displayInitialInput();
    }
}

function displayChainForRound() {
    const displayDiv = document.getElementById('lastWordDisplay');
    displayDiv.textContent = currentWords.join(", ");
    displayDiv.style.display = "block";
    setTimeout(() => {
        displayDiv.style.display = "none";
        startTimer();
    }, 3000); // Display chain for 3 seconds
}

function startTimer() {
    const timeLeftDisplay = document.getElementById('timeLeft');
    timeLeftDisplay.textContent = timeLimit;
    document.getElementById('timer').style.display = 'block';
    
    timer = setInterval(() => {
        if (timeLimit > 0) {
            timeLimit--;
            timeLeftDisplay.textContent = timeLimit;
        } else {
            clearInterval(timer);
            handleElimination(`Player ${currentPlayerIndex + 1} ran out of time!`);
        }
    }, 1000);
}

function handleElimination(message) {
    alert(message);
    players.splice(currentPlayerIndex, 1);
    if (players.length === 1) {
        alert(`${players[0]} is the winner!`);
        document.getElementById('restartButton').style.display = 'block';
        isGameActive = false;
    } else {
        currentPlayerIndex = currentPlayerIndex % players.length; // Adjust current index
        highlightCurrentPlayer();
        startRound();
    }
}

function displayInitialInput() {
    const inputDiv = document.getElementById('inputFields');
    inputDiv.innerHTML = "";

    // Create input field for word entry
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.placeholder = 'Enter your word';
    
    // Create submit button
    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.onclick = () => {
        handleWordInput(inputField.value);
        inputField.value = ""; // Clear the input
    };
    
    inputDiv.appendChild(inputField);
    inputDiv.appendChild(submitButton);
    inputField.focus();
}

function handleWordInput(word) {
    if (word.trim() === "") return;

    // Check if unique and valid
    if (!currentWords.includes(word) && isGameActive) {
        currentWords.push(word);
        if (currentPlayerIndex === 0) { // First player can enter one word only
            lastWord = word;
        } else { // Subsequent players must enter previous words + new word
            const previousWords = currentWords.slice(0, currentPlayerIndex).join(", ");
            if (!word.startsWith(previousWords)) {
                return handleElimination(`${players[currentPlayerIndex]} entered an invalid word!`);
            }
            lastWord = word;
        }

        // Display the chain and handle timer
        if (currentPlayerIndex < players.length - 1) {
            currentPlayerIndex++;
            displayInitialInput(); // Next player's turn
        } else {
            round++;
            document.getElementById('roundNumber').textContent = round;
            currentPlayerIndex = 0;
            startRound();
        }
    } else {
        handleElimination(`${players[currentPlayerIndex]} entered a duplicate word!`);
    }
}

function highlightCurrentPlayer() {
    const playerBoxes = document.getElementById('playerBoxes');
    playerBoxes.innerHTML = "";
    players.forEach((player, index) => {
        const playerBox = document.createElement('div');
        playerBox.className = 'player-box';
        playerBox.textContent = player;
        if (index === currentPlayerIndex) {
            playerBox.style.backgroundColor = '#FFD700'; // Highlight current player
        }
        playerBoxes.appendChild(playerBox);
    });
}

function restartGame() {
    resetGame();
    categories = []; // Clear categories
    document.getElementById('categoryList').innerHTML = "";
    document.getElementById('categorySelection').style.display = 'block';
    document.getElementById('startGameButton').style.display = 'none';
    document.getElementById('roundDisplay').style.display = 'none';
    document.getElementById('game').style.display = 'none';
    document.getElementById('initialScreen').style.display = 'flex'; // Show initial screen again
    showInitialScreen(); // Show the game name again
}

function startRecognition() {
    // Add your speech recognition implementation here
    // Stop background music when speech recognition starts
    backgroundMusic.pause();

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();

    recognition.onresult = (event) => {
        const spokenWord = event.results[0][0].transcript;
        handleWordInput(spokenWord);
    };

    recognition.onspeechend = () => {
        recognition.stop();
        // Resume background music when speech recognition ends
        backgroundMusic.play();
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error detected: ' + event.error);
        // Resume background music on error
        backgroundMusic.play();
    };
}
