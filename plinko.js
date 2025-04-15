// plinko.js - Handles plinko game logic
let dropping = false;
let betAmount = 10;
let riskLevel = 'medium';
let numBalls = 1;
let currentBall = 0;
let totalWin = 0;
let betPlaced = false; // Track if a bet has been placed
let betTransactionID = null; // Store transaction ID for linking with bet

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
        console.error('Error updating balance in plinko game:', error);
        // No fallback needed as we're using server data exclusively
    });
}

function updateBetHistory() {
    const data = getUserData();
    const tbody = document.querySelector('#bet-history-table tbody');
    tbody.innerHTML = '';
    
    if (data && data.bets && data.bets.length) {
        // Filter only plinko bets and show most recent first
        const plinkoBets = data.bets
            .filter(bet => bet.game === 'plinko')
            .slice()
            .reverse()
            .slice(0, 10); // Show only last 10 bets
            
        if (plinkoBets.length) {
            plinkoBets.forEach(bet => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${bet.time}</td>
                    <td>${bet.amount} INR</td>
                    <td>${bet.riskLevel}</td>
                    <td>${bet.balls}</td>
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

// Plinko game functions
function createPlinkoBoard() {
    const pinsContainer = document.querySelector('.plinko-pins');
    pinsContainer.innerHTML = '';
    
    // Create pins in a triangular pattern
    const rows = 10;
    const spacing = 50;
    const startX = 300; // Center of the board
    
    for (let row = 0; row < rows; row++) {
        const y = 50 + row * spacing;
        const pinsInRow = row + 1;
        const rowWidth = pinsInRow * spacing;
        const startRowX = startX - rowWidth / 2 + spacing / 2;
        
        for (let i = 0; i < pinsInRow; i++) {
            const x = startRowX + i * spacing;
            const pin = document.createElement('div');
            pin.className = 'pin';
            pin.style.left = `${x}px`;
            pin.style.top = `${y}px`;
            pinsContainer.appendChild(pin);
        }
    }
}

async function dropBall() {
    if (dropping) return;
    
    betAmount = parseInt(document.getElementById('bet-amount').value);
    if (isNaN(betAmount) || betAmount < 10) {
        alert('Minimum bet is 10 INR');
        return;
    }
    
    riskLevel = document.getElementById('risk-level').value;
    numBalls = parseInt(document.getElementById('num-balls').value);
    
    // Check if user is logged in
    const token = localStorage.getItem('gx_token');
    if (!token) {
        alert('Please log in to play Plinko');
        window.location.href = 'login.html';
        return;
    }
    
    const totalBet = betAmount * numBalls;
    
    // Place bet using standardized function
    const betResult = await GameUtils.placeBet({
        game: 'plinko',
        amount: totalBet,
        details: `Bet on Plinko: ${numBalls} ball(s), ${riskLevel} risk`
    });
    
    if (!betResult.success) {
        alert('Error placing bet: ' + betResult.error);
        return;
    }
    
    // Store transaction ID for linking with bet later
    betTransactionID = betResult.transactionID;
    betPlaced = true;
    
    dropping = true;
    currentBall = 0;
    totalWin = 0;
    document.getElementById('drop-btn').disabled = true;
    document.getElementById('result-message').textContent = 'Dropping balls...';
    
    // Clear any existing balls
    document.querySelector('.plinko-balls').innerHTML = '';
    
    // Start dropping balls one by one
    dropNextBall();
}

function dropNextBall() {
    if (currentBall >= numBalls) {
        // All balls dropped
        finishDrop();
        return;
    }
    
    currentBall++;
    
    // Create a new ball
    const ballsContainer = document.querySelector('.plinko-balls');
    const ball = document.createElement('div');
    ball.className = 'ball';
    
    // Random starting position at the top
    const startX = 300 + (Math.random() * 60 - 30); // Slight randomness in starting position
    ball.style.left = `${startX}px`;
    ball.style.top = '10px';
    ballsContainer.appendChild(ball);
    
    // Simulate ball physics
    simulateBallPath(ball, startX);
}

function simulateBallPath(ball, startX) {
    let x = startX;
    let y = 10;
    let vy = 2; // Vertical velocity
    const gravity = 0.2;
    let bounces = 0;
    const maxBounces = 15; // Approximately the number of rows + extra bounces
    
    // Adjust ball path based on risk level
    let pathBias;
    switch (riskLevel) {
        case 'low':
            pathBias = 0.2; // More likely to go to center (lower multipliers)
            break;
        case 'high':
            pathBias = 0.8; // More likely to go to edges (higher multipliers)
            break;
        default: // medium
            pathBias = 0.5; // Balanced
    }
    
    const moveBall = () => {
        // Update position
        y += vy;
        vy += gravity;
        
        // Check for pin collisions
        if (y > 50 && bounces < maxBounces) {
            // Simulate pin bounce with bias
            if (Math.random() < 0.2) { // Only bounce sometimes for more natural movement
                const goRight = Math.random() < pathBias;
                x += goRight ? 25 : -25;
                bounces++;
            }
        }
        
        // Update ball position
        ball.style.left = `${x}px`;
        ball.style.top = `${y}px`;
        
        // Check if ball reached bottom
        if (y > 480) {
            // Determine which bucket the ball landed in
            const bucketWidth = 600 / 9; // 9 buckets
            const bucketIndex = Math.min(Math.floor(x / bucketWidth), 8);
            const bucket = document.querySelectorAll('.bucket')[bucketIndex];
            
            // Get multiplier
            const multiplier = parseFloat(bucket.dataset.multiplier);
            
            // Highlight the bucket
            bucket.classList.add('win');
            setTimeout(() => bucket.classList.remove('win'), 1000);
            
            // Calculate win
            const win = betAmount * multiplier;
            totalWin += win;
            
            // Update user data
            const userData = getUserData();
            userData.balance += win;
            setUserData(userData);
            updateBalanceDisplay();
            
            // Remove ball after a delay
            setTimeout(() => {
                ball.remove();
                dropNextBall(); // Drop next ball
            }, 1000);
            
            return; // Stop animation
        }
        
        // Continue animation
        requestAnimationFrame(moveBall);
    };
    
    // Start animation
    requestAnimationFrame(moveBall);
}

async function finishDrop() {
    dropping = false;
    document.getElementById('drop-btn').disabled = false;
    
    // Only process if a bet was placed
    if (!betPlaced) return;
    
    // Prepare bet data for backend
    const plinkoBetData = {
        game: 'plinko',
        amount: betAmount * numBalls,
        riskLevel: riskLevel,
        balls: numBalls,
        multiplier: parseFloat((totalWin / (betAmount * numBalls)).toFixed(2)),
        outcome: `Won ${totalWin} INR`,
        status: totalWin > 0 ? 'Won' : 'Lost',
        winAmount: totalWin
    };
    
    // Record bet using standardized function, passing the transaction ID
    const betResult = await GameUtils.recordBet(plinkoBetData, betTransactionID);
    
    if (!betResult.success) {
        console.error('Error recording plinko bet:', betResult.error);
    }
    
    // Reset bet tracking
    betPlaced = false;
    betTransactionID = null;
    
    // Record bet in local storage for display only
    const userData = getUserData();
    if (!userData.bets) userData.bets = [];
    userData.bets.push({
        game: 'plinko',
        time: new Date().toLocaleString(),
        amount: betAmount * numBalls,
        riskLevel: riskLevel,
        balls: numBalls,
        multiplier: (totalWin / (betAmount * numBalls)).toFixed(2),
        outcome: `Won ${totalWin} INR`
    });
    setUserData(userData);
    updateBetHistory();
    
    // Update balance display
    updateBalanceDisplay();
    
    // Show result
    document.getElementById('result-message').textContent = 
        `Dropped ${numBalls} ball${numBalls > 1 ? 's' : ''} and won ${totalWin} INR!`;
}

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('gx_user'));
    if (!user || !user.loggedIn) {
        alert('Please log in to play Plinko');
        window.location.href = 'login.html';
        return;
    }
    
    // Create plinko board
    createPlinkoBoard();
    
    // Update balance and bet history
    updateBalanceDisplay();
    updateBetHistory();
    
    // Set up bet amount input
    document.getElementById('bet-amount').addEventListener('input', function() {
        betAmount = parseInt(this.value);
    });
    
    // Set up risk level select
    document.getElementById('risk-level').addEventListener('change', function() {
        riskLevel = this.value;
    });
    
    // Set up number of balls select
    document.getElementById('num-balls').addEventListener('change', function() {
        numBalls = parseInt(this.value);
    });
    
    // Set up drop button
    document.getElementById('drop-btn').addEventListener('click', dropBall);
});
