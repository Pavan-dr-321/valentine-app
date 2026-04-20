Valentine Web App

An interactive and romantic web experience designed to ask “Will you be my Valentine?” in a playful and engaging way — with dynamic UI, emotional interactions, and a hidden response system.

✨ Features
🔐 Authentication
User registration & login system
Passwords hashed using Web Crypto API
Session handling with localStorage
💌 Valentine Interaction
“YES / NO” decision flow
Playful escaping NO button with emotional messages
Smooth transitions between states
🎴 Card-Based Date Selection
Interactive stacked card UI
Gesture-based interaction:
Center click → select
Edge click → navigate
Options include:
🎬 Movie Night
🌌 Stargazing
☕ Coffee Date
🕯️ Candlelight Dinner
💬 Custom idea
🎨 Dynamic Experience
Scene-based background transitions
Romantic UI design with animations
Responsive layout (mobile-friendly)
🕵️ Stealth Response System
User selections are silently logged using Google Forms
No visible indication to the user
Captures:
Selected option
Custom input (if any)
Timestamp
🛠️ Tech Stack
HTML5
CSS3 (Custom + Bootstrap 5)
Vanilla JavaScript
Web Crypto API (for password hashing)
Google Forms API (via fetch)
📁 Project Structure
FUN-APP/
│── index.html          # Login page
│── register.html       # Registration page
│── valentine.html      # Main app experience
│── style.css           # Styling & animations
│── script.js           # All logic (auth + UI + stealth)
│── /images             # Background assets
🚀 Live Demo

👉 https://our-valentinestory.netlify.app/

⚙️ How It Works
User registers & logs in
Enters Valentine page
Clicks YES
Explores or selects a date option
Selection is:
Displayed visually
Sent silently to Google Form
📌 Setup (Local)
# Run local server (Python)
python -m http.server 5500

Then open:

http://localhost:5500
🌐 Deployment

Deployed using Netlify (Drag & Drop)

⚠️ Notes
This project uses localStorage (not production-secure auth)
Designed for experience & interaction, not enterprise security
Google Form must be public for logging to work
💡 Future Improvements
Real-time notifications on selection
Backend integration (Node.js / Firebase)
Enhanced analytics dashboard
Multi-user tracking
❤️ Author
Built with intent, creativity, and a bit of romance 😄

⭐ If you like this project


Give it a ⭐ on GitHub — it means a lot!
