# Dream Wall

Welcome to **Dream Wall**! I originally built this project as a personal space to learn and understand how full-stack development works from the ground up. Beyond just being a learning experience, it has become a simple, cozy little corner of the web where you can pin your dreams, aspirations, and fleeting midnight thoughts. 

Built with Node.js, Express, and SQLite, it's a lightweight app ready to store everything you hope to achieve (or just whatever weird stuff you dreamed about last night!).

## What is it?

Dream Wall is a full-stack web app that gives you a digital wall to:
- **Save** your dreams 
- **View** all the dreams you've pinned to the wall
- **Remove** dreams once they've come true (or if you change your mind)

## How it works

Under the hood, we're keeping it simple and solid:
- **Frontend:** Vanilla HTML, CSS, and JavaScript. No heavy frameworks, just pure web magic.
- **Backend:** An Express.js API handling all the requests on port `3003`.
- **Database:** SQLite3 to safely tuck away your dreams without needing a complex database setup.

## Getting Started

Want to run your own Dream Wall locally? It's super easy!

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed (version 22.x or higher is recommended).

### Setup

1. **Navigate to the project directory** in your terminal.
2. **Install the dependencies**:
   ```bash
   npm install
   ```
3. **Start the server**:
   ```bash
   npm start
   ```
   *(This runs `node server.js` under the hood).*

4. **Open your browser** and visit `http://localhost:3003`. 
5. Start dreaming! ✨

## 🗂️ Project Structure

- `server.js`: The heart of the backend Express API.
- `db.js`: Where the SQLite database connection and setup lives.
- `public/`: The frontend files (`index.html`, `style.css`, `script.js`).
- `package.json`: Project metadata and dependencies.

---

*"A dream you dream alone is only a dream. A dream you dream together is reality."* - Yoko Ono

Go ahead, add your first dream to the wall!
