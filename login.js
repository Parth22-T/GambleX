// login.js: Handles login/register and Google sign-in with MySQL database
function showSection(section) {
    document.querySelector('.login-section').style.display = (section === 'login') ? '' : 'none';
    document.querySelector('.register-section').style.display = (section === 'register') ? '' : 'none';
}

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is already logged in
    const token = localStorage.getItem('gx_token');
    const user = JSON.parse(localStorage.getItem('gx_user'));
    
    if (token && user && user.loggedIn) {
        // Verify token is still valid with the server
        API.Auth.getCurrentUser(token)
            .then(response => {
                // Token is valid, redirect to home
                window.location.href = 'index.html';
            })
            .catch(error => {
                // Token is invalid, clear localStorage
                localStorage.removeItem('gx_token');
                localStorage.removeItem('gx_user');
            });
    }

    // Switch between login/register
    document.getElementById('show-register').onclick = function(e) {
        e.preventDefault();
        showSection('register');
    };
    document.getElementById('show-login').onclick = function(e) {
        e.preventDefault();
        showSection('login');
    };

    // Login form
    document.getElementById('login-form').onsubmit = function(e) {
        e.preventDefault();
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value;
        
        // Clear previous errors
        document.getElementById('login-error').textContent = '';
        
        // Call API to login
        API.Auth.login({ username, password })
            .then(response => {
                // Store token and user data
                localStorage.setItem('gx_token', response.token);
                localStorage.setItem('gx_user', JSON.stringify({
                    id: response.user.id,
                    username: response.user.username,
                    loggedIn: true,
                    loginTime: Date.now()
                }));
                
                // Redirect to home page
                window.location.href = 'index.html';
            })
            .catch(error => {
                document.getElementById('login-error').textContent = 
                    error.message || 'Invalid username or password';
            });
    };

    // Register form
    document.getElementById('register-form').onsubmit = function(e) {
        e.preventDefault();
        const username = document.getElementById('register-username').value.trim();
        const email = document.getElementById('register-email').value.trim();
        const password = document.getElementById('register-password').value;
        const confirm = document.getElementById('register-confirm').value;
        
        // Clear previous errors
        document.getElementById('register-error').textContent = '';
        
        // Form validation
        if (!username || !email || !password || !confirm) {
            document.getElementById('register-error').textContent = 'All fields are required.';
            return;
        }
        
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
            document.getElementById('register-error').textContent = 'Invalid email format.';
            return;
        }
        
        if (password.length < 6) {
            document.getElementById('register-error').textContent = 'Password must be at least 6 characters.';
            return;
        }
        
        if (password !== confirm) {
            document.getElementById('register-error').textContent = 'Passwords do not match.';
            return;
        }
        
        // Call API to register
        API.Auth.register({ username, email, password })
            .then(response => {
                // Store token and user data
                localStorage.setItem('gx_token', response.token);
                localStorage.setItem('gx_user', JSON.stringify({
                    id: response.user.id,
                    username: response.user.username,
                    loggedIn: true,
                    loginTime: Date.now()
                }));
                
                // Redirect to home page
                window.location.href = 'index.html';
            })
            .catch(error => {
                document.getElementById('register-error').textContent = 
                    error.message || 'Registration failed. Try a different username or email.';
            });
    };

    // Google Sign-In
    document.getElementById('google-signin').onclick = function() {
        // Show loading message
        document.getElementById('login-error').textContent = 'Processing Google sign-in...';
        document.getElementById('login-error').style.color = '#007bff';
        
        // In a real app, this would use the Google OAuth API
        // For this demo, we'll simulate a Google login with random data
        const randomNum = Math.floor(Math.random() * 10000);
        const googleData = {
            email: `user${randomNum}@gmail.com`,
            name: `Google User ${randomNum}`
        };
        
        API.Auth.googleAuth(googleData)
            .then(response => {
                // Clear any error messages
                document.getElementById('login-error').textContent = '';
                
                // Store token and user data
                localStorage.setItem('gx_token', response.token);
                localStorage.setItem('gx_user', JSON.stringify({
                    id: response.user.id,
                    username: response.user.username,
                    email: response.user.email,
                    loggedIn: true,
                    loginTime: Date.now()
                }));
                
                console.log('Google sign-in successful:', response);
                
                // Redirect to home page
                window.location.href = 'index.html';
            })
            .catch(error => {
                console.error('Google sign-in error:', error);
                document.getElementById('login-error').textContent = 
                    error.message || 'Google sign-in failed. Please try again.';
                document.getElementById('login-error').style.color = '#dc3545';
            });
    };

    // Session expiry check (3 hours)
    if (user && user.loggedIn && user.loginTime) {
        const now = Date.now();
        if (now - user.loginTime > 3 * 60 * 60 * 1000) {
            // Session expired, logout
            localStorage.removeItem('gx_token');
            localStorage.removeItem('gx_user');
            alert('Your session has expired. Please log in again.');
        }
    }
});
