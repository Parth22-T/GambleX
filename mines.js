// mines.js - Handles mines game logic
let gameActive = false;
let betAmount = 10;
let minesCount = 3;
let revealedCount = 0;
let currentMultiplier = 1.0;
let minePositions = [];
let gridSize = 25; // 5x5 grid
let betPlaced = false; // Track if a bet has been placed for the current game

// User data functions for local history display only
function getUserKey() {
    const user = JSON.parse(localStorage.getItem('gx_user'));
    return user && user.username ? `gx_data_${user.username}` : null;
}

function getUserData() {
    const key = getUserKey();
    if (!key) return null;
    return JSON.parse(localStorage.getItem(key)) || { bets: [] };
}

function setUserData(data) {
    const key = getUserKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(data));
}

function updateBalanceDisplay() {
    // Use the standardized balance update function
    GameUtils.updateBalanceDisplay().catch(error => {
        console.error('Error updating balance in mines game:', error);
        // No fallback needed as we're using server data exclusively
    });
}

function updateBetHistory() {
    const data = getUserData();
    const tbody = document.querySelector('#bet-history-table tbody');
    tbody.innerHTML = '';
    
    if (data && data.bets && data.bets.length) {
        // Filter only mines bets and show most recent first
        const minesBets = data.bets
            .filter(bet => bet.game === 'mines')
            .slice()
            .reverse()
            .slice(0, 10); // Show only last 10 bets
            
        if (minesBets.length) {
            minesBets.forEach(bet => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${bet.time}</td>
                    <td>${bet.amount} INR</td>
                    <td>${bet.mines}</td>
                    <td>${bet.gemsFound}</td>
                    <td>${bet.multiplier}x</td>
                    <td>${bet.outcome}</td>
                `;
                tbody.appendChild(tr);
            });
            return;
        }
    }
    
    // If no bets or filtered bets
    tbody.innerHTML = '<tr><td colspan="6">No bet history yet.</td></tr>';
}

// Mines game functions
function createMinesGrid() {
    const grid = document.querySelector('.mines-grid');
    grid.innerHTML = '';
    
    for (let i = 0; i < gridSize; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.index = i;
        tile.addEventListener('click', () => revealTile(i));
        grid.appendChild(tile);
    }
}

async function startGame() {
    if (gameActive) return;
    
    betAmount = parseInt(document.getElementById('bet-amount').value);
    if (isNaN(betAmount) || betAmount < 10) {
        alert('Minimum bet is 10 INR');
        return;
    }
    
    minesCount = parseInt(document.getElementById('mines-count').value);
    
    // Check if user is logged in
    const token = localStorage.getItem('gx_token');
    if (!token) {
        alert('Please log in to play Mines');
        window.location.href = 'login.html';
        return;
    }
    
    // Place bet using standardized function
    const betResult = await GameUtils.placeBet({
        game: 'mines',
        amount: betAmount
    });
    
    if (!betResult.success) {
        alert('Error placing bet: ' + betResult.error);
        return;
    }
    
    // Store transaction ID for linking with bet later
    const betTransactionID = betResult.transactionID;
    window.currentBetTransactionID = betTransactionID;
    
    // Reset game state
    gameActive = true;
    betPlaced = true;
    revealedCount = 0;
    currentMultiplier = 1.0;
    
    // Generate mine positions
    minePositions = [];
    while (minePositions.length < minesCount) {
        const pos = Math.floor(Math.random() * gridSize);
        if (!minePositions.includes(pos)) {
            minePositions.push(pos);
        }
    }
    
    // Reset grid
    document.querySelectorAll('.tile').forEach(tile => {
        tile.className = 'tile';
        tile.textContent = '';
    });
    
    // Update UI
    document.getElementById('start-btn').disabled = true;
    document.getElementById('cashout-btn').disabled = false;
    document.getElementById('result-message').textContent = 'Game started! Click on tiles to reveal gems. Avoid mines!';
    document.getElementById('current-multiplier').textContent = '1.00x';
    document.getElementById('potential-win').textContent = `${betAmount} INR`;
}

function revealTile(index) {
    if (!gameActive) return;
    
    const tile = document.querySelector(`.tile[data-index="${index}"]`);
    if (tile.classList.contains('revealed')) return;
    
    // Check if it's a mine
    if (minePositions.includes(index)) {
        // Hit a mine - game over
        tile.classList.add('revealed', 'mine');
        tile.textContent = '💣';
        endGame(false);
    } else {
        // Found a gem
        tile.classList.add('revealed', 'gem');
        tile.textContent = '💎';
        revealedCount++;
        
        // Update multiplier based on mines count and revealed tiles
        updateMultiplier();
        
        // Check if all non-mine tiles are revealed (win condition)
        if (revealedCount >= gridSize - minesCount) {
            endGame(true);
        }
    }
}

function updateMultiplier() {
    // Calculate new multiplier based on revealed tiles and mines count
    // This is a simplified formula - real mines games use more complex formulas
    const safeSquares = gridSize - minesCount;
    const remainingSafeSquares = safeSquares - revealedCount;
    
    // Base multiplier increases as more tiles are revealed
    currentMultiplier = (1 - (remainingSafeSquares / safeSquares)) * (minesCount * 1.5) + 1;
    
    // Ensure multiplier is at least 1.0
    currentMultiplier = Math.max(1.0, currentMultiplier);
    
    // Update UI
    document.getElementById('current-multiplier').textContent = currentMultiplier.toFixed(2) + 'x';
    document.getElementById('potential-win').textContent = `${Math.floor(betAmount * currentMultiplier)} INR`;
}

async function cashout() {
    if (!gameActive || !betPlaced) return;
    
    // Calculate winnings
    const winAmount = Math.floor(betAmount * currentMultiplier);
    
    // Create a bet object for the database
    const betData = {
        game: 'mines',
        amount: betAmount,
        mines: minesCount,
        gemsFound: revealedCount,
        multiplier: parseFloat(currentMultiplier.toFixed(2)),
        outcome: `Won ${winAmount} INR`,
        status: 'Won',
        winAmount: winAmount
    };
    
    // Record bet using standardized function, passing the transaction ID
    const betResult = await GameUtils.recordBet(betData, window.currentBetTransactionID);
    
    if (!betResult.success) {
        console.error('Error recording bet:', betResult.error);
    }
    
    // Clear the transaction ID after use
    window.currentBetTransactionID = null;
    
    // Get user data for local history
    const userData = getUserData();
    
    // Record bet in local storage for history display only
    if (!userData.bets) userData.bets = [];
    userData.bets.push({
        game: 'mines',
        time: new Date().toLocaleString(),
        amount: betAmount,
        mines: minesCount,
        gemsFound: revealedCount,
        multiplier: currentMultiplier.toFixed(2),
        outcome: `Won ${winAmount} INR`
    });
    
    // Save user data
    setUserData(userData);
    
    // Update displays
    updateBalanceDisplay();
    updateBetHistory();
    
    // Show result
    document.getElementById('result-message').textContent = `Cashed out! You won ${winAmount} INR!`;
    document.getElementById('result-message').style.color = '#4CAF50';
    
    // Reset game state
    gameActive = false;
    betPlaced = false;
    document.getElementById('start-btn').disabled = false;
    document.getElementById('cashout-btn').disabled = true;
    
    // Reveal all mines
    revealAllMines();
}

async function endGame(win) {
    gameActive = false;
    document.getElementById('start-btn').disabled = false;
    document.getElementById('cashout-btn').disabled = true;
    
    // Reveal all mines
    revealAllMines();
    
    // Only process if a bet was placed
    if (!betPlaced) return;
    
    if (win) {
        // Calculate winnings
        const winAmount = Math.floor(betAmount * currentMultiplier);
        
        // Prepare bet data for backend
        const minesBetData = {
            game: 'mines',
            amount: betAmount,
            mines: minesCount,
            gemsFound: revealedCount,
            multiplier: parseFloat(currentMultiplier.toFixed(2)),
            outcome: `Won ${winAmount} INR`,
            status: 'Won',
            winAmount: winAmount
        };
        
        // Record bet using standardized function, passing the transaction ID
        const betResult = await GameUtils.recordBet(minesBetData, window.currentBetTransactionID);
        
        if (!betResult.success) {
            console.error('Error recording win bet:', betResult.error);
        }
        
        // Clear the transaction ID after use
        window.currentBetTransactionID = null;
        
        // Get user data for local history
        const userData = getUserData();
        
        // Record win in local storage for display only
        if (!userData.bets) userData.bets = [];
        userData.bets.push({
            game: 'mines',
            time: new Date().toLocaleString(),
            amount: betAmount,
            mines: minesCount,
            gemsFound: revealedCount,
            multiplier: currentMultiplier.toFixed(2),
            outcome: `Won ${winAmount} INR`
        });
        setUserData(userData);
        
        // Show result
        document.getElementById('result-message').textContent = `You found all gems! You won ${winAmount} INR!`;
        document.getElementById('result-message').style.color = '#4CAF50';
    } else {
        // Prepare bet data for backend
        const minesBetData = {
            game: 'mines',
            amount: betAmount,
            mines: minesCount,
            gemsFound: revealedCount,
            multiplier: 0,
            outcome: 'Lost',
            status: 'Lost',
            winAmount: 0
        };
        
        // Record bet using standardized function, passing the transaction ID
        const betResult = await GameUtils.recordBet(minesBetData, window.currentBetTransactionID);
        
        if (!betResult.success) {
            console.error('Error recording loss bet:', betResult.error);
        }
        
        // Clear the transaction ID after use
        window.currentBetTransactionID = null;
        
        // Get user data for local history
        const userData = getUserData();
        
        // Record loss in local storage for display only
        if (!userData.bets) userData.bets = [];
        userData.bets.push({
            game: 'mines',
            time: new Date().toLocaleString(),
            amount: betAmount,
            mines: minesCount,
            gemsFound: revealedCount,
            multiplier: '0.00',
            outcome: 'Lost'
        });
        
        // Show result
        document.getElementById('result-message').textContent = 'Boom! You hit a mine. Better luck next time!';
        document.getElementById('result-message').style.color = '#F44336';
    }
    
    // Reset bet placed flag
    betPlaced = false;
    
    // Save user data
    setUserData(userData);
    
    // Update displays
    updateBalanceDisplay();
    updateBetHistory();
}

function revealAllMines() {
    minePositions.forEach(index => {
        const tile = document.querySelector(`.tile[data-index="${index}"]`);
        if (!tile.classList.contains('revealed')) {
            tile.classList.add('revealed', 'mine');
            tile.textContent = '💣';
        }
    });
}

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('gx_user'));
    if (!user || !user.loggedIn) {
        alert('Please log in to play Mines');
        window.location.href = 'login.html';
        return;
    }
    
    // Create mines grid
    createMinesGrid();
    
    // Update balance and bet history
    updateBalanceDisplay();
    updateBetHistory();
    
    // Set up bet amount input
    document.getElementById('bet-amount').addEventListener('input', function() {
        betAmount = parseInt(this.value);
    });
    
    // Set up mines count select
    document.getElementById('mines-count').addEventListener('change', function() {
        minesCount = parseInt(this.value);
    });
    
    // Set up start button
    document.getElementById('start-btn').addEventListener('click', startGame);
    
    // Set up cashout button
    document.getElementById('cashout-btn').addEventListener('click', cashout);
});
