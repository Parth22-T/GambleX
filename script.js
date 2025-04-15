// Session timeout configuration (in milliseconds)
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes by default
let sessionTimeoutId;

// Function to reset the session timeout
function resetSessionTimeout() {
    // Clear existing timeout
    if (sessionTimeoutId) {
        clearTimeout(sessionTimeoutId);
    }
    
    // Only set timeout if user is logged in
    const token = localStorage.getItem('gx_token');
    if (token) {
        sessionTimeoutId = setTimeout(() => {
            console.log('Session timeout: logging out due to inactivity');
            // Perform logout
            API.Auth.logout();
            // Clear local storage
            localStorage.removeItem('gx_token');
            localStorage.removeItem('gx_user');
            // Show alert
            alert('Your session has expired due to inactivity. Please log in again.');
            // Reload page
            location.reload();
        }, SESSION_TIMEOUT);
    }
}

// Add event listeners for user activity
document.addEventListener('mousemove', resetSessionTimeout);
document.addEventListener('keypress', resetSessionTimeout);
document.addEventListener('click', resetSessionTimeout);

// Login status and navigation logic for all pages using MySQL database
window.addEventListener('DOMContentLoaded', () => {
    // Initialize session timeout
    resetSessionTimeout();
    const userStatus = document.getElementById('user-status');
    const loginLink = document.getElementById('login-link');
    
    // Check if user is logged in with valid token
    const token = localStorage.getItem('gx_token');
    const user = JSON.parse(localStorage.getItem('gx_user'));
    
    if (token && user && user.loggedIn) {
        // Update UI for logged in user
        userStatus && (userStatus.innerHTML = `Logged in as <b>${user.username}</b> | <a href="#" id="logout-btn">Logout</a>`);
        if (loginLink) loginLink.style.display = 'none';
        
        // Set up logout button
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.onclick = () => {
                // Call API to logout
                API.Auth.logout();
                // Clear local storage
                localStorage.removeItem('gx_token');
                localStorage.removeItem('gx_user');
                // Reload page
                location.reload();
            };
        }
        
        // Verify token is still valid with the server
        if (!window.location.pathname.includes('login.html')) {
            API.Auth.getCurrentUser(token)
                .catch(error => {
                    console.error('Token validation error:', error);
                    // Token is invalid, clear localStorage and redirect to login
                    localStorage.removeItem('gx_token');
                    localStorage.removeItem('gx_user');
                    window.location.href = 'login.html';
                });
        }
    } else {
        // Update UI for logged out user
        userStatus && (userStatus.innerHTML = "Not logged in");
        if (loginLink) loginLink.style.display = 'inline';
        
        // Redirect to login page if trying to access protected pages
        const protectedPages = ['roulette.html', 'slot.html', 'sports.html', 'plinko.html', 'mines.html', 'payments.html'];
        const currentPage = window.location.pathname.split('/').pop();
        
        if (protectedPages.includes(currentPage)) {
            window.location.href = 'login.html';
        }
    }
});
