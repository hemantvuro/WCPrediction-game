# Quick Reference Card

## 🚀 Getting Started (30 seconds)

```bash
npm run dev
```
Open: **http://localhost:3000**

---

## 👤 Player Actions

| Action | Where | How |
|--------|-------|-----|
| **Enroll** | Home page | Enter name + phone → Join Game |
| **Predict** | Upcoming tab | Select team → Submit |
| **View Rank** | Leaderboard tab | See your position |
| **Export** | Leaderboard tab | Click Export button |

---

## 🔧 Admin Actions

| Action | Where | How |
|--------|-------|-----|
| **Access Admin** | Any page | Click "Admin" button (top right) |
| **Lock Match** | Admin → Click fixture | Status: Open → Locked |
| **Enter Result** | Admin → Click fixture | Status: Completed + Select winner + Enter scores |
| **Change Points** | Admin → Points Rules | Click "Edit Points" → Modify values |

---

## 📊 Scoring Quick Guide

| Stage | Result | Score | Scorers |
|-------|--------|-------|---------|
| **Group** | 2 pts | - | - |
| **Knockouts** | 2 pts | +2 pts | - |
| **Semi/Final** | 2 pts | +2 pts | +1 pt each (max 3) |

---

## 🎯 Workflows

### Daily Routine (During Tournament)
```
Morning:
1. Open admin → Lock matches starting today
2. After match → Enter results
3. Evening → Export leaderboard → Post to WhatsApp

Repeat daily!
```

### Adding New Fixture
```
Currently: Edit data/sample-data.ts
Future: Use admin API endpoint
```

### Changing Points Rules
```
Admin → Points Rules → Edit Points → Change numbers → Auto-saves
```

---

## 🐛 Common Issues

| Problem | Solution |
|---------|----------|
| Server won't start | Try `PORT=3001 npm run dev` |
| Changes not showing | Hard refresh (Cmd+Shift+R) |
| Predictions not saving | Check match status is "open" |
| Data disappeared | In-memory storage resets on restart (expected) |

---

## 📂 Key Files

| File | Purpose | When to Edit |
|------|---------|--------------|
| `data/sample-data.ts` | Fixture list | Add real World Cup matches |
| `lib/database.ts` | Data storage | Upgrade to real database |
| `app/page.tsx` | Player UI | Customize interface |
| `app/admin/page.tsx` | Admin UI | Modify admin features |
| `types/index.ts` | TypeScript types | Add new data fields |

---

## 🔗 URLs

| Page | URL | Purpose |
|------|-----|---------|
| **Home** | `http://localhost:3000` | Player interface |
| **Admin** | `http://localhost:3000/admin` | Admin dashboard |

---

## 📱 WhatsApp Export Format

```
🏆 LEADERBOARD - FIFA 2026 🏆
[Date]

1. ↑ 🥇 Name - XX pts (+X)
2. ↓ 🥈 Name - XX pts (+X)
3. → 🥉 Name - XX pts (+X)
...
```

Copy → Paste in WhatsApp → Send!

---

## ⚡ Quick Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Type check
npx tsc --noEmit
```

---

## 🎨 Status Colors

- 🔵 **Blue** = Open (can predict)
- 🔴 **Red** = Locked (closed for predictions)
- 🟢 **Green** = Completed (finished)

---

## 🏆 Points Calculation Example

**Final Match: Argentina 3-1 Brazil**

Your prediction: Argentina wins, 3-1, scorers: Messi ✓, Di Maria ✓, Alvarez ✓

```
✓ Correct winner (Argentina)     = 2 pts
✓ Exact score (3-1)               = 2 pts
✓ Messi scored                    = 1 pt
✓ Di Maria scored                 = 1 pt
✓ Alvarez scored                  = 1 pt
───────────────────────────────────────
TOTAL                             = 7 pts
```

---

## 📞 Support

- **Setup Guide**: `SETUP.md`
- **Full Docs**: `README.md`
- **Visual Tour**: `VISUAL_GUIDE.md`
- **Project Summary**: `PROJECT_SUMMARY.md`
- **Research**: `RESEARCH_FINDINGS.md`

---

## ✅ Pre-Launch Checklist

Before sharing with friends:

- [ ] Test enrollment flow
- [ ] Make a test prediction
- [ ] Lock a match (admin)
- [ ] Complete a match (admin)
- [ ] Check leaderboard updates
- [ ] Test WhatsApp export
- [ ] Deploy to Vercel (optional)
- [ ] Share URL with group!

---

## 🚀 Deploy to Production

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git push

# 2. Go to vercel.com
# 3. Import repository
# 4. Click "Deploy"
# 5. Get public URL
# 6. Share with friends!
```

Done in 5 minutes! 🎉

---

**Keep this card handy during the tournament!** 📌
