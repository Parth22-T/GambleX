// payments.js: Handles deposit, withdraw, balance, and transaction history with MongoDB database

// Get user token from localStorage
function getToken() {
    return localStorage.getItem('gx_token');
}

// Update balance display from API
function updateBalanceDisplay() {
    const token = getToken();
    if (!token) return;
    
    // Add a timestamp parameter to avoid caching issues
    const timestamp = new Date().getTime();
    
    API.User.getBalance(token)
        .then(response => {
            // Check if response is valid and has balance data
            if (response && response.success && response.data && typeof response.data.balance !== 'undefined') {
                const balance = parseFloat(response.data.balance);
                document.getElementById('user-balance').textContent = balance;
                console.log('Balance updated successfully:', balance);
            } else {
                console.error('Invalid balance data received:', response);
            }
        })
        .catch(error => {
            console.error('Error fetching balance:', error);
        });
}

// Update transaction table from API
function updateTxnTable() {
    const token = getToken();
    if (!token) return;
    
    API.Transaction.getTransactions(token)
        .then(response => {
            const transactions = response.data;
            const tbody = document.querySelector('#txn-table tbody');
            tbody.innerHTML = '';
            
            if (transactions && transactions.length) {
                // Sort by date descending (newest first)
                transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
                
                transactions.forEach(txn => {
                    const tr = document.createElement('tr');
                    const date = new Date(txn.date).toLocaleString();
                    tr.innerHTML = `<td>${date}</td><td>${txn.type}</td><td>${txn.amount}</td>`;
                    tbody.appendChild(tr);
                });
            } else {
                tbody.innerHTML = '<tr><td colspan="3">No transactions yet.</td></tr>';
            }
        })
        .catch(error => {
            console.error('Error fetching transactions:', error);
            document.querySelector('#txn-table tbody').innerHTML = 
                '<tr><td colspan="3">Error loading transactions.</td></tr>';
        });
}

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const token = getToken();
    const user = JSON.parse(localStorage.getItem('gx_user'));
    
    if (!token || !user || !user.loggedIn) {
        window.location.href = 'login.html';
        return;
    }
    
    // Initialize displays
    updateBalanceDisplay();
    updateTxnTable();
    
    // Deposit form handler
    document.getElementById('deposit-form').onsubmit = function(e) {
        e.preventDefault();
        const amt = parseInt(document.getElementById('deposit-amount').value, 10);
        
        if (amt <= 0) {
            document.getElementById('deposit-success').textContent = 'Please enter a valid amount.';
            setTimeout(() => document.getElementById('deposit-success').textContent = '', 2000);
            return;
        }
        
        // Create transaction via API
        API.Transaction.createTransaction({ type: 'Deposit', amount: amt }, token)
            .then(response => {
                console.log('Deposit transaction created:', response);
                
                // Wait a moment for the server to process the transaction
                setTimeout(() => {
                    // Update UI
                    updateBalanceDisplay();
                    updateTxnTable();
                    document.getElementById('deposit-success').textContent = `Deposited ₹${amt} successfully!`;
                    setTimeout(() => document.getElementById('deposit-success').textContent = '', 2000);
                    document.getElementById('deposit-form').reset();
                }, 500);
            })
            .catch(error => {
                console.error('Deposit error:', error);
                document.getElementById('deposit-success').textContent = 
                    error.message || 'Error processing deposit. Please try again.';
                setTimeout(() => document.getElementById('deposit-success').textContent = '', 2000);
            });
    };
    
    // Withdraw form handler
    document.getElementById('withdraw-form').onsubmit = function(e) {
        e.preventDefault();
        const amt = parseInt(document.getElementById('withdraw-amount').value, 10);
        
        if (amt <= 0) {
            document.getElementById('withdraw-success').textContent = 'Please enter a valid amount.';
            setTimeout(() => document.getElementById('withdraw-success').textContent = '', 2000);
            return;
        }
        
        // Create transaction via API
        API.Transaction.createTransaction({ type: 'Withdraw', amount: amt }, token)
            .then(response => {
                console.log('Withdraw transaction created:', response);
                
                // Wait a moment for the server to process the transaction
                setTimeout(() => {
                    // Update UI
                    updateBalanceDisplay();
                    updateTxnTable();
                    document.getElementById('withdraw-success').textContent = `Withdrew ₹${amt} successfully!`;
                    setTimeout(() => document.getElementById('withdraw-success').textContent = '', 2000);
                    document.getElementById('withdraw-form').reset();
                }, 500);
            })
            .catch(error => {
                console.error('Withdraw error:', error);
                document.getElementById('withdraw-success').textContent = 
                    error.message || 'Insufficient balance or server error.';
                setTimeout(() => document.getElementById('withdraw-success').textContent = '', 2000);
            });
    };
});
