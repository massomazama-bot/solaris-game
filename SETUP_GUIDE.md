# PlayCanvas Character Emote Controller - Setup Guide

## 1. Add the Script to Your Project

1. In PlayCanvas Editor, right-click in Assets panel → **New Asset** → **Script**
2. Name it `CharacterEmoteController`
3. Paste the code from `CharacterEmoteController.js`
4. Save

## 2. Prepare Your Animations

In the PlayCanvas Editor:
1. Import your character model (FBX/GLB) with animations
2. Make sure animations are extracted as separate Animation assets
3. You should have:
   - **1 Idle animation** (breathing, subtle movement, looping)
   - **Multiple Emote animations** (wave, dance, cheer, etc., non-looping)

## 3. Setup the Character Entity

1. Select your character entity in the Hierarchy
2. Add **Animation** component (if not already present)
3. Add **Script** component → Add `CharacterEmoteController`
4. In the Script component, assign:
   - **Idle Animation**: Drag your idle animation asset
   - **Emote Animations**: Click `+` and drag each emote animation asset
   - **Min Emote Interval**: e.g., `8` (seconds)
   - **Max Emote Interval**: e.g., `20` (seconds)
   - **Transition Time**: e.g., `0.2` (smooth crossfade)

## 4. Dashboard Integration

For the main dashboard scene:
1. Position the character where you want it visible on login
2. Add a **Camera** entity focused on the character
3. Ensure the character entity is enabled when dashboard loads

### Auto-start on Dashboard Load

Add this to your dashboard initialization script:

```javascript
var DashboardController = pc.createScript('dashboardController');

DashboardController.prototype.initialize = function() {
    // Find character entity (by name or tag)
    const character = this.app.root.findByName('DashboardCharacter');
    
    if (character && character.script.characterEmoteController) {
        // Character will auto-start idle + random emotes
        console.log('Character emote controller active');
    }
    
    // Optional: Pause when tab not visible
    document.addEventListener('visibilitychange', () => {
        if (character && character.script.characterEmoteController) {
            if (document.hidden) {
                character.script.characterEmoteController.pause();
            } else {
                character.script.characterEmoteController.resume();
            }
        }
    });
};
```

## 5. Animation Requirements

**Idle Animation:**
- Looping: ✓ Yes
- Duration: 10-30 seconds (longer = less repetitive)
- Subtle: breathing, weight shifts, occasional blink/look around

**Emote Animations:**
- Looping: ✗ No (play once)
- Duration: 2-5 seconds each
- Variety: wave, thumbs up, dance, stretch, look at watch, etc.
- At least 3-5 different emotes for good variety

## 6. Performance Tips

- Use **GPU skinning** (default in PlayCanvas)
- Keep bone count reasonable (< 100 bones)
- Compress animation clips
- Use LOD if character is far from camera
- Enable **Frustum Culling** on character entity

## 7. Customization Ideas

### Weighted Random Emotes
```javascript
// In attributes, add weights for each emote
CharacterEmoteController.attributes.add('emoteWeights', {
    type: 'number',
    array: true,
    default: [1, 1, 1, 1, 1] // Equal probability
});
```

### Time-based Emotes
```javascript
// Different emotes for morning/afternoon/evening
const hour = new Date().getHours();
if (hour < 12) playEmote('morningStretch');
else if (hour < 17) playEmote('afternoonWave');
else playEmote('eveningYawn');
```

### Interactive Emotes
```javascript
// Add mouse interaction
this.app.mouse.on(pc.EVENT_MOUSEDOWN, () => {
    if (this.idleAnimation) this.playAnimation(this.idleAnimation, true);
    this.playRandomEmote(); // Immediate emote on click
}, this);
```