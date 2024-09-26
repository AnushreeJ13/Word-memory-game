let numPlayers;
let players = [];
let currentPlayerIndex = 0;
let round = 1;
let currentWords = [];
let timeLimit = 10;
let timer;
let categories = [];
let isGameActive = false;
let lastWord = "";
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
}

function addCategory() {
    const category = document.getElementById('newCategory').value.trim();
    if (category) {
        categories.push(category);
        document.getElementById('newCategory').value = "";
        updateCategoryList();
        document.getElementById('startGameButton').style.display = 'inline';
    }
}

function updateCategoryList() {
    const categoryListDiv = document.getElementById('categoryList');
    categoryListDiv.innerHTML = '';
    categories.forEach((category) => {
        const categoryItem = document.createElement('div');
        categoryItem.textContent = category;
        categoryItem.onclick = () => {
            selectedCategory = category; // Store selected category
            categoryListDiv.querySelectorAll('div').forEach(item => item.style.backgroundColor = '#3F8A3F'); // Reset styles
            categoryItem.style.backgroundColor = '#FFD700'; // Highlight selected category
        };
        categoryListDiv.appendChild(categoryItem);
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
    timeLimit = 10; // Reset time limit to 10 seconds
    isGameActive = true;
    lastWord = "";
    document.getElementById('timer').style.display = 'none';
    document.getElementById('status').textContent = "";
    document.getElementById('restartButton').style.display = 'none';
    document.getElementById('playerBoxes').innerHTML = ''; // Clear player boxes
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
    displayDiv.textContent = `Last Word: ${lastWord}`;
    document.getElementById('timer').style.display = 'block';
    document.getElementById('timeLeft').textContent = timeLimit;
    startTimer();
}

function startTimer() {
    clearInterval(timer);
    timer = setInterval(() => {
        timeLimit--;
        document.getElementById('timeLeft').textContent = timeLimit;
        if (timeLimit <= 0) {
            clearInterval(timer);
            handleTimeout();
        }
    }, 1000);
}

function handleTimeout() {
    const currentPlayer = players[currentPlayerIndex];
    document.getElementById('status').textContent = `${currentPlayer} timed out!`;
    eliminatePlayer(currentPlayer);
}

function highlightCurrentPlayer() {
    const playerBoxes = document.getElementById('playerBoxes');
    playerBoxes.innerHTML = '';
    players.forEach((player, index) => {
        const playerBox = document.createElement('div');
        playerBox.className = 'player-box' + (index === currentPlayerIndex ? ' highlight' : '');
        playerBox.textContent = player;
        playerBoxes.appendChild(playerBox);
    });
}

function displayInitialInput() {
    const inputFields = document.getElementById('inputFields');
    inputFields.innerHTML = '';
    const inputField = document.createElement('input');
    inputField.placeholder = "Enter a word...";
    inputField.onkeypress = (e) => {
        if (e.key === 'Enter') {
            handleWordInput(inputField.value);
            inputField.value = ""; // Clear input after submission
        }
    };
    inputFields.appendChild(inputField);
}

function handleWordInput(word) {
    if (!isGameActive) return;

    const currentPlayer = players[currentPlayerIndex];

    // Validate word
    if (word === "" || (round > 1 && !isWordValid(word))) {
        document.getElementById('status').textContent = `${currentPlayer} entered an invalid word!`;
        eliminatePlayer(currentPlayer);
    } else {
        lastWord = word;
        currentWords.push(word);
        document.getElementById('status').textContent = `${currentPlayer} entered: ${word}`;
        currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
        round++;
        timeLimit = 10; // Reset time limit to 10 seconds after each valid input
        highlightCurrentPlayer();
        startRound();
    }
}

function isWordValid(word) {
    // Check if the word is unique
    return !currentWords.includes(word);
}

function eliminatePlayer(player) {
    players = players.filter(p => p !== player);
    if (players.length === 1) {
        endGame(players[0]); // Pass the remaining player directly
    } else {
        if (currentPlayerIndex >= players.length) {
            currentPlayerIndex = 0; // Reset to the first player
        }
        highlightCurrentPlayer();
        if (currentWords.length > 0) {
            lastWord = currentWords[currentWords.length - 1]; // Reset last word to the last valid entry
        }
    }
}

function endGame(winner) {
    clearInterval(timer); // Stop the timer
    const winnerText = document.getElementById('winner');
    winnerText.innerHTML = `${winner} wins!`; // Display the winner's name
    winnerText.style.display = 'block'; // Show winner text
    winnerText.style.animation = 'fadeIn 1s'; // Trigger fade-in animation
    
    document.getElementById('restartButton').style.display = 'block'; // Show the restart button
}

function restartGame() {
    resetGame();
    categories = [];
    selectedCategory = "";
    document.getElementById('categoryList').innerHTML = ''; // Clear category list
    document.getElementById('game').style.display = 'none';
    document.getElementById('playerSelection').style.display = 'block';
    document.getElementById('roundDisplay').style.display = 'none';
    document.getElementById('status').textContent = ""; // Clear status message
    document.getElementById('winner').style.display = 'none'; // Hide winner message
}

function startRecognition() {
    // Stop background music when starting speech recognition
    backgroundMusic.pause();

    // Check if SpeechRecognition is supported
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
        alert("Speech recognition not supported in this browser.");
        return;
    }

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.lang = 'en-US'; // Set the language for recognition
    recognition.interimResults = false; // Show final results only
    recognition.maxAlternatives = 1; // Show one alternative

    // Start recognition
    recognition.start();

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript.trim();
        handleWordInput(transcript); // Process the recognized word
        showTextInput(false); // Hide text input if speech was successful
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        document.getElementById('status').textContent = "Could not recognize the word. Please enter it manually.";
        showTextInput(true); // Show text input for manual entry
    };

    recognition.onend = () => {
        // Automatically restart recognition if the game is still active
        if (isGameActive) {
            startRecognition();
        }
    };
}

function showTextInput() {
    const inputField = document.getElementById('inputFields');
    inputField.innerHTML = ''; // Clear previous input field

    // Create and display the text input field
    const textInput = document.createElement('input');
    textInput.placeholder = "Enter a word...";
    textInput.onkeypress = (e) => {
        if (e.key === 'Enter') {
            handleWordInput(textInput.value);
            textInput.value = ""; // Clear input after submission
            inputField.style.display = 'none'; // Hide text input after submission
        }
    };

    // Focus the input when clicked
    textInput.onclick = () => {
        textInput.focus(); // Focus the input when clicked
    };

    inputField.appendChild(textInput);
    inputField.style.display = 'block'; // Show text input
    textInput.focus(); // Automatically focus on the input field
}
