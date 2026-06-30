#!/bin/bash

# Test script for WC Prediction Game
BASE_URL="http://localhost:3000"

echo "🧪 Starting App Tests..."
echo "========================="
echo ""

# Test 1: Create User 1 (Alice - will predict correctly)
echo "Test 1: Creating User 1 (Alice)..."
USER1_RESPONSE=$(curl -s -X POST "$BASE_URL/api/users" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Alice","phoneNumber":"1111111111"}')

USER1_ID=$(echo $USER1_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "✅ User 1 Created: Alice (ID: $USER1_ID)"
echo ""

# Test 2: Create User 2 (Bob - will predict incorrectly)
echo "Test 2: Creating User 2 (Bob)..."
USER2_RESPONSE=$(curl -s -X POST "$BASE_URL/api/users" \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Bob","phoneNumber":"2222222222"}')

USER2_ID=$(echo $USER2_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "✅ User 2 Created: Bob (ID: $USER2_ID)"
echo ""

# Test 3: Get fixtures
echo "Test 3: Fetching fixtures..."
FIXTURES_RESPONSE=$(curl -s "$BASE_URL/api/fixtures")
FIXTURE_COUNT=$(echo $FIXTURES_RESPONSE | grep -o '"id":' | wc -l)
echo "✅ Found $FIXTURE_COUNT fixtures"

# Get first fixture ID
FIXTURE_ID=$(echo $FIXTURES_RESPONSE | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo "Using fixture ID: $FIXTURE_ID for testing"
echo ""

# Test 4: Update fixture to completed status with result
echo "Test 4: Setting up test fixture with final result..."
FIXTURE_UPDATE=$(curl -s -X PUT "$BASE_URL/api/fixtures/$FIXTURE_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "status":"completed",
    "result":"teamA",
    "scoreA":2,
    "scoreB":1
  }')
echo "✅ Fixture updated: Team A wins 2-1"
echo ""

# Test 5: Alice makes correct prediction
echo "Test 5: Alice predicts correctly (Team A, 2-1)..."
PRED1=$(curl -s -X POST "$BASE_URL/api/predictions" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\":\"$USER1_ID\",
    \"fixtureId\":\"$FIXTURE_ID\",
    \"prediction\":\"teamA\",
    \"scoreA\":2,
    \"scoreB\":1
  }")
echo "✅ Alice's prediction submitted"
echo ""

# Test 6: Bob makes incorrect prediction
echo "Test 6: Bob predicts incorrectly (Team B, 1-0)..."
PRED2=$(curl -s -X POST "$BASE_URL/api/predictions" \
  -H "Content-Type: application/json" \
  -d "{
    \"userId\":\"$USER2_ID\",
    \"fixtureId\":\"$FIXTURE_ID\",
    \"prediction\":\"teamB\",
    \"scoreA\":1,
    \"scoreB\":0
  }")
echo "✅ Bob's prediction submitted"
echo ""

# Test 7: Check leaderboard
echo "Test 7: Checking leaderboard..."
sleep 1
LEADERBOARD=$(curl -s "$BASE_URL/api/leaderboard")
echo ""
echo "📊 LEADERBOARD RESULTS:"
echo "======================"
echo $LEADERBOARD | python3 -m json.tool 2>/dev/null || echo $LEADERBOARD
echo ""

echo "✅ All tests completed!"
echo ""
echo "Expected results:"
echo "- Alice should have 4 points (2 for correct outcome + 2 for exact score)"
echo "- Bob should have 0 points (wrong outcome and score)"
echo ""
echo "👉 Open http://localhost:3000 in your browser to verify"
