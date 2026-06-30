# Football-Data.org API Integration Setup

## Step 1: Get Your Free API Key

1. **Visit**: https://www.football-data.org/client/register
2. **Fill out the registration form**:
   - Email address
   - Your name
   - Use case: "Personal prediction game app"
3. **Check your email** for the API key
4. **Copy your API key** (it looks like: `abc123def456...`)

## Step 2: Add API Key to Environment File

1. Open the file: `.env.local` in the project root
2. Replace `your_api_key_here` with your actual API key:

```bash
FOOTBALL_DATA_API_KEY=abc123def456your_actual_key_here
```

3. Save the file
4. **Restart the dev server** (stop and run `npm run dev` again)

## Step 3: Sync Fixtures

1. Go to **Admin → Fixture Management**
2. Click the **"🔄 Sync from API"** button
3. Confirm the sync
4. Wait for the fixtures to import

## Available Competitions

The API provides access to these competitions:

- **World Cup 2022** (ID: 2000) - Qatar World Cup ✅
- **EUROS 2024** (ID: 2018) - European Championship ✅
- **Champions League** (ID: 2001)
- **Premier League** (ID: 2021)
- More competitions available

**Note**: World Cup 2026 data is not yet available since the tournament hasn't happened.

## API Limits (Free Tier)

- **10 requests per minute**
- **No credit card required**
- **Perfect for personal projects**

## What Gets Imported

When you sync fixtures, the system imports:

✅ Team names and flags
✅ Match dates and times (UTC)
✅ Match stages (Group, Round 16, Quarters, etc.)
✅ Groups (A, B, C, etc.)
✅ Final scores (for completed matches)
✅ Match status (Finished, Scheduled, etc.)

## Testing the Integration

1. **Check the Console**: Look for messages like:
   ```
   ✅ Fetched 64 matches from FIFA World Cup
   ```

2. **Verify Fixtures**: Open All Fixtures tab to see imported matches

3. **Check Status**: Completed matches should show scores

## Troubleshooting

### Error: "Invalid API key"
- Double-check your API key in `.env.local`
- Make sure there are no spaces or quotes around the key
- Restart the dev server after adding the key

### Error: "API rate limit exceeded"
- Free tier: 10 requests/minute
- Wait a minute and try again

### Error: "No fixtures found"
- Some competitions might not have data available
- Try World Cup 2022 (ID: 2000) which has complete data

### No API Key Error
- You haven't added the key to `.env.local`
- Get your key from: https://www.football-data.org/client/register

## Changing Competition

To sync a different competition, edit this line in `page.tsx`:

```typescript
body: JSON.stringify({ competitionId: 2000 }), // Change this ID
```

Competition IDs:
- 2000 = World Cup 2022
- 2018 = EUROS 2024
- 2001 = Champions League

## Manual Fixture Management

You can still:
- ✏️ Edit fixtures manually
- ➕ Create new fixtures
- 🗑️ Delete fixtures
- 🔄 Update TBD teams

The API sync is optional - you can use manually created fixtures if you prefer.

## Need Help?

1. Check the browser console (F12) for error messages
2. Check the server terminal for API logs
3. Visit: https://www.football-data.org/documentation/quickstart
