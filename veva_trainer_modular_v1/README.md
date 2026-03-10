# VEVA Trainer (modular v1)

## Run
Use GitHub Pages (https) or a local server. Voice input requires https or localhost.

## What’s in this pack
- Gate (5W/H + ID + supervisor report)
- Person Search (outfit + item cards, light contraband chance)
- Sign-in (register + issue pass)
- Return pass (end)

## Logging
Set `CONFIG.logEndpoint` in `config.js` to your Apps Script Web App URL.
If empty, logs are stored in console/offline buffer.

## Files
- `app.js` core engine
- `patches/*` intents / phrasebanks / visuals (extend here)
- `assets/photos/*` placeholder images (soldier.png, soldier2.png, headshots)
