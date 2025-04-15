// sports.js - Handles sports betting logic
let selectedBets = [];
let betAmount = 10;
let betPlaced = false; // Track if a bet has been placed
let betTransactionID = null; // Store transaction ID for linking with bet

// Match data for simulating results
const matches = {
    // Football matches
    f1: { home: "Manchester United", away: "Liverpool", league: "Premier League", date: "Apr 16, 2025" },
    f2: { home: "Barcelona", away: "Real Madrid", league: "La Liga", date: "Apr 17, 2025" },
    f3: { home: "Bayern Munich", away: "Borussia Dortmund", league: "Bundesliga", date: "Apr 18, 2025" },
    // Cricket matches
    c1: { home: "Mumbai Indians", away: "Chennai Super Kings", league: "IPL 2025", date: "Apr 16, 2025" },
    c2: { home: "India", away: "Australia", league: "T20 World Cup", date: "Apr 18, 2025" },
    c3: { home: "England", away: "Pakistan", league: "Test Series", date: "Apr 20, 2025" }
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
        console.error('Error updating balance in sports game:', error);
        // No fallback needed as we're using server data exclusively
    });
}

function updateBetHistory() {
    const data = getUserData();
    const tbody = document.querySelector('#bet-history-table tbody');
    tbody.innerHTML = '';
    
    if (data && data.bets && data.bets.length) {
        // Filter only sports bets and show most recent first
        const sportsBets = data.bets
            .filter(bet => bet.game === 'sports')
            .slice()
            .reverse()
            .slice(0, 10); // Show only last 10 bets
            
        if (sportsBets.length) {
            sportsBets.forEach(bet => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${bet.time}</td>
                    <td>${bet.match}</td>
                    <td>${bet.selection}</td>
                    <td>${bet.odds}</td>
                    <td>${bet.amount} INR</td>
                    <td class="status-${bet.status.toLowerCase()}">${bet.status}</td>
                `;
                tbody.appendChild(tr);
            });
            return;
        }
    }
    
    // If no bets or filtered bets
    tbody.innerHTML = '<tr><td colspan="6">No bet history yet.</td></tr>';
}

// Tab switching
function switchTab(tabName) {
    // Hide all tab content
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Remove active class from all tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Show selected tab content and set active class
    document.getElementById(`${tabName}-tab`).style.display = 'block';
    document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');
}

// Bet slip functions
function updateBetSlip() {
    const betSlipContent = document.getElementById('bet-slip-content');
    const betControls = document.querySelector('.bet-controls');
    
    if (selectedBets.length === 0) {
        betSlipContent.innerHTML = '<p class="empty-slip">No bets selected</p>';
        betControls.style.display = 'none';
        return;
    }
    
    betSlipContent.innerHTML = '';
    selectedBets.forEach((bet, index) => {
        const betItem = document.createElement('div');
        betItem.className = 'slip-item';
        betItem.innerHTML = `
            <div>
                <div class="slip-match">${bet.match}</div>
                <div class="slip-selection">${bet.selection} (${bet.odds})</div>
            </div>
            <button class="slip-remove" data-index="${index}">×</button>
        `;
        betSlipContent.appendChild(betItem);
    });
    
    // Show bet controls
    betControls.style.display = 'block';
    
    // Update potential win
    updatePotentialWin();
    
    // Add event listeners to remove buttons
    document.querySelectorAll('.slip-remove').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            removeBet(index);
        });
    });
}

function addBet(matchId, team, odd) {
    // Get match details
    const match = matches[matchId];
    if (!match) return;
    
    // Check if already in bet slip
    const existingIndex = selectedBets.findIndex(bet => bet.matchId === matchId);
    if (existingIndex !== -1) {
        // Replace existing bet
        selectedBets[existingIndex] = {
            matchId,
            match: `${match.home} vs ${match.away}`,
            selection: getSelectionText(matchId, team),
            team,
            odds: parseFloat(odd)
        };
    } else {
        // Add new bet
        selectedBets.push({
            matchId,
            match: `${match.home} vs ${match.away}`,
            selection: getSelectionText(matchId, team),
            team,
            odds: parseFloat(odd)
        });
    }
    
    // Update bet slip
    updateBetSlip();
}

function getSelectionText(matchId, team) {
    const match = matches[matchId];
    if (!match) return '';
    
    if (team === 'home') return match.home;
    if (team === 'away') return match.away;
    if (team === 'draw') return 'Draw';
    return '';
}

function removeBet(index) {
    if (index >= 0 && index < selectedBets.length) {
        selectedBets.splice(index, 1);
        updateBetSlip();
    }
}

function updatePotentialWin() {
    betAmount = parseInt(document.getElementById('bet-amount').value);
    if (isNaN(betAmount) || betAmount < 10) {
        betAmount = 10;
        document.getElementById('bet-amount').value = 10;
    }
    
    // Calculate total odds (multiply all odds together for accumulator bet)
    let totalOdds = 1;
    selectedBets.forEach(bet => {
        totalOdds *= bet.odds;
    });
    
    // Calculate potential win
    const potentialWin = (betAmount * totalOdds).toFixed(2);
    document.getElementById('potential-win').textContent = potentialWin;
}

async function placeBet() {
    if (selectedBets.length === 0) {
        alert('Please select at least one bet');
        return;
    }
    
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
    
    // Calculate total odds
    let totalOdds = 1;
    selectedBets.forEach(bet => {
        totalOdds *= bet.odds;
    });
    
    // Place bet using standardized function
    const betResult = await GameUtils.placeBet({
        game: 'sports',
        amount: betAmount,
        details: `Sports bet on ${selectedBets.map(b => b.match).join(', ')}`
    });
    
    if (!betResult.success) {
        alert('Error placing bet: ' + betResult.error);
        return;
    }
    
    // Store transaction ID for linking with bet later
    betTransactionID = betResult.transactionID;
    betPlaced = true;
    
    // Simulate bet result (50% chance of winning for demo)
    const win = Math.random() < 0.5;
    
    // Create a bet object for the database
    const betData = {
        game: 'sports',
        amount: betAmount,
        match: selectedBets.map(b => b.match).join(', '),
        selection: selectedBets.map(b => b.selection).join(', '),
        odds: parseFloat(totalOdds.toFixed(2)),
        multiplier: parseFloat(totalOdds.toFixed(2)),
        outcome: win ? `Won ${(betAmount * totalOdds).toFixed(2)} INR` : 'Lost',
        status: win ? 'Won' : 'Lost',
        winAmount: win ? parseFloat((betAmount * totalOdds).toFixed(2)) : 0
    };
    
    // Record bet using standardized function, passing the transaction ID
    const recordResult = await GameUtils.recordBet(betData, betTransactionID);
    
    if (!recordResult.success) {
        console.error('Error recording sports bet:', recordResult.error);
    }
    
    // Reset bet tracking
    betPlaced = false;
    betTransactionID = null;
    
    // Record bet in local storage for display only
    const userData = getUserData();
    if (!userData.bets) userData.bets = [];
    
    selectedBets.forEach(bet => {
        userData.bets.push({
            game: 'sports',
            time: new Date().toLocaleString(),
            match: bet.match,
            selection: bet.selection,
            odds: bet.odds.toFixed(2),
            amount: betAmount,
            status: win ? 'Won' : 'Lost'
        });
    });
    
    // Update displays
    setUserData(userData);
    updateBetHistory();
    updateBalanceDisplay();
    
    // Show result to user
    if (win) {
        const winAmount = betAmount * totalOdds;
        alert(`Congratulations! You won ${winAmount.toFixed(2)} INR!`);
    } else {
        alert('Better luck next time!');
    }
    
    // Clear bet slip
    selectedBets = [];
    updateBetSlip();
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('gx_user'));
    if (!user || !user.loggedIn) {
        alert('Please log in to place sports bets');
        window.location.href = 'login.html';
        return;
    }
    
    // Update balance and bet history
    updateBalanceDisplay();
    updateBetHistory();
    
    // Set up tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            switchTab(this.dataset.tab);
        });
    });
    
    // Set up odd buttons
    document.querySelectorAll('.odd-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Remove selected class from all odds in this match
            const matchCard = this.closest('.match-card');
            matchCard.querySelectorAll('.odd-btn').forEach(oddBtn => {
                oddBtn.classList.remove('selected');
            });
            
            // Add selected class to clicked odd
            this.classList.add('selected');
            
            // Add bet to slip
            addBet(
                matchCard.dataset.matchId,
                this.dataset.team,
                this.dataset.odd
            );
        });
    });
    
    // Set up bet amount input
    document.getElementById('bet-amount').addEventListener('input', updatePotentialWin);
    
    // Set up place bet button
    document.getElementById('place-bet-btn').addEventListener('click', placeBet);
    
    // Initialize match images
    createPlaceholderImages();
});

// Function to create placeholder images for matches
function createPlaceholderImages() {
    // Get all match cards
    const matchCards = document.querySelectorAll('.match-card');
    
    // For each match card, set appropriate team logos or placeholder images
    matchCards.forEach(card => {
        const matchId = card.dataset.matchId;
        const match = matches[matchId];
        
        if (!match) return;
        
        // Get team logo elements
        const homeLogoEl = card.querySelector('.team-home img');
        const awayLogoEl = card.querySelector('.team-away img');
        
        // Set default placeholder images if they don't have src attributes
        if (homeLogoEl && (!homeLogoEl.src || homeLogoEl.src.endsWith('placeholder.png'))) {
            // Use team name to create a colored placeholder with initials
            const teamInitial = match.home.charAt(0);
            homeLogoEl.src = `https://via.placeholder.com/40/${getTeamColor(match.home)}/FFFFFF?text=${teamInitial}`;
            homeLogoEl.alt = match.home;
        }
        
        if (awayLogoEl && (!awayLogoEl.src || awayLogoEl.src.endsWith('placeholder.png'))) {
            // Use team name to create a colored placeholder with initials
            const teamInitial = match.away.charAt(0);
            awayLogoEl.src = `https://via.placeholder.com/40/${getTeamColor(match.away)}/FFFFFF?text=${teamInitial}`;
            awayLogoEl.alt = match.away;
        }
    });
}

// Helper function to generate consistent colors based on team names
function getTeamColor(teamName) {
    // Simple hash function to generate a color code based on team name
    let hash = 0;
    for (let i = 0; i < teamName.length; i++) {
        hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    // Convert to hex color
    let color = Math.abs(hash).toString(16).substring(0, 6);
    // Pad with zeros if needed
    while (color.length < 6) {
        color = '0' + color;
    }
    
    return color;
}
