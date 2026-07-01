# Fix Rules Editing

## Problem
Admin cannot edit points rules on the Rules page.

## Root Cause
The `points_rules` table doesn't exist in your Supabase database yet.

## Solution

### Step 1: Create the Table
1. Go to Supabase SQL Editor: https://supabase.com/dashboard/project/mfrxriowdeztndnvdrfr/sql/new
2. Copy the SQL from [CREATE_POINTS_RULES.sql](CREATE_POINTS_RULES.sql)
3. Run it

### Step 2: Verify
After running the SQL, you should see:
- 7 rows with default points for each stage
- Group stage: 2/2/0 points (result/score/scorers)
- Final: 10/10/3 points

### Step 3: Test
1. Go to Admin → Points Rules
2. Click "✏️ Edit Rules"
3. Change any value
4. Click "✓ Done Editing"
5. Refresh the page - values should persist

## What the Table Contains

| Stage        | Result Points | Score Points | Goal Scorer Points |
|--------------|---------------|--------------|-------------------|
| Group Stage  | 2             | 2            | 0                 |
| Round of 32  | 3             | 3            | 1                 |
| Round of 16  | 4             | 4            | 1                 |
| Quarter Finals | 5           | 5            | 2                 |
| Semi Finals  | 6             | 6            | 2                 |
| Third Place  | 6             | 6            | 2                 |
| Final        | 10            | 10           | 3                 |

## How Editing Works

1. Click "✏️ Edit Rules" button
2. Input fields appear for each stage
3. Change values (0-10)
4. Values save automatically on change
5. Click "✓ Done Editing" to lock values

## Error Messages

If you see an error on the Rules page, it will show:
- **Red banner** with the error
- **Instructions** on how to fix it
- **Link to SQL file** to run

Just follow the steps in the error message.
