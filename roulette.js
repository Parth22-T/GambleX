// roulette.js - Handles roulette game logic
let selectedBet = null;
let betAmount = 10;
let spinning = false;
let currentBet = null;
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
        console.error('Error updating balance in roulette game:', error);
        // No fallback needed as we're using server data exclusively
    });
}

function updateBetHistory() {
    const data = getUserData();
    const tbody = document.querySelector('#bet-history-table tbody');
    tbody.innerHTML = '';
    
    if (data && data.bets && data.bets.length) {
        // Filter only roulette bets and show most recent first
        const rouletteBets = data.bets
            .filter(bet => bet.game === 'roulette')
            .slice()
            .reverse()
            .slice(0, 10); // Show only last 10 bets
            
        if (rouletteBets.length) {
            rouletteBets.forEach(bet => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${bet.time}</td>
                    <td>${bet.betOn}</td>
                    <td>${bet.amount} INR</td>
                    <td>${bet.result}</td>
                    <td>${bet.outcome}</td>
                `;
                tbody.appendChild(tr);
            });
            return;
        }
    }
    
    // If no bets or filtered bets
    tbody.innerHTML = '<tr><td colspan="5">No bet history yet.</td></tr>';
}

// Roulette game functions
function selectBet(element, type) {
    // Clear previous selections
    document.querySelectorAll('.number.selected, .special.selected').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Select new bet
    element.classList.add('selected');
    
    if (type === 'number') {
        selectedBet = {
            type: 'number',
            value: parseInt(element.dataset.number)
        };
        document.getElementById('selected-number').textContent = `Number ${selectedBet.value}`;
    } else {
        selectedBet = {
            type: 'special',
            value: element.dataset.bet
        };
        document.getElementById('selected-number').textContent = selectedBet.value.toUpperCase();
    }
    
    // Enable place bet button
    document.getElementById('place-bet-btn').disabled = false;
}

async function placeBet() {
    if (!selectedBet) return;
    
    betAmount = parseInt(document.getElementById('bet-amount').value);
    if (isNaN(betAmount) || betAmount < 10) {
        alert('Minimum bet is 10 INR');
        return;
    }
    
    // Check if user is logged in
    const token = localStorage.getItem('gx_token');
    if (!token) {
        alert('Please log in to place bets');
        window.location.href = 'login.html';
        return;
    }
    
    // Place bet using standardized function
    const betResult = await GameUtils.placeBet({
        game: 'roulette',
        amount: betAmount
    });
    
    if (!betResult.success) {
        alert('Error placing bet: ' + betResult.error);
        return;
    }
    
    // Store current bet
    currentBet = {
        type: selectedBet.type,
        value: selectedBet.value,
        amount: betAmount
    };
    
    // Set bet placed flag
    betPlaced = true;
    
    // Disable bet controls and enable spin
    document.getElementById('place-bet-btn').disabled = true;
    document.getElementById('bet-amount').disabled = true;
    document.getElementById('spin-btn').disabled = false;
    
    // Disable clicking on numbers/specials during active bet
    document.querySelectorAll('.number, .special').forEach(el => {
        el.style.pointerEvents = 'none';
    });
}

async function spin() {
    if (spinning || !currentBet || !betPlaced) return;
    
    spinning = true;
    document.getElementById('spin-btn').disabled = true;
    
    // Animate wheel and ball
    const wheel = document.querySelector('.wheel-inner');
    const ball = document.getElementById('ball');
    
    // Random result (0-36)
    const result = Math.floor(Math.random() * 37);
    
    // Determine if the bet wins
    let win = false;
    let payout = 0;
    
    if (currentBet.type === 'number' && currentBet.value === result) {
        // Straight up bet pays 35:1
        win = true;
        payout = currentBet.amount * 35;
    } else if (currentBet.type === 'special') {
        if (currentBet.value === 'red' && isRed(result)) {
            // Red pays 1:1
            win = true;
            payout = currentBet.amount;
        } else if (currentBet.value === 'black' && isBlack(result)) {
            // Black pays 1:1
            win = true;
            payout = currentBet.amount;
        } else if (currentBet.value === 'even' && result !== 0 && result % 2 === 0) {
            // Even pays 1:1
            win = true;
            payout = currentBet.amount;
        } else if (currentBet.value === 'odd' && result !== 0 && result % 2 === 1) {
            // Odd pays 1:1
            win = true;
            payout = currentBet.amount;
        } else if (currentBet.value === '1-18' && result >= 1 && result <= 18) {
            // 1-18 pays 1:1
            win = true;
            payout = currentBet.amount;
        } else if (currentBet.value === '19-36' && result >= 19 && result <= 36) {
            // 19-36 pays 1:1
            win = true;
            payout = currentBet.amount;
        }
    }
    
    // Set random spin duration (3-5 seconds)
    const spinDuration = 3 + Math.random() * 2;
    
        // Calculate the angle for the result (0 at top, then clockwise)
    const numbers = 37;
    const anglePerNumber = 360 / numbers;
    const extraSpins = 5; // Number of full spins for dramatic effect
    const finalAngle = 360 * extraSpins + (360 - (result * anglePerNumber)); // 0 is at top, so subtract result*angle
    
    // Animate wheel to land on the winning number
    wheel.style.transition = `transform ${spinDuration}s cubic-bezier(0.2, 0.8, 0.3, 1)`;
    wheel.style.transform = `rotate(${finalAngle}deg)`;
    
    // Animate ball in opposite direction for realism
    ball.style.transition = `transform ${spinDuration}s cubic-bezier(0.3, 0.9, 0.2, 1)`;
    ball.style.transform = `rotate(-${finalAngle + 720}deg)`; // Ball spins more for effect
    
    // After animation completes
    setTimeout(async () => {
        // Create a bet object for the database
        const rouletteBetData = {
            game: 'roulette',
            amount: currentBet.amount,
            betOn: currentBet.type === 'number' ? `Number ${currentBet.value}` : currentBet.value.toUpperCase(),
            result: result === 0 ? '0 (Green)' : `${result} (${isRed(result) ? 'Red' : 'Black'})`,
            multiplier: win ? (payout / currentBet.amount) + 1 : 0,
            outcome: win ? `Won ${payout} INR` : 'Lost',
            status: win ? 'Won' : 'Lost',
            winAmount: win ? payout : 0
        };
        
        // Record bet using standardized function
        const betResult = await GameUtils.recordBet(rouletteBetData);
        
        if (!betResult.success) {
            console.error('Error recording roulette bet:', betResult.error);
        }
        
        // Get user data for local history
        const userData = getUserData();
        
        // Also record in local storage for history display only
        if (!userData.bets) userData.bets = [];
        userData.bets.push({
            game: 'roulette',
            time: new Date().toLocaleString(),
            betOn: currentBet.type === 'number' ? `Number ${currentBet.value}` : currentBet.value.toUpperCase(),
            amount: currentBet.amount,
            result: result === 0 ? '0 (Green)' : `${result} (${isRed(result) ? 'Red' : 'Black'})`,
            outcome: win ? `Won ${payout} INR` : 'Lost'
        });
        setUserData(userData);
        updateBetHistory();
        
        // Update balance display
        updateBalanceDisplay();
        
        // Show result
        document.getElementById('result-number').textContent = result === 0 ? '0 (Green)' : `${result} (${isRed(result) ? 'Red' : 'Black'})`;
        document.getElementById('bet-outcome').textContent = win ? `Won ${payout} INR!` : 'Lost';
        document.getElementById('bet-outcome').style.color = win ? '#4CAF50' : '#F44336';
        
        // Reset game state
        spinning = false;
        currentBet = null;
        betPlaced = false;
        document.getElementById('bet-amount').disabled = false;
        document.getElementById('place-bet-btn').disabled = false;
        document.getElementById('spin-btn').disabled = true;
        
        // Re-enable clicking on numbers/specials
        document.querySelectorAll('.number, .special').forEach(el => {
            el.style.pointerEvents = 'auto';
        });
        
                // Reset wheel and ball transforms for next spin
        setTimeout(() => {
            wheel.style.transition = '';
            wheel.style.transform = '';
            ball.style.transition = '';
            ball.style.transform = '';
        }, 1000);
    }, spinDuration * 1000);
}

// Helper function to check if a number is red
function isRed(num) {
    const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
    return redNumbers.includes(num);
}

// Helper function to check if a number is black
function isBlack(num) {
    if (num === 0) return false;
    return !isRed(num);
}

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('gx_user'));
    if (!user || !user.loggedIn) {
        alert('Please log in to play Roulette');
        window.location.href = 'login.html';
        return;
    }
    
    // Update balance and bet history
    updateBalanceDisplay();
    updateBetHistory();
    
    // Set up number and special bet selection
    document.querySelectorAll('.number').forEach(el => {
        el.addEventListener('click', () => selectBet(el, 'number'));
    });
    
    document.querySelectorAll('.special').forEach(el => {
        el.addEventListener('click', () => selectBet(el, 'special'));
    });
    
    // Set up bet amount input
    document.getElementById('bet-amount').addEventListener('input', function() {
        betAmount = parseInt(this.value);
    });
    
    // Set up place bet button
    document.getElementById('place-bet-btn').addEventListener('click', placeBet);
    
    // Set up spin button
    document.getElementById('spin-btn').addEventListener('click', spin);
});
