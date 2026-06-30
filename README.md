# FIFA 2026 World Cup Prediction Game

A web application for hosting a FIFA World Cup prediction game with your friends. Players can predict match outcomes, earn points, and compete on a live leaderboard.

## Features

### Player Features
- **Simple Enrollment**: Join with just your first name and phone number
- **Match Predictions**:
  - **Group Stage**: Predict Team A, Draw, or Team B (2 points for correct prediction)
  - **Knockout Stages**: Predict winner + exact score (bonus points)
  - **Semi-Finals/Final**: Predict winner + score + 3 goal scorers (extra bonus points)
- **Three Tabs**:
  - **Upcoming Matches**: Quick access to open predictions
  - **All Fixtures**: View past, current, and future matches
  - **Leaderboard**: Live rankings with movement indicators (↑↓→)
- **WhatsApp Export**: Copy leaderboard as formatted text for WhatsApp groups

### Admin Features
- **Points Rules Management**: Customize points awarded for each stage
- **Fixture Management**:
  - Lock/unlock predictions for any match
  - Enter match results and scores
  - Control fixture status (open/locked/completed)
- **Real-time Updates**: All changes reflect immediately for all players

## Tech Stack

- **Frontend**: Next.js 14 + React + TypeScript
- **Styling**: Tailwind CSS
- **State**: In-memory database (for demo - can be upgraded to PostgreSQL/MongoDB)
- **Icons**: Lucide React

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd "WC Prediciton Game"
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### For Players
1. Visit the home page and enroll with your name and phone number
2. Navigate to "Upcoming Matches" to make predictions
3. Select your prediction (Team A/Draw/Team B)
4. For knockout stages, optionally add score predictions for bonus points
5. For semi-finals and final, add goal scorer predictions for extra points
6. Check the "Leaderboard" tab to see your ranking

### For Admins
1. Click the "Admin" button in the header
2. **Manage Points Rules**:
   - Click "Edit Points" to modify points awarded per stage
   - Change result points, score points, or goal scorer points
3. **Manage Fixtures**:
   - Click on any fixture to edit
   - Change status (open/locked/completed)
   - Enter match results and scores
   - Save changes

### Export Leaderboard to WhatsApp
1. Go to the "Leaderboard" tab
2. Click "Export for WhatsApp"
3. The formatted leaderboard is copied to your clipboard
4. Paste it into your WhatsApp group

Example format:
```
🏆 LEADERBOARD - FIFA 2026 🏆
6/26/2026

1. ↑ 🥇 John - 24 pts (+4)
2. ↓ 🥈 Sarah - 22 pts (+2)
3. → 🥉 Mike - 20 pts (+2)
```

## Project Structure

```
├── app/
│   ├── page.tsx              # Main player interface
│   ├── admin/
│   │   └── page.tsx          # Admin dashboard
│   ├── api/
│   │   ├── users/            # User enrollment endpoints
│   │   ├── fixtures/         # Fixture listing
│   │   ├── predictions/      # Prediction submission
│   │   ├── leaderboard/      # Leaderboard calculation
│   │   └── admin/            # Admin management endpoints
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── EnrollmentForm.tsx    # User sign-up form
│   ├── PredictionCard.tsx    # Match prediction interface
│   └── Leaderboard.tsx       # Leaderboard display
├── lib/
│   └── database.ts           # In-memory data store
├── types/
│   └── index.ts              # TypeScript types
└── data/
    └── sample-data.ts        # Sample fixtures and users
```

## Current Limitations & Future Enhancements

### Current Limitations
- **In-memory storage**: Data is lost when the server restarts
- **No authentication**: Simple phone number identification
- **No real-time sync**: Requires page refresh for updates

### Recommended Enhancements
1. **Database Integration**: 
   - Replace in-memory store with PostgreSQL (Supabase) or MongoDB
   - Persist data across server restarts

2. **Real-time Updates**:
   - Add WebSocket support for live leaderboard updates
   - Push notifications for new matches

3. **Authentication**:
   - Add phone number verification (OTP)
   - Session management with JWT

4. **API Integration**:
   - Fetch live match data from football APIs (API-Football, football-data.org)
   - Auto-update results

5. **Analytics**:
   - Track prediction patterns
   - Show statistics (most predicted teams, accuracy rates)

6. **Social Features**:
   - In-app chat or comments
   - Share predictions on social media

## Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Deploy with one click

### Other Options
- **Netlify**: Similar to Vercel
- **Railway/Render**: For full-stack apps with databases
- **AWS/Google Cloud**: For production-grade deployments

## Contributing

Feel free to fork this project and customize it for your own prediction games!

## License

MIT License - feel free to use this for your World Cup prediction game!

---

Made with ⚽ for FIFA 2026
