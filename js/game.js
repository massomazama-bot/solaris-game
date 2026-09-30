/* ==========================================================================
   RAILWAY RUNNER — Truly Infinite High-Action Endless 3D Engine (WebGL / Three.js)
   Fixed Infinite Spawning Logic (Obstacles & Coins spawn endlessly forever!)
   ========================================================================== */

(function() {
  'use strict';

  // ------------------------------------------------------------------------
  // CONSTANTS & GAME TUNING
  // ------------------------------------------------------------------------
  const LANES = [-2.6, 0, 2.6]; // 3 Railway Lanes: Left (-1), Center (0), Right (+1)
  const STARTING_SPEED = 11;     // 11 m/s
  const MAX_SPEED = 24;          // 24 m/s
  const SPEED_ACCEL = 0.5 / 12;  // Accelerates every 12s
  const JUMP_DURATION = 0.75;    // ~750ms total jump arc
  const JUMP_HEIGHT = 2.6;       // Peak elevation
  const SLIDE_DURATION = 0.65;   // ~650ms slide crouch
  const LANE_CHANGE_SPEED = 15.0; // Lerp speed for track changes
  const SPAWN_ROW_SPACING = 11;   // Spacing between continuous hazard rows

  // Obstacle & Hazard Types
  const TYPE_TRAM = 'tram';                // Stationary Tram
  const TYPE_TRAIN_INCOMING = 'train_inc'; // MOVING Train speeding TOWARD player!
  const TYPE_DRONE_INCOMING = 'drone_inc'; // MOVING Low Drone swooping toward torso!
  const TYPE_BARREL_INCOMING = 'barrel_inc'; // MOVING Rolling Barrel!
  const TYPE_CAR = 'car';                  // Parked Sports Car
  const TYPE_ANIMAL = 'animal';            // Street Dog
  const TYPE_LOW = 'low';                  // Low Barricade
  const TYPE_GATE = 'gate';                // Overhead Gate
  const TYPE_COIN = 'coin';                // Gold Coin

  // Power-up Types
  const TYPE_POWER_MAGNET = 'p_magnet'; // 🧲 Attracts coins
  const TYPE_POWER_SHIELD = 'p_shield'; // 🛡️ Absorbs 1 hit
  const TYPE_POWER_2X = 'p_2x';         // ⚡ Double score & coins
  const TYPE_POWER_HOVER = 'p_hover';   // 🛹 Hover over low hazards

  // High-Density Validated Obstacle Patterns
  const OBSTACLE_PATTERNS = [
    [TYPE_TRAIN_INCOMING, null, null],
    [null, TYPE_TRAIN_INCOMING, null],
    [null, null, TYPE_TRAIN_INCOMING],
    [TYPE_DRONE_INCOMING, TYPE_DRONE_INCOMING, null],
    [null, TYPE_DRONE_INCOMING, TYPE_DRONE_INCOMING],
    [TYPE_BARREL_INCOMING, null, TYPE_BARREL_INCOMING],
    [null, TYPE_BARREL_INCOMING, null],
    [TYPE_CAR, null, TYPE_CAR],
    [null, TYPE_CAR, null],
    [TYPE_ANIMAL, null, TYPE_ANIMAL],
    [null, TYPE_ANIMAL, null],
    [TYPE_LOW, null, TYPE_LOW],
    [TYPE_GATE, TYPE_GATE, null],
    [null, TYPE_GATE, TYPE_GATE],
    [TYPE_TRAIN_INCOMING, null, TYPE_CAR],
    [TYPE_LOW, TYPE_TRAIN_INCOMING, null],
    [null, TYPE_CAR, TYPE_DRONE_INCOMING]
  ];

  // ------------------------------------------------------------------------
  // CHARACTER DEFINITIONS & PERKS
  // ------------------------------------------------------------------------
  const CHARACTERS = {
    vex: {
      id: 'vex',
      name: 'PILOT VEX',
      class: 'CYBER RUNNER',
      icon: '🎧',
      perkName: 'BALANCED PILOT',
      perkDesc: '+10% Bonus Base Score',
      sprite: 'assets/char_jake.jpg',   // Billboard sprite image
      colors: { jacket: 0x168DAB, patch: 0xFFF79A, hood: 0xF5E6D3, visor: 0xE84936, pants: 0x2C4E6F, shoes: 0xFFFFFF, arms: 0x168DAB },
      perks: { scoreMultiplier: 1.1 }
    },
    nova: {
      id: 'nova',
      name: 'NOVA STRIKE',
      class: 'NEON SHADOW',
      icon: '🥷',
      perkName: 'MAGNET MASTER',
      perkDesc: '+50% Magnet Duration & Range',
      sprite: 'assets/char_nova.jpg',   // Billboard sprite image
      colors: { jacket: 0x6A327D, patch: 0x00F0FF, hood: 0x100E18, visor: 0x00F0FF, pants: 0x1A1A2E, shoes: 0x6A327D, arms: 0x6A327D },
      perks: { magnetDuration: 12, magnetRange: 18 }
    },
    aria: {
      id: 'aria',
      name: 'ARIA BLITZ',
      class: 'HYPER SPEEDSTER',
      icon: '⚡',
      perkName: 'HYPER VELOCITY',
      perkDesc: '+20% Speed & 1.5x Distance Score',
      sprite: 'assets/char_aria.jpg',   // Billboard sprite image
      colors: { jacket: 0xFFD82E, patch: 0xFF145B, hood: 0xFF8C00, visor: 0xFFFFFF, pants: 0x1B2A4A, shoes: 0xFFD82E, arms: 0xFFD82E },
      perks: { speedMultiplier: 1.2, distanceMultiplier: 1.5 }
    },
    titan: {
      id: 'titan',
      name: 'TITAN REX',
      class: 'CYBER MECH',
      icon: '🤖',
      perkName: 'IRON SHIELD',
      perkDesc: 'Auto 1st Shield & 30s Recharge',
      sprite: null,   // 3D geometry model
      colors: { jacket: 0x6E7B8B, patch: 0xFF2222, hood: 0x3A4550, visor: 0xFF2222, pants: 0x1A1A2A, shoes: 0x5A6370, arms: 0x6E7B8B },
      perks: { startWithShield: true, shieldRecharge: 30 }
    },
    zephyr: {
      id: 'zephyr',
      name: 'ZEPHYR VOID',
      class: 'METAVERSE PHANTOM',
      icon: '🔮',
      perkName: 'COIN ALCHEMIST',
      perkDesc: '2x Gold Coins & +25% Hover',
      sprite: null,   // 3D geometry model
      colors: { jacket: 0x2ECC71, patch: 0x9B59B6, hood: 0xA8E6CF, visor: 0x9B59B6, pants: 0x1A5C30, shoes: 0x2ECC71, arms: 0x2ECC71 },
      perks: { coinMultiplier: 2, hoverDuration: 7.5 }
    }
  };


  // ------------------------------------------------------------------------
  // WEB AUDIO SYNTHESIZER
  // ------------------------------------------------------------------------
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = localStorage.getItem('cyber_run_muted') === 'true';
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.muted = !this.muted;
      localStorage.setItem('cyber_run_muted', this.muted);
      return this.muted;
    }

    playJump() {
      if (this.muted || !this.ctx) return;
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(520, this.ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.2);
    }

    playSlide() {
      if (this.muted || !this.ctx) return;
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(320, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(120, this.ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    }

    playCoin() {
      if (this.muted || !this.ctx) return;
      this.init();
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';
      osc1.frequency.setValueAtTime(987.77, now);
      osc2.frequency.setValueAtTime(1318.51, now + 0.06);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.12);
      osc2.start(now + 0.06);
      osc2.stop(now + 0.25);
    }

    playPowerup() {
      if (this.muted || !this.ctx) return;
      this.init();
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(300, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.3);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.35);
    }

    playTrainHorn() {
      if (this.muted || !this.ctx) return;
      this.init();
      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(220, now);
      osc2.frequency.setValueAtTime(277, now);

      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc1.stop(now + 0.4);
      osc2.start(now);
      osc2.stop(now + 0.4);
    }

    playCrash() {
      if (this.muted || !this.ctx) return;
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(25, this.ctx.currentTime + 0.35);
      gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.35);
    }

    playBeep(high = false) {
      if (this.muted || !this.ctx) return;
      this.init();
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(high ? 900 : 450, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.15);
    }
  }

  const audio = new SoundEngine();

  // ------------------------------------------------------------------------
  // RAILWAY RUNNER ENGINE CLASS
  // ------------------------------------------------------------------------
  class RailwayRunnerEngine {
    constructor() {
      // DOM Elements
      this.container = document.getElementById('game-view');
      this.canvas = document.getElementById('game-canvas');
      this.hudScore = document.getElementById('hud-score');
      this.hudDistance = document.getElementById('hud-distance');
      this.hudCoins = document.getElementById('hud-coins');
      this.hudHint = document.getElementById('hud-hint');
      this.hudPowerupBar = document.getElementById('hud-powerup-bar');
      this.btnMute = document.getElementById('btn-game-mute');

      // Overlays
      this.overlayReady = document.getElementById('overlay-ready');
      this.overlayPause = document.getElementById('overlay-pause');
      this.overlayGameOver = document.getElementById('overlay-gameover');
      this.overlayCountdown = document.getElementById('game-countdown');

      // State
      this.state = 'IDLE'; // IDLE, READY, COUNTDOWN, RUNNING, PAUSED, GAMEOVER
      this.currentLane = 1; // Center track index (0, 1, 2)
      this.targetLane = 1;
      this.playerX = LANES[1];
      this.playerY = 0;
      this.playerZ = 0;

      // Motion
      this.isJumping = false;
      this.jumpTimer = 0;
      this.isSliding = false;
      this.slideTimer = 0;
      this.runAnimTime = 0;

      // Metrics
      this.distance = 0;
      this.coinsCollected = 0;
      this.score = 0;
      this.speed = STARTING_SPEED;
      this.elapsedActiveTime = 0;

      // Power-up States
      this.powerups = {
        magnet: 0,
        shield: false,
        mult2x: 0,
        hover: 0
      };

      // Character & Perks
      this.selectedCharacter = localStorage.getItem('cyber_run_char') || 'vex';
      this.characterPerks = CHARACTERS[this.selectedCharacter].perks;
      this.characterColors = CHARACTERS[this.selectedCharacter].colors;
      this.shieldRechargeTimer = 0;

      // World Pools
      this.trackSegments = [];
      this.obstacles = [];
      this.coins = [];
      this.powerupItems = [];
      this.particles = [];
      this.nextSpawnZ = -25;

      // Key input state (hold protection)
      this.keysPressed = {};

      // Three.js Setup
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.playerMesh = null;
      this.shieldMesh = null;
      this.leftArm = null;
      this.rightArm = null;
      this.leftLeg = null;
      this.rightLeg = null;
      this.shadowMesh = null;
      this.spritePlane = null;  // Billboard sprite plane (for sprite-mode characters)
      this.zephyrRune = null;   // Zephyr Void animated rune orb
      this.playerBox = new THREE.Box3();
      this.animId = null;
      this.lastTime = 0;

      this.initThree();
      this.bindEvents();
      this.updateMuteIcon();
    }

    // ----------------------------------------------------------------------
    // THREE.JS SCENE SETUP
    // ----------------------------------------------------------------------
    initThree() {
      if (typeof THREE === 'undefined') return;

      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0x87CEEB);
      this.scene.fog = new THREE.FogExp2(0x87CEEB, 0.008);

      this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 250);
      this.camera.position.set(0, 4.5, 7.5);
      this.camera.lookAt(0, 1.2, -10);

      this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, alpha: false });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

      const ambientLight = new THREE.AmbientLight(0xFFE8D6, 0.85);
      this.scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(0xFFFFFF, 1.2);
      sunLight.position.set(-6, 16, 10);
      this.scene.add(sunLight);

      const skyLight = new THREE.DirectionalLight(0x82C9D4, 0.5);
      skyLight.position.set(6, 10, -5);
      this.scene.add(skyLight);

      this.createCartoonRunner();
      this.createInitialWorld();
    }

    setCharacter(charId) {
      if (!CHARACTERS[charId]) return;
      this.selectedCharacter = charId;
      this.characterPerks = CHARACTERS[charId].perks;
      this.characterColors = CHARACTERS[charId].colors;
      localStorage.setItem('cyber_run_char', charId);
      this.rebuildPlayerModel();
      this.updateCharacterHUD();
    }

    updateCharacterHUD() {
      const char = CHARACTERS[this.selectedCharacter];
      const iconEl = document.getElementById('hud-char-icon');
      const nameEl = document.getElementById('hud-char-name');
      const perkEl = document.getElementById('hud-char-perk');
      if (iconEl) iconEl.textContent = char.icon;
      if (nameEl) nameEl.textContent = char.name;
      if (perkEl) perkEl.textContent = char.perkDesc;
    }

    rebuildPlayerModel() {
      if (!this.playerMesh || !this.scene) return;
      this.scene.remove(this.playerMesh);
      this.createCartoonRunner();
    }

    createCartoonRunner() {
      if (this.playerMesh) {
        this.scene.remove(this.playerMesh);
        this.playerMesh = null;
      }
      if (this.shadowMesh) {
        this.scene.remove(this.shadowMesh);
        this.shadowMesh = null;
      }

      const char = CHARACTERS[this.selectedCharacter];

      // ----- SHARED: Shadow plane on ground -----
      const shadowGeo = new THREE.PlaneGeometry(1.6, 0.6);
      const shadowMat = new THREE.MeshBasicMaterial({
        color: 0x000000,
        transparent: true,
        opacity: 0.35
      });
      this.shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
      this.shadowMesh.rotation.x = -Math.PI / 2;
      this.shadowMesh.position.y = 0.02;
      this.scene.add(this.shadowMesh);

      if (char.sprite) {
        // ---- BILLBOARD SPRITE MODE (Jake, Nova, Aria) ----
        // Load texture and create a flat plane that always faces camera
        const loader = new THREE.TextureLoader();
        const group = new THREE.Group();

        // Placeholder invisible box for collision (same hitbox as before)
        const hitboxGeo = new THREE.BoxGeometry(0.7, 2.0, 0.5);
        const hitboxMat = new THREE.MeshBasicMaterial({ visible: false });
        const hitbox = new THREE.Mesh(hitboxGeo, hitboxMat);
        hitbox.position.y = 1.0;
        group.add(hitbox);

        // Sprite plane — 1.6 units wide, 2.6 units tall
        const spritePlane = new THREE.PlaneGeometry(1.6, 2.6);
        const spriteMat = new THREE.MeshBasicMaterial({
          transparent: true,
          alphaTest: 0.1,
          side: THREE.FrontSide
        });
        this.spritePlane = new THREE.Mesh(spritePlane, spriteMat);
        this.spritePlane.position.y = 1.3;

        loader.load(
          char.sprite,
          (texture) => {
            spriteMat.map = texture;
            spriteMat.needsUpdate = true;
          },
          undefined,
          () => {
            // Fallback: color the plane if texture fails to load
            spriteMat.color.set(char.colors.jacket);
          }
        );

        group.add(this.spritePlane);

        // Shield bubble
        const shieldGeo = new THREE.SphereGeometry(1.2, 16, 16);
        const shieldMat = new THREE.MeshBasicMaterial({
          color: 0x00F0FF, transparent: true, opacity: 0.4, wireframe: true
        });
        this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
        this.shieldMesh.position.y = 1.1;
        this.shieldMesh.visible = false;
        group.add(this.shieldMesh);

        this.playerMesh = group;
        this.leftLeg = null;
        this.rightLeg = null;
        this.leftArm = null;
        this.rightArm = null;
        this.scene.add(this.playerMesh);

      } else {
        // ---- 3D GEOMETRY MODE (Titan Rex, Zephyr Void) ----
        const c = char.colors;
        const group = new THREE.Group();

        if (this.selectedCharacter === 'titan') {
          // ---- TITAN REX: Mech Robot ----
          // Chest/torso — wide armored plate
          const torso = new THREE.Mesh(
            new THREE.BoxGeometry(0.95, 1.1, 0.65),
            new THREE.MeshStandardMaterial({ color: c.jacket, metalness: 0.8, roughness: 0.3 })
          );
          torso.position.y = 1.1;
          group.add(torso);

          // Chest emblem
          const emblem = new THREE.Mesh(
            new THREE.BoxGeometry(0.35, 0.35, 0.05),
            new THREE.MeshBasicMaterial({ color: 0xFF2222 })
          );
          emblem.position.set(0, 1.15, 0.33);
          group.add(emblem);

          // Shoulder pads
          [-0.58, 0.58].forEach(sx => {
            const pad = new THREE.Mesh(
              new THREE.BoxGeometry(0.38, 0.32, 0.55),
              new THREE.MeshStandardMaterial({ color: c.hood, metalness: 0.9 })
            );
            pad.position.set(sx, 1.5, 0);
            group.add(pad);
          });

          // Head — helmet
          const helmet = new THREE.Mesh(
            new THREE.BoxGeometry(0.7, 0.65, 0.65),
            new THREE.MeshStandardMaterial({ color: c.hood, metalness: 0.7, roughness: 0.3 })
          );
          helmet.position.y = 1.95;
          group.add(helmet);

          // Visor — glowing red eye strip
          const visor = new THREE.Mesh(
            new THREE.BoxGeometry(0.5, 0.14, 0.05),
            new THREE.MeshBasicMaterial({ color: 0xFF0000 })
          );
          visor.position.set(0, 1.98, 0.33);
          group.add(visor);

          // Legs
          const legMat = new THREE.MeshStandardMaterial({ color: c.pants, metalness: 0.6 });
          this.leftLeg = new THREE.Group();
          const lLeg = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.75, 0.38), legMat);
          lLeg.position.y = -0.37;
          this.leftLeg.add(lLeg);
          this.leftLeg.position.set(-0.28, 0.7, 0);
          group.add(this.leftLeg);

          this.rightLeg = new THREE.Group();
          const rLeg = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.75, 0.38), legMat);
          rLeg.position.y = -0.37;
          this.rightLeg.add(rLeg);
          this.rightLeg.position.set(0.28, 0.7, 0);
          group.add(this.rightLeg);

          // Heavy boots
          const bootMat = new THREE.MeshStandardMaterial({ color: c.shoes, metalness: 0.7 });
          const bL = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.32, 0.56), bootMat);
          bL.position.set(0, -0.75, -0.05);
          this.leftLeg.add(bL);
          const bR = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.32, 0.56), bootMat);
          bR.position.set(0, -0.75, -0.05);
          this.rightLeg.add(bR);

          // Arms
          const armMat = new THREE.MeshStandardMaterial({ color: c.arms, metalness: 0.7 });
          this.leftArm = new THREE.Group();
          const laM = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.65, 0.32), armMat);
          laM.position.y = -0.32;
          this.leftArm.add(laM);
          this.leftArm.position.set(-0.63, 1.35, 0);
          group.add(this.leftArm);

          this.rightArm = new THREE.Group();
          const raM = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.65, 0.32), armMat);
          raM.position.y = -0.32;
          this.rightArm.add(raM);
          this.rightArm.position.set(0.63, 1.35, 0);
          group.add(this.rightArm);

        } else {
          // ---- ZEPHYR VOID: Cosmic Phantom ----
          const c = char.colors;

          // Body — slightly translucent ghostly hoodie
          const body = new THREE.Mesh(
            new THREE.BoxGeometry(0.72, 0.95, 0.52),
            new THREE.MeshStandardMaterial({ color: c.jacket, roughness: 0.4, transparent: true, opacity: 0.9 })
          );
          body.position.y = 1.05;
          group.add(body);

          // Mystical rune patch
          const rune = new THREE.Mesh(
            new THREE.OctahedronGeometry(0.2),
            new THREE.MeshBasicMaterial({ color: c.patch, wireframe: true })
          );
          rune.position.set(0, 1.15, 0.28);
          group.add(rune);
          this.zephyrRune = rune; // spin in update

          // Head / hood — glowing
          const head = new THREE.Mesh(
            new THREE.SphereGeometry(0.46, 16, 16),
            new THREE.MeshStandardMaterial({ color: c.hood, roughness: 0.5, transparent: true, opacity: 0.92 })
          );
          head.position.y = 1.72;
          group.add(head);

          // Glowing eyes
          [-0.15, 0.15].forEach(ex => {
            const eye = new THREE.Mesh(
              new THREE.SphereGeometry(0.07, 8, 8),
              new THREE.MeshBasicMaterial({ color: c.patch })
            );
            eye.position.set(ex, 1.75, 0.37);
            group.add(eye);
          });

          // Pants — darker shade
          const pantsMat = new THREE.MeshStandardMaterial({ color: c.pants, roughness: 0.6, transparent: true, opacity: 0.85 });
          this.leftLeg = new THREE.Group();
          const ll = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.65, 0.26), pantsMat);
          ll.position.y = -0.32;
          this.leftLeg.add(ll);
          this.leftLeg.position.set(-0.22, 0.65, 0);
          group.add(this.leftLeg);

          this.rightLeg = new THREE.Group();
          const rl = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.65, 0.26), pantsMat);
          rl.position.y = -0.32;
          this.rightLeg.add(rl);
          this.rightLeg.position.set(0.22, 0.65, 0);
          group.add(this.rightLeg);

          // Glowing boots
          const bootMat = new THREE.MeshStandardMaterial({ color: c.shoes, roughness: 0.3 });
          const sbL = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.24, 0.45), bootMat);
          sbL.position.set(0, -0.65, -0.05);
          this.leftLeg.add(sbL);
          const sbR = new THREE.Mesh(new THREE.BoxGeometry(0.32, 0.24, 0.45), bootMat);
          sbR.position.set(0, -0.65, -0.05);
          this.rightLeg.add(sbR);

          // Arms — ghostly
          const armMat = new THREE.MeshStandardMaterial({ color: c.arms, transparent: true, opacity: 0.88 });
          this.leftArm = new THREE.Group();
          const la = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.2), armMat);
          la.position.y = -0.3;
          this.leftArm.add(la);
          this.leftArm.position.set(-0.48, 1.3, 0);
          group.add(this.leftArm);

          this.rightArm = new THREE.Group();
          const ra = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.6, 0.2), armMat);
          ra.position.y = -0.3;
          this.rightArm.add(ra);
          this.rightArm.position.set(0.48, 1.3, 0);
          group.add(this.rightArm);

          // Floating energy orbs (cosmetic)
          [-0.9, 0.9].forEach(ox => {
            const orb = new THREE.Mesh(
              new THREE.IcosahedronGeometry(0.15, 1),
              new THREE.MeshBasicMaterial({ color: c.patch, wireframe: true })
            );
            orb.position.set(ox, 1.2, 0);
            group.add(orb);
          });
        }

        // Shield bubble (shared)
        const shieldGeo = new THREE.SphereGeometry(1.2, 16, 16);
        const shieldMat = new THREE.MeshBasicMaterial({
          color: 0x00F0FF, transparent: true, opacity: 0.4, wireframe: true
        });
        this.shieldMesh = new THREE.Mesh(shieldGeo, shieldMat);
        this.shieldMesh.position.y = 1.0;
        this.shieldMesh.visible = false;
        group.add(this.shieldMesh);

        this.spritePlane = null;
        this.playerMesh = group;
        this.scene.add(this.playerMesh);
      }
    }




    createInitialWorld() {
      this.trackSegments.forEach(s => this.scene.remove(s));
      this.trackSegments = [];

      for (let i = 0; i < 15; i++) {
        const seg = this.buildWorldSegment(20 - (i * 20));
        this.trackSegments.push(seg);
        this.scene.add(seg);
      }
    }

    buildWorldSegment(zPos) {
      const group = new THREE.Group();
      group.position.z = zPos;

      // Grass ground
      const groundGeo = new THREE.PlaneGeometry(80, 20);
      const groundMat = new THREE.MeshStandardMaterial({ color: 0x4A7C3F, roughness: 0.9 });
      const ground = new THREE.Mesh(groundGeo, groundMat);
      ground.rotation.x = -Math.PI / 2;
      group.add(ground);

      // Dirt path along tracks
      const pathGeo = new THREE.PlaneGeometry(10, 20);
      const pathMat = new THREE.MeshStandardMaterial({ color: 0x8B6914, roughness: 0.95 });
      const path = new THREE.Mesh(pathGeo, pathMat);
      path.rotation.x = -Math.PI / 2;
      path.position.y = 0.01;
      group.add(path);

      // Rails and sleepers
      const railTopMat = new THREE.MeshStandardMaterial({ color: 0x82C9D4, metalness: 0.8, roughness: 0.2 });
      const railSideMat = new THREE.MeshStandardMaterial({ color: 0x355A65, roughness: 0.5 });
      const sleeperMat = new THREE.MeshStandardMaterial({ color: 0x8F5D2D, roughness: 0.9 });

      LANES.forEach((laneX) => {
        for (let sz = -9; sz <= 9; sz += 1.3) {
          const sleeper = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.45), sleeperMat);
          sleeper.position.set(laneX, 0.04, sz);
          group.add(sleeper);
        }
        [-0.65, 0.65].forEach((offset) => {
          const rx = laneX + offset;
          const railTop = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.1, 20), railTopMat);
          railTop.position.set(rx, 0.12, 0);
          group.add(railTop);
          const railSide = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.08, 20), railSideMat);
          railSide.position.set(rx, 0.05, 0);
          group.add(railSide);
        });
      });

      // Zoo enclosures, trees, and animals on both sides
      [-1, 1].forEach((side) => {
        const sideX = side * 14;
        this.createFence(group, sideX, 0);
        for (let tz = -8; tz <= 8; tz += 4) {
          if (Math.random() > 0.3) this.createTree(group, sideX + (Math.random() - 0.5) * 4, tz + (Math.random() - 0.5) * 2);
        }
        for (let tz = -6; tz <= 6; tz += 6) {
          const animalType = Math.floor(Math.random() * 5);
          this.createAnimal(group, sideX + (Math.random() - 0.5) * 3, tz, animalType);
        }
        for (let tz = -8; tz <= 8; tz += 3) {
          if (Math.random() > 0.5) this.createBush(group, sideX + (Math.random() - 0.5) * 5, tz);
        }
      });

      // Wooden archway with vines
      const archMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.7 });
      const arch = new THREE.Mesh(new THREE.BoxGeometry(18, 0.5, 0.5), archMat);
      arch.position.set(0, 6.5, 0);
      group.add(arch);
      [-8, 8].forEach(px => {
        const pole = new THREE.Mesh(new THREE.BoxGeometry(0.5, 6.5, 0.5), archMat);
        pole.position.set(px, 3.25, 0);
        group.add(pole);
      });
      const vineMat = new THREE.MeshStandardMaterial({ color: 0x228B22 });
      for (let vx = -7; vx <= 7; vx += 2) {
        const vine = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1 + Math.random(), 0.1), vineMat);
        vine.position.set(vx, 6.0, 0);
        group.add(vine);
      }

      // Flying birds
      const birdMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
      for (let i = 0; i < 3; i++) {
        const bird = new THREE.Group();
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.15), birdMat);
        bird.add(body);
        [-0.2, 0.2].forEach(wx => {
          const wing = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.02, 0.1), birdMat);
          wing.position.set(wx, 0.05, 0);
          bird.add(wing);
        });
        bird.position.set(
          (Math.random() - 0.5) * 20,
          5 + Math.random() * 3,
          (Math.random() - 0.5) * 15
        );
        group.add(bird);
      }

      // Zoo sign
      const signMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.7 });
      const signPost = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.5, 6), signMat);
      signPost.position.set(10, 1.25, -5);
      group.add(signPost);
      const signBoard = new THREE.Mesh(new THREE.BoxGeometry(2.5, 1.0, 0.1), new THREE.MeshStandardMaterial({ color: 0xFFD82E, roughness: 0.5 }));
      signBoard.position.set(10, 2.8, -5);
      group.add(signBoard);

      return group;
    }

    createFence(group, x, z) {
      const fenceMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });
      for (let fz = -9; fz <= 9; fz += 1.5) {
        const post = new THREE.Mesh(new THREE.BoxGeometry(0.15, 1.2, 0.15), fenceMat);
        post.position.set(x, 0.6, fz);
        group.add(post);
      }
      [-0.3, 0.3].forEach(yOff => {
        const rail = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.08, 18), fenceMat);
        rail.position.set(x, 0.6 + yOff + 0.3, 0);
        group.add(rail);
      });
    }

    createTree(group, x, z) {
      const trunkMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.3, 2.5, 8), trunkMat);
      trunk.position.set(x, 1.25, z);
      group.add(trunk);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x228B22, roughness: 0.7 });
      const leaves = new THREE.Mesh(new THREE.SphereGeometry(1.2, 8, 8), leafMat);
      leaves.position.set(x, 3.0, z);
      group.add(leaves);
    }

    createBush(group, x, z) {
      const bushMat = new THREE.MeshStandardMaterial({ color: 0x2E8B57, roughness: 0.8 });
      const bush = new THREE.Mesh(new THREE.SphereGeometry(0.5 + Math.random() * 0.3, 6, 6), bushMat);
      bush.position.set(x, 0.3, z);
      group.add(bush);
    }

    createAnimal(group, x, z, type) {
      const animal = new THREE.Group();
      animal.position.set(x, 0, z);

      if (type === 0) {
        // Elephant
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x808080, roughness: 0.8 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 1.2, 2.0), bodyMat);
        body.position.y = 0.8;
        animal.add(body);
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.8, 0.8), bodyMat);
        head.position.set(0, 1.2, 1.2);
        animal.add(head);
        const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.15, 0.8, 6), bodyMat);
        trunk.position.set(0, 0.8, 1.6);
        trunk.rotation.x = Math.PI / 2;
        animal.add(trunk);
        [-0.5, 0.5].forEach(ex => {
          const ear = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.6, 0.4), bodyMat);
          ear.position.set(ex, 1.3, 1.0);
          animal.add(ear);
        });
      } else if (type === 1) {
        // Giraffe
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xDAA520, roughness: 0.7 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.0, 1.5), bodyMat);
        body.position.y = 1.5;
        animal.add(body);
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.2, 2.0, 6), bodyMat);
        neck.position.set(0, 2.8, 0.5);
        animal.add(neck);
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.4, 0.6), bodyMat);
        head.position.set(0, 3.8, 0.5);
        animal.add(head);
        const spotMat = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        for (let i = 0; i < 4; i++) {
          const spot = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.2, 0.2), spotMat);
          spot.position.set(0, 1.2 + i * 0.3, 0);
          animal.add(spot);
        }
      } else if (type === 2) {
        // Zebra
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, roughness: 0.7 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.9, 1.4), bodyMat);
        body.position.y = 0.8;
        animal.add(body);
        const stripeMat = new THREE.MeshStandardMaterial({ color: 0x000000 });
        for (let i = 0; i < 3; i++) {
          const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.72, 0.15, 1.42), stripeMat);
          stripe.position.set(0, 0.5 + i * 0.3, 0);
          animal.add(stripe);
        }
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.6), bodyMat);
        head.position.set(0, 1.3, 0.8);
        animal.add(head);
      } else if (type === 3) {
        // Lion
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0xDAA520, roughness: 0.7 });
        const body = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.8, 1.6), bodyMat);
        body.position.y = 0.6;
        animal.add(body);
        const maneMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.9 });
        const mane = new THREE.Mesh(new THREE.SphereGeometry(0.5, 8, 8), maneMat);
        mane.position.set(0, 1.0, 0.9);
        animal.add(mane);
        const head = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), bodyMat);
        head.position.set(0, 1.0, 1.0);
        animal.add(head);
      } else {
        // Monkey
        const bodyMat = new THREE.MeshStandardMaterial({ color: 0x8B4513, roughness: 0.8 });
        const body = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 8), bodyMat);
        body.position.y = 0.5;
        animal.add(body);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), bodyMat);
        head.position.set(0, 0.8, 0.1);
        animal.add(head);
      }

      group.add(animal);
    }

    // ----------------------------------------------------------------------
    // EVENTS & KEYBOARD HANDLING
    // ----------------------------------------------------------------------
    bindEvents() {
      window.addEventListener('resize', () => this.onWindowResize());

      window.addEventListener('keydown', (e) => {
        if (this.state !== 'RUNNING' && this.state !== 'READY' && this.state !== 'GAMEOVER') return;

        const code = e.code;
        if (this.keysPressed[code]) return;
        this.keysPressed[code] = true;

        this.handleKeyPress(code, e);
      });

      window.addEventListener('keyup', (e) => {
        this.keysPressed[e.code] = false;
      });

      window.addEventListener('blur', () => {
        if (this.state === 'RUNNING' || this.state === 'COUNTDOWN') {
          this.pause();
        }
      });

      // Touch controls for mobile
      this.bindTouchControls();

      // Helper to bind both click and touch for iOS compatibility
      const bindBtn = (id, handler) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('click', handler);
        el.addEventListener('touchend', (e) => {
          e.preventDefault();
          handler();
        });
      };

      bindBtn('btn-start-game', () => this.startCountdown());
      bindBtn('btn-exit-game', () => this.exitToHome());
      bindBtn('btn-game-pause', () => this.pause());
      bindBtn('btn-game-mute', () => this.toggleMute());
      bindBtn('btn-resume-game', () => this.resume());
      bindBtn('btn-restart-game', () => this.resetAndStart());
      bindBtn('btn-pause-home', () => this.exitToHome());
      bindBtn('btn-retry-game', () => this.resetAndStart());
      bindBtn('btn-gameover-home', () => this.exitToHome());
    }

    bindTouchControls() {
      const canvas = this.canvas;
      if (!canvas) return;

      // Prevent default touch behaviors on game view
      document.getElementById('game-view').addEventListener('touchmove', (e) => {
        if (this.state === 'RUNNING') e.preventDefault();
      }, { passive: false });

      document.getElementById('game-view').addEventListener('touchstart', (e) => {
        if (this.state === 'RUNNING') e.preventDefault();
      }, { passive: false });

      // Prevent double-tap zoom
      document.getElementById('game-view').addEventListener('dblclick', (e) => {
        e.preventDefault();
      });

      let touchStartX = 0;
      let touchStartY = 0;
      let touchStartTime = 0;

      canvas.addEventListener('touchstart', (e) => {
        if (this.state !== 'RUNNING') return;
        e.preventDefault();
        const touch = e.touches[0];
        touchStartX = touch.clientX;
        touchStartY = touch.clientY;
        touchStartTime = Date.now();
      }, { passive: false });

      canvas.addEventListener('touchend', (e) => {
        if (this.state !== 'RUNNING') return;
        e.preventDefault();
        const touch = e.changedTouches[0];
        const dx = touch.clientX - touchStartX;
        const dy = touch.clientY - touchStartY;
        const dt = Date.now() - touchStartTime;

        const minSwipe = 30;
        const maxTime = 500;

        if (dt > maxTime) return;

        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > minSwipe) {
          if (dx > 0) {
            if (this.targetLane < LANES.length - 1) this.targetLane++;
          } else {
            if (this.targetLane > 0) this.targetLane--;
          }
        } else if (Math.abs(dy) > minSwipe) {
          if (dy < 0) {
            if (!this.isJumping && !this.isSliding) {
              this.isJumping = true;
              this.jumpTimer = 0;
              audio.playJump();
            }
          } else {
            if (!this.isSliding && !this.isJumping) {
              this.isSliding = true;
              this.slideTimer = 0;
              audio.playSlide();
            }
          }
        }
      }, { passive: false });

      // On-screen touch buttons
      const btnLeft = document.getElementById('btn-touch-left');
      const btnRight = document.getElementById('btn-touch-right');
      const btnJump = document.getElementById('btn-touch-jump');
      const btnSlide = document.getElementById('btn-touch-slide');

      if (btnLeft) {
        btnLeft.addEventListener('touchstart', (e) => {
          e.preventDefault();
          if (this.state === 'RUNNING' && this.targetLane > 0) this.targetLane--;
        }, { passive: false });
      }
      if (btnRight) {
        btnRight.addEventListener('touchstart', (e) => {
          e.preventDefault();
          if (this.state === 'RUNNING' && this.targetLane < LANES.length - 1) this.targetLane++;
        }, { passive: false });
      }
      if (btnJump) {
        btnJump.addEventListener('touchstart', (e) => {
          e.preventDefault();
          if (this.state === 'RUNNING' && !this.isJumping && !this.isSliding) {
            this.isJumping = true;
            this.jumpTimer = 0;
            audio.playJump();
          }
        }, { passive: false });
      }
      if (btnSlide) {
        btnSlide.addEventListener('touchstart', (e) => {
          e.preventDefault();
          if (this.state === 'RUNNING' && !this.isSliding && !this.isJumping) {
            this.isSliding = true;
            this.slideTimer = 0;
            audio.playSlide();
          }
        }, { passive: false });
      }
    }

    handleKeyPress(code, event) {
      if (this.state === 'READY' || this.state === 'GAMEOVER') {
        if (code === 'Enter' || code === 'NumpadEnter' || code === 'Space') {
          if (event) event.preventDefault();
          this.resetAndStart();
          return;
        }
      }

      if (this.state === 'RUNNING') {
        if (code === 'Escape') {
          this.pause();
          return;
        }

        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(code)) {
          if (event) event.preventDefault();
        }

        if (code === 'ArrowLeft' || code === 'KeyA') {
          if (this.targetLane > 0) this.targetLane--;
        }

        if (code === 'ArrowRight' || code === 'KeyD') {
          if (this.targetLane < LANES.length - 1) this.targetLane++;
        }

        if (code === 'ArrowUp' || code === 'KeyW' || code === 'Space') {
          if (!this.isJumping && !this.isSliding) {
            this.isJumping = true;
            this.jumpTimer = 0;
            audio.playJump();
          }
        }

        if (code === 'ArrowDown' || code === 'KeyS') {
          if (!this.isSliding && !this.isJumping) {
            this.isSliding = true;
            this.slideTimer = 0;
            audio.playSlide();
          }
        }
      } else if (this.state === 'PAUSED') {
        if (code === 'Escape') {
          this.resume();
        }
      }
    }

    onWindowResize() {
      if (!this.camera || !this.renderer) return;
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    toggleMute() {
      const isMuted = audio.toggleMute();
      this.updateMuteIcon();
    }

    updateMuteIcon() {
      const btn = this.btnMute;
      if (!btn) return;
      btn.style.opacity = audio.muted ? '0.5' : '1.0';
    }

    // ----------------------------------------------------------------------
    // GAME LIFECYCLE
    // ----------------------------------------------------------------------
    open() {
      this.container.classList.add('active');
      this.state = 'READY';
      this.showOverlay(this.overlayReady);
      this.resetSimulation();
      this.updateCharacterHUD();
      this.startRenderLoop();
    }

    exitToHome() {
      this.state = 'IDLE';
      this.container.classList.remove('active');
      this.hideAllOverlays();
      if (this.animId) {
        cancelAnimationFrame(this.animId);
        this.animId = null;
      }
    }

    startCountdown() {
      this.state = 'COUNTDOWN';
      this.hideAllOverlays();
      this.overlayCountdown.style.display = 'block';

      let count = 3;
      this.overlayCountdown.textContent = count;
      audio.playBeep(false);

      const timer = setInterval(() => {
        count--;
        if (count > 0) {
          this.overlayCountdown.textContent = count;
          audio.playBeep(false);
        } else if (count === 0) {
          this.overlayCountdown.textContent = 'GO!';
          audio.playBeep(true);
        } else {
          clearInterval(timer);
          this.overlayCountdown.style.display = 'none';
          this.state = 'RUNNING';

          setTimeout(() => {
            if (this.hudHint) this.hudHint.style.opacity = '0';
          }, 5000);
        }
      }, 700);
    }

    pause() {
      if (this.state !== 'RUNNING') return;
      this.state = 'PAUSED';
      this.showOverlay(this.overlayPause);
    }

    resume() {
      if (this.state !== 'PAUSED') return;
      this.hideAllOverlays();
      this.startCountdown();
    }

    resetAndStart() {
      this.resetSimulation();
      this.startCountdown();
    }

    resetSimulation() {
      this.currentLane = 1;
      this.targetLane = 1;
      this.playerX = LANES[1];
      this.playerY = 0;
      this.playerZ = 0;

      this.isJumping = false;
      this.jumpTimer = 0;
      this.isSliding = false;
      this.slideTimer = 0;

      this.distance = 0;
      this.coinsCollected = 0;
      this.score = 0;
      this.speed = STARTING_SPEED;
      this.elapsedActiveTime = 0;
      this.nextSpawnZ = -25;

      this.powerups = { magnet: 0, shield: false, mult2x: 0, hover: 0 };
      this.shieldRechargeTimer = 0;

      // TITAN REX: Start with shield
      if (this.characterPerks.startWithShield) {
        this.powerups.shield = true;
      }
      this.updatePowerupHUD();

      this.obstacles.forEach(o => this.scene.remove(o.mesh));
      this.obstacles = [];

      this.coins.forEach(c => this.scene.remove(c.mesh));
      this.coins = [];

      this.powerupItems.forEach(p => this.scene.remove(p.mesh));
      this.powerupItems = [];

      this.particles.forEach(p => this.scene.remove(p.mesh));
      this.particles = [];

      this.hudScore.textContent = '000000';
      this.hudDistance.textContent = '0.0 m';
      this.hudCoins.textContent = '0';
      if (this.hudHint) this.hudHint.style.opacity = '1';

      this.updatePlayerTransform();
    }

    showOverlay(target) {
      this.hideAllOverlays();
      if (target) target.classList.add('active');
    }

    hideAllOverlays() {
      [this.overlayReady, this.overlayPause, this.overlayGameOver].forEach(el => {
        if (el) el.classList.remove('active');
      });
      this.overlayCountdown.style.display = 'none';
    }

    // ----------------------------------------------------------------------
    // MAIN GAME LOOP & INFINITE SIMULATION
    // ----------------------------------------------------------------------
    startRenderLoop() {
      if (this.animId) cancelAnimationFrame(this.animId);
      this.lastTime = performance.now();

      const loop = (timestamp) => {
        const delta = Math.min((timestamp - this.lastTime) / 1000, 0.1);
        this.lastTime = timestamp;

        if (this.state === 'RUNNING') {
          this.updateSimulation(delta);
        }

        this.render();
        this.animId = requestAnimationFrame(loop);
      };

      this.animId = requestAnimationFrame(loop);
    }

    updateSimulation(delta) {
      this.elapsedActiveTime += delta;
      const speedMult = this.characterPerks.speedMultiplier || 1;
      this.speed = Math.min((STARTING_SPEED + this.elapsedActiveTime * SPEED_ACCEL) * speedMult, MAX_SPEED * speedMult);

      // Power-up Timers
      if (this.powerups.magnet > 0) this.powerups.magnet -= delta;
      if (this.powerups.mult2x > 0) this.powerups.mult2x -= delta;
      if (this.powerups.hover > 0) this.powerups.hover -= delta;

      // TITAN REX: Shield recharge
      if (this.characterPerks.shieldRecharge && !this.powerups.shield) {
        this.shieldRechargeTimer += delta;
        if (this.shieldRechargeTimer >= this.characterPerks.shieldRecharge) {
          this.powerups.shield = true;
          this.shieldRechargeTimer = 0;
          audio.playPowerup();
        }
      }
      this.updatePowerupHUD();

      const mult = this.powerups.mult2x > 0 ? 2 : 1;
      const distMult = this.characterPerks.distanceMultiplier || 1;
      const moveDistance = this.speed * delta;
      this.distance += moveDistance * mult * distMult;
      const scoreMult = this.characterPerks.scoreMultiplier || 1;
      this.score = Math.floor((this.distance + (this.coinsCollected * 10 * mult)) * scoreMult);

      this.hudScore.textContent = String(this.score).padStart(6, '0');
      this.hudDistance.textContent = `${this.distance.toFixed(1)} m`;

      // 1. Lane Switch Lerp
      const targetX = LANES[this.targetLane];
      this.playerX += (targetX - this.playerX) * Math.min(LANE_CHANGE_SPEED * delta, 1.0);

      // 2. Jump Physics or Hoverboard
      if (this.powerups.hover > 0) {
        this.playerY = 1.6;
      } else if (this.isJumping) {
        this.jumpTimer += delta;
        const progress = this.jumpTimer / JUMP_DURATION;
        if (progress >= 1.0) {
          this.isJumping = false;
          this.playerY = 0;
        } else {
          this.playerY = 4 * JUMP_HEIGHT * progress * (1 - progress);
        }
      } else {
        this.playerY = 0;
      }

      // 3. Slide Physics
      if (this.isSliding) {
        this.slideTimer += delta;
        if (this.slideTimer >= SLIDE_DURATION) {
          this.isSliding = false;
        }
      }

      // 4. Running Stride Animation
      this.runAnimTime += delta * this.speed * 1.2;
      const legAngle = Math.sin(this.runAnimTime) * 0.6;
      if (this.leftLeg && this.rightLeg && !this.isJumping && !this.isSliding) {
        this.leftLeg.rotation.x = legAngle;
        this.rightLeg.rotation.x = -legAngle;
        this.leftArm.rotation.x = -legAngle;
        this.rightArm.rotation.x = legAngle;
      } else {
        this.leftLeg.rotation.x = 0;
        this.rightLeg.rotation.x = 0;
        this.leftArm.rotation.x = 0;
        this.rightArm.rotation.x = 0;
      }

      this.updatePlayerTransform();

      // 5. Endless Track Recycling
      this.updateEndlessTrackRecycling(moveDistance);

      // 6. TRULY INFINITE CONTINUOUS PROCEDURAL SPAWNING FIX!
      // Move nextSpawnZ forward by moveDistance as the world advances!
      this.nextSpawnZ += moveDistance;
      this.updateProceduralSpawning();

      // 7. World Objects & Collision
      this.updateWorldObjects(moveDistance, delta);
    }

    updatePlayerTransform() {
      if (!this.playerMesh) return;
      this.playerMesh.position.set(this.playerX, this.playerY, this.playerZ);

      if (this.shadowMesh) {
        this.shadowMesh.position.set(this.playerX, 0.02, this.playerZ);
        const scale = Math.max(0.4, 1.2 - this.playerY * 0.25);
        this.shadowMesh.scale.set(scale, scale, scale);
      }

      if (this.shieldMesh) {
        this.shieldMesh.visible = this.powerups.shield;
        if (this.powerups.shield) {
          this.shieldMesh.rotation.y += 0.05;
        }
      }

      // Billboard: rotate sprite plane to always face the camera
      if (this.spritePlane && this.camera) {
        // Face toward camera on Y-axis only, keeping character upright
        const dir = new THREE.Vector3();
        dir.subVectors(this.camera.position, this.playerMesh.position);
        dir.y = 0;
        dir.normalize();
        this.spritePlane.lookAt(
          this.playerMesh.position.x + dir.x,
          this.playerMesh.position.y + this.spritePlane.position.y,
          this.playerMesh.position.z + dir.z
        );

        // Slide: squish the sprite downward
        if (this.isSliding) {
          this.spritePlane.scale.set(1.2, 0.55, 1.0);
          this.spritePlane.position.y = 0.72;
        } else {
          this.spritePlane.scale.set(1.0, 1.0, 1.0);
          this.spritePlane.position.y = 1.3;
        }
        // No scale on playerMesh itself for sprites
        this.playerMesh.scale.set(1.0, 1.0, 1.0);
      } else {
        // 3D geometry mode — squash the whole group for slide
        if (this.isSliding) {
          this.playerMesh.scale.set(1.1, 0.45, 1.0);
        } else {
          this.playerMesh.scale.set(1.0, 1.0, 1.0);
        }
      }

      // Zephyr Void: spin the rune orb
      if (this.zephyrRune) {
        this.zephyrRune.rotation.y += 0.08;
        this.zephyrRune.rotation.x += 0.04;
      }
    }


    updateEndlessTrackRecycling(moveDistance) {
      let minZ = 0;
      this.trackSegments.forEach(seg => {
        if (seg.position.z < minZ) minZ = seg.position.z;
      });

      this.trackSegments.forEach(seg => {
        seg.position.z += moveDistance;
        if (seg.position.z > 20) {
          seg.position.z = minZ - 20;
        }
      });
    }

    // ----------------------------------------------------------------------
    // TRULY INFINITE CONTINUOUS PROCEDURAL SPAWNING
    // ----------------------------------------------------------------------
    updateProceduralSpawning() {
      // Continuously fill forward vision (z > -220) with obstacle rows every SPAWN_ROW_SPACING (11 units)!
      while (this.nextSpawnZ > -220) {
        this.spawnObstaclePattern(this.nextSpawnZ);

        // 25% Chance to spawn a Power-up Item
        if (Math.random() < 0.25) {
          const powerTypes = [TYPE_POWER_MAGNET, TYPE_POWER_SHIELD, TYPE_POWER_2X, TYPE_POWER_HOVER];
          const chosenPower = powerTypes[Math.floor(Math.random() * powerTypes.length)];
          const openLane = LANES[Math.floor(Math.random() * 3)];
          this.spawnPowerupItem(chosenPower, openLane, this.nextSpawnZ - 5);
        }

        // Advance spawn marker further into the distance by row spacing
        this.nextSpawnZ -= SPAWN_ROW_SPACING;
      }
    }

    spawnObstaclePattern(zPos) {
      const pattern = OBSTACLE_PATTERNS[Math.floor(Math.random() * OBSTACLE_PATTERNS.length)];

      for (let i = 0; i < 3; i++) {
        const type = pattern[i];
        const xPos = LANES[i];

        if (type === TYPE_TRAIN_INCOMING) {
          this.spawnIncomingTrain(xPos, zPos);
        } else if (type === TYPE_DRONE_INCOMING) {
          this.spawnIncomingDrone(xPos, zPos);
        } else if (type === TYPE_BARREL_INCOMING) {
          this.spawnIncomingBarrel(xPos, zPos);
        } else if (type === TYPE_TRAM) {
          this.spawnGreenTram(xPos, zPos);
        } else if (type === TYPE_CAR) {
          this.spawnSportsCar(xPos, zPos);
        } else if (type === TYPE_ANIMAL) {
          this.spawnStreetAnimal(xPos, zPos);
        } else if (type === TYPE_LOW) {
          this.spawnLowBarricade(xPos, zPos);
        } else if (type === TYPE_GATE) {
          this.spawnOverheadGate(xPos, zPos);
        } else {
          this.spawnCoinTrail(xPos, zPos, 3);
        }
      }
    }

    spawnIncomingTrain(x, z) {
      const group = new THREE.Group();
      group.position.set(x, 0, z);

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 2.7, 6.5),
        new THREE.MeshStandardMaterial({ color: 0x821033, roughness: 0.3, metalness: 0.7 })
      );
      body.position.y = 1.35;
      group.add(body);

      const grille = new THREE.Mesh(
        new THREE.BoxGeometry(2.15, 0.4, 0.2),
        new THREE.MeshBasicMaterial({ color: 0xFF145B })
      );
      grille.position.set(0, 0.8, 3.26);
      group.add(grille);

      [-0.6, 0.6].forEach(lx => {
        const light = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), new THREE.MeshBasicMaterial({ color: 0xFF145B }));
        light.position.set(lx, 1.4, 3.26);
        group.add(light);
      });

      this.scene.add(group);
      audio.playTrainHorn();
      this.obstacles.push({ type: TYPE_TRAIN_INCOMING, x, z, mesh: group, bounds: new THREE.Box3(), isMoving: true, moveSpeed: 12 });
    }

    spawnIncomingDrone(x, z) {
      const group = new THREE.Group();
      group.position.set(x, 1.4, z);

      const body = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.6),
        new THREE.MeshStandardMaterial({ color: 0x168DAB, roughness: 0.2 })
      );
      group.add(body);

      const eye = new THREE.Mesh(
        new THREE.SphereGeometry(0.3, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xFF145B })
      );
      eye.position.z = 0.4;
      group.add(eye);

      this.scene.add(group);
      this.obstacles.push({ type: TYPE_DRONE_INCOMING, x, z, mesh: group, bounds: new THREE.Box3(), isMoving: true, moveSpeed: 10 });
    }

    spawnIncomingBarrel(x, z) {
      const group = new THREE.Group();
      group.position.set(x, 0.45, z);

      const barrel = new THREE.Mesh(
        new THREE.CylinderGeometry(0.45, 0.45, 1.6, 12),
        new THREE.MeshStandardMaterial({ color: 0xE84936, roughness: 0.6 })
      );
      barrel.rotation.z = Math.PI / 2;
      group.add(barrel);

      this.scene.add(group);
      this.obstacles.push({ type: TYPE_BARREL_INCOMING, x, z, mesh: group, bounds: new THREE.Box3(), isMoving: true, moveSpeed: 8 });
    }

    spawnGreenTram(x, z) {
      const group = new THREE.Group();
      group.position.set(x, 0, z);

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(2.1, 2.6, 6.0),
        new THREE.MeshStandardMaterial({ color: 0x79B34C, roughness: 0.4 })
      );
      body.position.y = 1.3;
      group.add(body);

      const roof = new THREE.Mesh(
        new THREE.BoxGeometry(2.15, 0.3, 6.05),
        new THREE.MeshStandardMaterial({ color: 0xF5E6D3, roughness: 0.5 })
      );
      roof.position.y = 2.75;
      group.add(roof);

      this.scene.add(group);
      this.obstacles.push({ type: TYPE_TRAM, x, z, mesh: group, bounds: new THREE.Box3(), isMoving: false });
    }

    spawnSportsCar(x, z) {
      const group = new THREE.Group();
      group.position.set(x, 0, z);

      const carColors = [0xE84936, 0x168DAB, 0xFFD82E, 0x821033];
      const color = carColors[Math.floor(Math.random() * carColors.length)];

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(1.9, 0.9, 4.0),
        new THREE.MeshStandardMaterial({ color, roughness: 0.3, metalness: 0.6 })
      );
      body.position.y = 0.55;
      group.add(body);

      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(1.6, 0.75, 2.2),
        new THREE.MeshStandardMaterial({ color: 0x100E18, roughness: 0.2 })
      );
      cabin.position.set(0, 1.25, -0.2);
      group.add(cabin);

      this.scene.add(group);
      this.obstacles.push({ type: TYPE_CAR, x, z, mesh: group, bounds: new THREE.Box3(), isMoving: false });
    }

    spawnStreetAnimal(x, z) {
      const group = new THREE.Group();
      group.position.set(x, 0, z);

      const body = new THREE.Mesh(
        new THREE.BoxGeometry(0.7, 0.6, 1.2),
        new THREE.MeshStandardMaterial({ color: 0xC58236, roughness: 0.7 })
      );
      body.position.y = 0.55;
      group.add(body);

      const head = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 0.5),
        new THREE.MeshStandardMaterial({ color: 0x8F5D2D, roughness: 0.7 })
      );
      head.position.set(0, 0.9, 0.6);
      group.add(head);

      this.scene.add(group);
      this.obstacles.push({ type: TYPE_ANIMAL, x, z, mesh: group, bounds: new THREE.Box3(), isMoving: false });
    }

    spawnLowBarricade(x, z) {
      const group = new THREE.Group();
      group.position.set(x, 0, z);

      const board = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.7, 0.2),
        new THREE.MeshStandardMaterial({ color: 0xE84936, roughness: 0.5 })
      );
      board.position.y = 0.45;
      group.add(board);

      this.scene.add(group);
      this.obstacles.push({ type: TYPE_LOW, x, z, mesh: group, bounds: new THREE.Box3(), isMoving: false });
    }

    spawnOverheadGate(x, z) {
      const group = new THREE.Group();
      group.position.set(x, 0, z);

      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 0.5, 0.3),
        new THREE.MeshStandardMaterial({ color: 0xF79025 })
      );
      bar.position.set(0, 2.3, 0);
      group.add(bar);

      [-1.1, 1.1].forEach(px => {
        const pole = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.6, 0.2), new THREE.MeshStandardMaterial({ color: 0x355A65 }));
        pole.position.set(px, 1.3, 0);
        group.add(pole);
      });

      this.scene.add(group);
      this.obstacles.push({ type: TYPE_GATE, x, z, mesh: group, bounds: new THREE.Box3(), isMoving: false });
    }

    spawnPowerupItem(pType, x, z) {
      const group = new THREE.Group();
      group.position.set(x, 1.4, z);

      let color = 0xFFD82E;
      if (pType === TYPE_POWER_MAGNET) color = 0xFF145B;
      if (pType === TYPE_POWER_SHIELD) color = 0x00F0FF;
      if (pType === TYPE_POWER_2X) color = 0xFFD82E;
      if (pType === TYPE_POWER_HOVER) color = 0x79B34C;

      const orb = new THREE.Mesh(
        new THREE.IcosahedronGeometry(0.5, 1),
        new THREE.MeshBasicMaterial({ color, wireframe: true })
      );
      group.add(orb);

      const core = new THREE.Mesh(
        new THREE.SphereGeometry(0.25, 8, 8),
        new THREE.MeshBasicMaterial({ color: 0xFFFFFF })
      );
      group.add(core);

      this.scene.add(group);
      this.powerupItems.push({ pType, x, z, mesh: group, collected: false });
    }

    spawnCoinTrail(x, startZ, count) {
      for (let i = 0; i < count; i++) {
        const z = startZ - (i * 2.6);
        const group = new THREE.Group();
        group.position.set(x, 1.1, z);

        const coin = new THREE.Mesh(
          new THREE.CylinderGeometry(0.45, 0.45, 0.12, 16),
          new THREE.MeshStandardMaterial({ color: 0xFFD82E, metalness: 0.9, roughness: 0.15 })
        );
        coin.rotation.x = Math.PI / 2;
        group.add(coin);

        const rim = new THREE.Mesh(
          new THREE.TorusGeometry(0.43, 0.05, 8, 16),
          new THREE.MeshBasicMaterial({ color: 0xF49B08 })
        );
        group.add(rim);

        this.scene.add(group);
        this.coins.push({ x, z, mesh: group, collected: false, bobOffset: Math.random() * Math.PI * 2 });
      }
    }

    spawnCoinSparkles(x, y, z) {
      for (let i = 0; i < 8; i++) {
        const p = new THREE.Mesh(
          new THREE.BoxGeometry(0.1, 0.1, 0.1),
          new THREE.MeshBasicMaterial({ color: 0xFFF79A })
        );
        p.position.set(x, y, z);
        const vx = (Math.random() - 0.5) * 4;
        const vy = Math.random() * 3 + 1;
        const vz = (Math.random() - 0.5) * 4;
        this.scene.add(p);
        this.particles.push({ mesh: p, vx, vy, vz, life: 0.4 });
      }
    }

    updatePowerupHUD() {
      if (!this.hudPowerupBar) return;
      let html = '';
      if (this.powerups.magnet > 0) {
        html += `<div class="powerup-badge">🧲 MAGNET (${Math.ceil(this.powerups.magnet)}s)</div>`;
      }
      if (this.powerups.shield) {
        html += `<div class="powerup-badge" style="border-color: #00F0FF; color: #00F0FF;">🛡️ SHIELD ACTIVE</div>`;
      }
      if (this.powerups.mult2x > 0) {
        html += `<div class="powerup-badge" style="border-color: #FF145B; color: #FF145B;">⚡ 2X MULTIPLIER (${Math.ceil(this.powerups.mult2x)}s)</div>`;
      }
      if (this.powerups.hover > 0) {
        html += `<div class="powerup-badge" style="border-color: #79B34C; color: #79B34C;">🛹 HOVERBOARD (${Math.ceil(this.powerups.hover)}s)</div>`;
      }
      this.hudPowerupBar.innerHTML = html;
    }

    // ----------------------------------------------------------------------
    // WORLD OBJECT UPDATES & COLLISION DETECTION
    // ----------------------------------------------------------------------
    updateWorldObjects(moveDistance, delta) {
      // Player Bounding Box
      const playerHalfHeight = this.isSliding ? 0.35 : 0.9;
      const playerYCenter = this.playerY + playerHalfHeight;
      const pMin = new THREE.Vector3(this.playerX - 0.35, playerYCenter - playerHalfHeight, -0.3);
      const pMax = new THREE.Vector3(this.playerX + 0.35, playerYCenter + playerHalfHeight, 0.3);
      this.playerBox.set(pMin, pMax);

      // 1. Process Obstacles & Incoming Hazards
      for (let i = this.obstacles.length - 1; i >= 0; i--) {
        const obs = this.obstacles[i];

        const currentSpeed = obs.isMoving ? moveDistance + (obs.moveSpeed * delta) : moveDistance;
        obs.z += currentSpeed;
        obs.mesh.position.z = obs.z;

        if (obs.type === TYPE_TRAIN_INCOMING) {
          obs.bounds.set(
            new THREE.Vector3(obs.x - 1.0, 0, obs.z - 3.2),
            new THREE.Vector3(obs.x + 1.0, 2.7, obs.z + 3.2)
          );
        } else if (obs.type === TYPE_DRONE_INCOMING) {
          obs.bounds.set(
            new THREE.Vector3(obs.x - 0.6, 1.0, obs.z - 0.6),
            new THREE.Vector3(obs.x + 0.6, 1.8, obs.z + 0.6)
          );
        } else if (obs.type === TYPE_BARREL_INCOMING) {
          obs.mesh.rotation.x += 0.1;
          obs.bounds.set(
            new THREE.Vector3(obs.x - 0.8, 0, obs.z - 0.45),
            new THREE.Vector3(obs.x + 0.8, 0.9, obs.z + 0.45)
          );
        } else if (obs.type === TYPE_TRAM) {
          obs.bounds.set(
            new THREE.Vector3(obs.x - 1.0, 0, obs.z - 3.0),
            new THREE.Vector3(obs.x + 1.0, 2.6, obs.z + 3.0)
          );
        } else if (obs.type === TYPE_CAR) {
          obs.bounds.set(
            new THREE.Vector3(obs.x - 0.95, 0, obs.z - 2.0),
            new THREE.Vector3(obs.x + 0.95, 1.8, obs.z + 2.0)
          );
        } else if (obs.type === TYPE_ANIMAL) {
          obs.bounds.set(
            new THREE.Vector3(obs.x - 0.4, 0, obs.z - 0.6),
            new THREE.Vector3(obs.x + 0.4, 1.0, obs.z + 0.6)
          );
        } else if (obs.type === TYPE_LOW) {
          obs.bounds.set(
            new THREE.Vector3(obs.x - 1.0, 0, obs.z - 0.2),
            new THREE.Vector3(obs.x + 1.0, 0.8, obs.z + 0.2)
          );
        } else if (obs.type === TYPE_GATE) {
          obs.bounds.set(
            new THREE.Vector3(obs.x - 1.0, 1.8, obs.z - 0.2),
            new THREE.Vector3(obs.x + 1.0, 2.6, obs.z + 0.2)
          );
        }

        // Collision Check
        if (this.playerBox.intersectsBox(obs.bounds)) {
          if (this.powerups.shield) {
            this.powerups.shield = false;
            audio.playCrash();
            this.scene.remove(obs.mesh);
            this.obstacles.splice(i, 1);
            continue;
          }
          if (this.powerups.hover > 0 && (obs.type === TYPE_LOW || obs.type === TYPE_ANIMAL || obs.type === TYPE_BARREL_INCOMING)) {
            continue;
          }

          this.triggerGameOver();
          return;
        }

        if (obs.z > 10) {
          this.scene.remove(obs.mesh);
          this.obstacles.splice(i, 1);
        }
      }

      // 2. Process Power-up Items
      for (let i = this.powerupItems.length - 1; i >= 0; i--) {
        const item = this.powerupItems[i];
        item.z += moveDistance;
        item.mesh.position.z = item.z;
        item.mesh.rotation.y += 0.06;

        if (!item.collected) {
          const distToPlayer = Math.hypot(this.playerX - item.x, this.playerY + 0.8 - 1.4, item.z);
          if (distToPlayer < 1.2) {
            item.collected = true;
            audio.playPowerup();

            if (item.pType === TYPE_POWER_MAGNET) this.powerups.magnet = this.characterPerks.magnetDuration || 8;
            if (item.pType === TYPE_POWER_SHIELD) this.powerups.shield = true;
            if (item.pType === TYPE_POWER_2X) this.powerups.mult2x = 10;
            if (item.pType === TYPE_POWER_HOVER) this.powerups.hover = this.characterPerks.hoverDuration || 6;

            this.updatePowerupHUD();
            this.scene.remove(item.mesh);
            this.powerupItems.splice(i, 1);
            continue;
          }
        }

        if (item.z > 10) {
          this.scene.remove(item.mesh);
          this.powerupItems.splice(i, 1);
        }
      }

      // 3. Process Gold Coins & Coin Magnet
      for (let i = this.coins.length - 1; i >= 0; i--) {
        const coin = this.coins[i];
        coin.z += moveDistance;
        coin.mesh.rotation.y += 0.05;
        coin.mesh.position.y = 1.1 + Math.sin(this.elapsedActiveTime * 4 + coin.bobOffset) * 0.12;

        if (this.powerups.magnet > 0 && !coin.collected) {
          const magnetRange = this.characterPerks.magnetRange || 12;
          const distToPlayer = Math.hypot(this.playerX - coin.x, coin.z);
          if (distToPlayer < magnetRange) {
            coin.x += (this.playerX - coin.x) * 0.2;
            coin.z += (this.playerZ - coin.z) * 0.2;
          }
        }
        coin.mesh.position.x = coin.x;
        coin.mesh.position.z = coin.z;

        if (!coin.collected) {
          const distToPlayer = Math.hypot(this.playerX - coin.x, this.playerY + 0.8 - coin.mesh.position.y, coin.z);
          if (distToPlayer < 1.1) {
            coin.collected = true;
            const mult = (this.powerups.mult2x > 0 ? 2 : 1) * (this.characterPerks.coinMultiplier || 1);
            this.coinsCollected += mult;
            this.hudCoins.textContent = this.coinsCollected;
            audio.playCoin();
            this.spawnCoinSparkles(coin.x, coin.mesh.position.y, coin.z);
            this.scene.remove(coin.mesh);
            this.coins.splice(i, 1);
            continue;
          }
        }

        if (coin.z > 10) {
          this.scene.remove(coin.mesh);
          this.coins.splice(i, 1);
        }
      }

      // 4. Process Particles
      for (let i = this.particles.length - 1; i >= 0; i--) {
        const p = this.particles[i];
        p.life -= delta;
        p.mesh.position.x += p.vx * delta;
        p.mesh.position.y += p.vy * delta;
        p.mesh.position.z += p.vz * delta;

        if (p.life <= 0) {
          this.scene.remove(p.mesh);
          this.particles.splice(i, 1);
        }
      }
    }

    triggerGameOver() {
      this.state = 'GAMEOVER';
      audio.playCrash();

      this.canvas.style.filter = 'brightness(1.8) contrast(1.4)';
      setTimeout(() => {
        this.canvas.style.filter = 'none';
      }, 200);

      const bestKey = 'cyber_run_best_score';
      let currentBest = parseInt(localStorage.getItem(bestKey) || '0', 10);
      let isNewBest = false;

      if (this.score > currentBest) {
        currentBest = this.score;
        localStorage.setItem(bestKey, currentBest);
        isNewBest = true;
      }

      document.getElementById('results-score').textContent = this.score;
      document.getElementById('results-distance').textContent = `${this.distance.toFixed(1)} m`;
      document.getElementById('results-coins').textContent = this.coinsCollected;
      document.getElementById('results-best').textContent = currentBest;

      const newBestTag = document.getElementById('new-best-tag');
      if (newBestTag) {
        newBestTag.style.display = isNewBest ? 'block' : 'none';
      }

      this.showOverlay(this.overlayGameOver);
    }

    render() {
      if (!this.renderer || !this.scene || !this.camera) return;

      this.camera.position.x += (this.playerX * 0.35 - this.camera.position.x) * 0.1;
      this.camera.position.y += (4.5 + this.playerY * 0.25 - this.camera.position.y) * 0.1;
      this.camera.lookAt(this.playerX * 0.15, 1.2 + this.playerY * 0.15, -10);

      this.renderer.render(this.scene, this.camera);
    }
  }

  // Export engine instance globally
  window.addEventListener('DOMContentLoaded', () => {
    window.CyberRunGame = new RailwayRunnerEngine();
  });
})();
