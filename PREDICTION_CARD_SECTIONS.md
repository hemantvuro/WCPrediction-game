# Prediction Card Modular Sections

## Overview
The Match Prediction cards now have three independently controllable sections that admins can enable or disable per fixture. This allows flexible prediction scenarios for different matches.

## Card Structure

### 1. Match Outcome Section (Blue/Purple gradient)
- **Purpose**: Users predict which team will win the match
- **Options**: 
  - Team A Win (blue button)
  - Draw (gray button, group stage only)
  - Team B Win (purple button)
- **Admin Control**: `enableMatchOutcome` (default: true)

### 2. Score Prediction Section (Green/Teal gradient)
- **Purpose**: Users predict the exact score
- **Input**: Two number inputs (0-20) for each team
- **Admin Control**: `enableScorePrediction` (default: true)

### 3. Goal Scorer Prediction Section (Yellow/Orange gradient)
- **Purpose**: Users predict up to 3 goal scorers (bonus points)
- **Input**: Three text fields for player names
- **Admin Control**: `enableScorerPrediction` (default: true)

### 4. Match Info Section (Indigo/Blue gradient - Always Visible)
- **Date and Time**: Shows match date/time in India timezone
- **Countdown Timer**: Live countdown showing hours, minutes, seconds
- **Auto-lock**: All inputs disable when countdown reaches 0
- **Save Status**: Shows "✓ Saved" when prediction is auto-saved
- **Existing Prediction**: Summary of user's current prediction

## Admin Configuration

### Location
**Admin → Manage Fixtures → Edit Fixture**

### Settings Panel
In the edit fixture modal, admins will see a new section:

**🎮 Prediction Card Sections**
- ✅ Match Outcome Section
- ✅ Score Prediction Section  
- ✅ Goal Scorer Prediction Section

Each checkbox controls whether that section appears on the Match Prediction cards.

## Auto-save Behavior

The card automatically saves predictions 1 second after the user stops typing or clicking:

- **Match Outcome**: Saves immediately when a team is selected
- **Score Prediction**: Saves 1 second after entering scores
- **Goal Scorers**: Saves 1 second after typing stops

No manual submit button needed - predictions are auto-saved continuously until the countdown expires.

## Technical Implementation

### New Fixture Fields
```typescript
interface Fixture {
  // ... existing fields
  enableMatchOutcome?: boolean;    // default: true
  enableScorePrediction?: boolean; // default: true
  enableScorerPrediction?: boolean; // default: true
}
```

### Files Modified
1. **types/index.ts**: Added three new optional boolean fields to Fixture interface
2. **components/PredictionCard.tsx**: Restructured to show/hide sections based on flags
3. **app/admin/fixtures/page.tsx**: Added checkboxes in edit modal for section control
4. **app/api/fixtures/[id]/route.ts**: Updated PUT handler to accept new fields
5. **data/sample-data.ts**: Initialize all fixtures with default true values

### API Updates
All fixture API endpoints (POST, PUT) now accept and save the three new fields:
- `/api/admin/fixtures` (POST for creating)
- `/api/fixtures/[id]` (PUT for updating)

## Use Cases

### Example 1: Simple Match Outcome Only
- Enable: Match Outcome
- Disable: Score Prediction, Goal Scorers
- **Result**: Users only pick the winner (fast predictions for group stages)

### Example 2: Score Predictions Only
- Disable: Match Outcome
- Enable: Score Prediction
- Disable: Goal Scorers
- **Result**: Users must predict exact scores (more challenging)

### Example 3: Finals with All Sections
- Enable: All sections
- **Result**: Full prediction experience with bonus points for goal scorers

### Example 4: Knockout Stages
- Enable: Match Outcome, Score Prediction
- Disable: Goal Scorers
- **Result**: Win + score prediction without the complexity of scorer names

## Visual Design

Each section has distinct gradient colors:
- **Match Outcome**: Blue/Purple gradient background
- **Score Prediction**: Green/Teal gradient background
- **Goal Scorers**: Yellow/Orange gradient background
- **Match Info**: Indigo/Blue gradient background (always visible)

Sections are vertically stacked with clear separation and white borders between them.

## Default Configuration

All new fixtures created through the admin panel default to:
- ✅ Match Outcome: Enabled
- ✅ Score Prediction: Enabled
- ✅ Goal Scorer Prediction: Enabled

Admins can customize per fixture as needed.
