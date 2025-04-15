// slot.js - Handles slot machine game logic
let spinning = false;
let betAmount = 10;
let betPlaced = false; // Track if a bet has been placed
let betTransactionID = null; // Store transaction ID for linking with bet

// Symbols and their values
const symbols = ['🍒', '🍋', '🍇', '💎', '7️⃣'];
const payouts = {
    '🍒': 3,  // 3x
    '🍋': 5,  // 5x
    '🍇': 10, // 10x
    '💎': 50, // 50x
    '7️⃣': 100 // 100x
};

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
        console.error('Error updating balance in slot game:', error);
        // No fallback needed as we're using server data exclusively
    });
}

function updateBetHistory() {
    const data = getUserData();
    const tbody = document.querySelector('#bet-history-table tbody');
    tbody.innerHTML = '';
    
    if (data && data.bets && data.bets.length) {
        // Filter only slot machine bets and show most recent first
        const slotBets = data.bets
            .filter(bet => bet.game === 'slot')
            .slice()
            .reverse()
            .slice(0, 10); // Show only last 10 bets
            
        if (slotBets.length) {
            slotBets.forEach(bet => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${bet.time}</td>
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
    tbody.innerHTML = '<tr><td colspan="4">No bet history yet.</td></tr>';
}

// Slot machine functions
async function spin() {
    if (spinning) return;
    
    betAmount = parseInt(document.getElementById('bet-amount').value);
    if (isNaN(betAmount) || betAmount < 10) {
        alert('Minimum bet is 10 INR');
        return;
    }
    
    // Check if user is logged in
    const token = localStorage.getItem('gx_token');
    if (!token) {
        alert('Please log in to play Slot Machine');
        window.location.href = 'login.html';
        return;
    }
    
    // Place bet using standardized function
    const betResult = await GameUtils.placeBet({
        game: 'slot',
        amount: betAmount,
        details: 'Bet on Slot Machine'
    });
    
    if (!betResult.success) {
        alert('Error placing bet: ' + betResult.error);
        return;
    }
    
    // Store transaction ID for linking with bet later
    betTransactionID = betResult.transactionID;
    betPlaced = true;
    
    spinning = true;
    document.getElementById('spin-btn').disabled = true;
    document.getElementById('result-message').textContent = 'Spinning...';
    
    // Start spinning animation
    const reels = [
        document.getElementById('reel1'),
        document.getElementById('reel2'),
        document.getElementById('reel3')
    ];
    
    // Add spinning class to all symbols
    document.querySelectorAll('.symbol').forEach(symbol => {
        symbol.classList.add('spinning');
    });
    
    // Generate random results for each reel
    const results = [
        Math.floor(Math.random() * symbols.length),
        Math.floor(Math.random() * symbols.length),
        Math.floor(Math.random() * symbols.length)
    ];
    
    // Stop reels one by one with delays
    setTimeout(() => stopReel(0, results[0]), 1000);
    setTimeout(() => stopReel(1, results[1]), 1500);
    setTimeout(() => stopReel(2, results[2]), 2000);
    
    // After all reels stop
    setTimeout(async () => {
        const resultSymbols = [
            symbols[results[0]],
            symbols[results[1]],
            symbols[results[2]]
        ];
        
        // Check for win
        let win = false;
        let winAmount = 0;
        
        // Check if all symbols are the same
        if (resultSymbols[0] === resultSymbols[1] && resultSymbols[1] === resultSymbols[2]) {
            win = true;
            winAmount = betAmount * payouts[resultSymbols[0]];
            
            // Add winning animation
            document.querySelector('.slot-display').classList.add('win');
            setTimeout(() => {
                document.querySelector('.slot-display').classList.remove('win');
            }, 1500);
        }
        
        // Prepare bet data for backend
        const slotBetData = {
            game: 'slot',
            amount: betAmount,
            result: resultSymbols.join(' '),
            outcome: win ? `Won ${winAmount} INR` : 'Lost',
            status: win ? 'Won' : 'Lost',
            winAmount: win ? winAmount : 0
        };
        
        // Record bet using standardized function, passing the transaction ID
        const betResult = await GameUtils.recordBet(slotBetData, betTransactionID);
        
        if (!betResult.success) {
            console.error('Error recording slot bet:', betResult.error);
        }
        
        // Reset bet tracking
        betPlaced = false;
        betTransactionID = null;
        
        // Record bet in local storage for display only
        const userData = getUserData();
        if (!userData.bets) userData.bets = [];
        userData.bets.push({
            game: 'slot',
            time: new Date().toLocaleString(),
            amount: betAmount,
            result: resultSymbols.join(' '),
            outcome: win ? `Won ${winAmount} INR` : 'Lost'
        });
        setUserData(userData);
        updateBetHistory();
        
        // Update balance display
        updateBalanceDisplay();
        
        // Show result
        document.getElementById('result-message').textContent = win ? 
            `🎉 ${resultSymbols.join(' ')} - You won ${winAmount} INR! 🎉` : 
            `${resultSymbols.join(' ')} - Better luck next time!`;
        document.getElementById('result-message').style.color = win ? '#4CAF50' : '#ffb400';
        
        // Reset game state
        spinning = false;
        document.getElementById('spin-btn').disabled = false;
    }, 2500);
}

function stopReel(reelIndex, symbolIndex) {
    const reelId = `reel${reelIndex + 1}`;
    const reel = document.getElementById(reelId);
    
    // Stop spinning animation for this reel
    reel.querySelectorAll('.symbol').forEach(symbol => {
        symbol.classList.remove('spinning');
    });
    
    // Set the symbols for this reel
    const prevIndex = (symbolIndex - 1 + symbols.length) % symbols.length;
    const nextIndex = (symbolIndex + 1) % symbols.length;
    
    reel.querySelector(`#r${reelIndex + 1}s1`).textContent = symbols[prevIndex];
    reel.querySelector(`#r${reelIndex + 1}s2`).textContent = symbols[symbolIndex];
    reel.querySelector(`#r${reelIndex + 1}s3`).textContent = symbols[nextIndex];
}

// Initialize game
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('gx_user'));
    if (!user || !user.loggedIn) {
        alert('Please log in to play Slot Machine');
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize reels with random symbols
    for (let i = 1; i <= 3; i++) {
        for (let j = 1; j <= 3; j++) {
            const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
            document.getElementById(`r${i}s${j}`).textContent = randomSymbol;
        }
    }
    
    // Update balance and bet history
    updateBalanceDisplay();
    updateBetHistory();
    
    // Set up bet amount input
    document.getElementById('bet-amount').addEventListener('input', function() {
        betAmount = parseInt(this.value);
    });
    
    // Set up spin button
    document.getElementById('spin-btn').addEventListener('click', spin);
});
