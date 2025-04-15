# GambleX
This project is a web-based betting and gaming platform built with a modern full-stack architecture. It allows users to participate in various games (such as sports betting, mines, roulette, etc.) and place bets, with all bet information managed and stored securely in a backend database.

Key Features
Multiple Games: Includes games like sports betting, mines, and roulette, each with its own interactive frontend.
Persistent Betting System: Bets placed by users are saved to a MongoDB database via a backend API, ensuring data integrity and persistence.
Backend Server: The backend is powered by Node.js with Express.js and connects to MongoDB for data storage. It exposes RESTful API endpoints at http://localhost:5000/api.
Frontend-Backend Integration: The frontend communicates with the backend using API calls (e.g., API.Bet.createBet) to manage bets and retrieve game data.
User Experience: If the backend server is not running, users will encounter "Failed to fetch" errors, indicating the need for the backend to be active for full functionality.
Technical Stack
Frontend: HTML, CSS, and JavaScript (with game logic and UI in files like sports.js, mines.js, roulette.js, etc.)
Backend: Node.js, Express.js (located in the server directory)
Database: MongoDB
API Integration: RESTful API for bet management and game data
Usage Notes
Make sure the backend server is running (node server or npm start in the server directory) for the frontend to function correctly.
Bets should be submitted via the API to ensure they are stored in the database, not just in localStorage.
