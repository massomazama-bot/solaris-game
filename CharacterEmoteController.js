var CharacterEmoteController = pc.createScript('characterEmoteController');

// Attributes exposed in the Editor
CharacterEmoteController.attributes.add('idleAnimation', {
    type: 'asset',
    assetType: 'animation',
    title: 'Idle Animation',
    description: 'Default looping idle animation'
});

CharacterEmoteController.attributes.add('emoteAnimations', {
    type: 'asset',
    assetType: 'animation',
    array: true,
    title: 'Emote Animations',
    description: 'Array of emote animations to play randomly'
});

CharacterEmoteController.attributes.add('minEmoteInterval', {
    type: 'number',
    default: 8,
    title: 'Min Emote Interval (seconds)',
    description: 'Minimum time between emotes'
});

CharacterEmoteController.attributes.add('maxEmoteInterval', {
    type: 'number',
    default: 20,
    title: 'Max Emote Interval (seconds)',
    description: 'Maximum time between emotes'
});

CharacterEmoteController.attributes.add('transitionTime', {
    type: 'number',
    default: 0.2,
    title: 'Transition Time (seconds)',
    description: 'Crossfade time between animations'
});

CharacterEmoteController.prototype.initialize = function() {
    this.animComponent = this.entity.animation;
    
    if (!this.animComponent) {
        console.error('CharacterEmoteController: No Animation component found on entity');
        return;
    }
    
    // Validate assets
    if (!this.idleAnimation) {
        console.warn('CharacterEmoteController: No idle animation assigned');
    }
    
    if (!this.emoteAnimations || this.emoteAnimations.length === 0) {
        console.warn('CharacterEmoteController: No emote animations assigned');
    }
    
    // Play idle animation initially
    if (this.idleAnimation) {
        this.playAnimation(this.idleAnimation, true); // true = loop
    }
    
    // Start the emote timer
    this.scheduleNextEmote();
    
    // Clean up on destroy
    this.on('destroy', this.onDestroy, this);
};

CharacterEmoteController.prototype.playAnimation = function(animationAsset, loop) {
    if (!this.animComponent || !animationAsset) return;
    
    const animName = animationAsset.name;
    
    // Check if animation is already playing
    const currentAnim = this.animComponent.currentAnim;
    if (currentAnim === animName) return;
    
    // Play with crossfade
    this.animComponent.play(animName, {
        loop: loop,
        blendTime: this.transitionTime
    });
};

CharacterEmoteController.prototype.playRandomEmote = function() {
    if (!this.emoteAnimations || this.emoteAnimations.length === 0) return;
    
    // Pick random emote
    const randomIndex = Math.floor(Math.random() * this.emoteAnimations.length);
    const emoteAsset = this.emoteAnimations[randomIndex];
    
    if (!emoteAsset) return;
    
    // Play emote (non-looping)
    this.playAnimation(emoteAsset, false);
    
    // Listen for emote completion to return to idle
    this.onceAnimationEnd(emoteAsset.name, () => {
        if (this.idleAnimation) {
            this.playAnimation(this.idleAnimation, true);
        }
        // Schedule next emote
        this.scheduleNextEmote();
    });
};

CharacterEmoteController.prototype.onceAnimationEnd = function(animName, callback) {
    if (!this.animComponent) return;
    
    const handler = (name) => {
        if (name === animName) {
            this.animComponent.off('end', handler);
            callback();
        }
    };
    
    this.animComponent.on('end', handler);
    
    // Safety timeout in case 'end' event doesn't fire
    setTimeout(() => {
        this.animComponent.off('end', handler);
        callback();
    }, 10000); // 10 second max
};

CharacterEmoteController.prototype.scheduleNextEmote = function() {
    // Clear any existing timer
    if (this.emoteTimer) {
        clearTimeout(this.emoteTimer);
    }
    
    // Random interval between min and max
    const interval = this.minEmoteInterval + Math.random() * (this.maxEmoteInterval - this.minEmoteInterval);
    const delayMs = interval * 1000;
    
    this.emoteTimer = setTimeout(() => {
        this.playRandomEmote();
    }, delayMs);
};

CharacterEmoteController.prototype.onDestroy = function() {
    if (this.emoteTimer) {
        clearTimeout(this.emoteTimer);
    }
};

// Optional: Pause/resume when dashboard loses/gains focus
CharacterEmoteController.prototype.pause = function() {
    if (this.emoteTimer) {
        clearTimeout(this.emoteTimer);
        this.emoteTimer = null;
    }
    if (this.animComponent) {
        this.animComponent.pause();
    }
};

CharacterEmoteController.prototype.resume = function() {
    if (this.animComponent) {
        this.animComponent.resume();
    }
    this.scheduleNextEmote();
};

return CharacterEmoteController;