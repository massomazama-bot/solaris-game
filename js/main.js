/* ==========================================================================
   CYBER OF X — Main Application & UI Navigation Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initWireframeGlobe();
  initNavigation();
  initModals();
  initSearch();
  initTrailerCanvas();
  initSocials();
  initCharacterSelection();
});

/* --------------------------------------------------------------------------
   3D Wireframe Globe for Bottom Statistics Strip
   -------------------------------------------------------------------------- */
function initWireframeGlobe() {
  const canvas = document.getElementById('globe-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.z = 2.5;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(56, 56);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // Outer wireframe sphere
  const geometry = new THREE.IcosahedronGeometry(1, 2);
  const material = new THREE.MeshBasicMaterial({
    color: 0xFF145B,
    wireframe: true,
    transparent: true,
    opacity: 0.85
  });
  const globe = new THREE.Mesh(geometry, material);
  scene.add(globe);

  // Inner glowing core
  const coreGeo = new THREE.IcosahedronGeometry(0.6, 1);
  const coreMat = new THREE.MeshBasicMaterial({
    color: 0x00F0FF,
    wireframe: true,
    transparent: true,
    opacity: 0.5
  });
  const core = new THREE.Mesh(coreGeo, coreMat);
  scene.add(core);

  function animate() {
    requestAnimationFrame(animate);
    globe.rotation.y += 0.012;
    globe.rotation.x += 0.005;
    core.rotation.y -= 0.018;
    renderer.render(scene, camera);
  }
  animate();
}

/* --------------------------------------------------------------------------
   Navigation & Page Routing
   -------------------------------------------------------------------------- */
function initNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const brandLogo = document.getElementById('nav-brand');
  const btnExplore = document.getElementById('btn-explore-now');
  const btnJoinUs = document.getElementById('btn-join-us');

  function setActiveNav(pageId) {
    navLinks.forEach(link => {
      if (link.dataset.page === pageId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      setActiveNav(page);

      if (page === 'games') {
        if (window.CyberRunGame) {
          window.CyberRunGame.open();
        }
      } else if (page === 'home') {
        closeAllModals();
        if (window.CyberRunGame) window.CyberRunGame.exitToHome();
      } else {
        openModal('modal-' + page);
      }
    });
  });

  if (brandLogo) {
    brandLogo.addEventListener('click', () => {
      setActiveNav('home');
      closeAllModals();
      if (window.CyberRunGame) window.CyberRunGame.exitToHome();
    });
  }

  if (btnExplore) {
    btnExplore.addEventListener('click', () => {
      openModal('modal-marketplace');
      setActiveNav('marketplace');
    });
  }

  if (btnJoinUs) {
    btnJoinUs.addEventListener('click', () => {
      openModal('modal-join');
    });
  }

  const btnStatsNext = document.getElementById('btn-stats-next');
  if (btnStatsNext) {
    btnStatsNext.addEventListener('click', () => {
      openModal('modal-community');
      setActiveNav('community');
    });
  }
}

/* --------------------------------------------------------------------------
   Modal Windows Manager
   -------------------------------------------------------------------------- */
function openModal(modalId) {
  closeAllModals();
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('active');
    if (modalId === 'modal-trailer' && window.startTrailerAnimation) {
      window.startTrailerAnimation();
    }
  }
}

function closeAllModals() {
  const modals = document.querySelectorAll('.modal-overlay');
  modals.forEach(m => m.classList.remove('active'));
  if (window.stopTrailerAnimation) window.stopTrailerAnimation();
}

function initModals() {
  const closeBtns = document.querySelectorAll('[data-close]');
  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => closeAllModals());
  });

  const overlays = document.querySelectorAll('.modal-overlay');
  overlays.forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeAllModals();
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-overlay.active');
      if (activeModal) closeAllModals();
    }
  });

  const btnWatchTrailer = document.getElementById('btn-watch-trailer');
  if (btnWatchTrailer) {
    btnWatchTrailer.addEventListener('click', () => openModal('modal-trailer'));
  }

  const joinForm = document.getElementById('join-form');
  if (joinForm) {
    joinForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('WELCOME PILOT! Your callsign has been registered to the Cyber Grid.');
      closeAllModals();
    });
  }
}

/* --------------------------------------------------------------------------
   Search Bar Functionality
   -------------------------------------------------------------------------- */
function initSearch() {
  const searchInput = document.getElementById('search-input');
  if (!searchInput) return;

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim().toLowerCase();
      if (!query) return;

      if (query.includes('game') || query.includes('run') || query.includes('play')) {
        if (window.CyberRunGame) window.CyberRunGame.open();
      } else if (query.includes('market') || query.includes('skin') || query.includes('buy')) {
        openModal('modal-marketplace');
      } else if (query.includes('about') || query.includes('lore')) {
        openModal('modal-about');
      } else if (query.includes('community') || query.includes('discord')) {
        openModal('modal-community');
      } else {
        alert(`CYBER GRID SEARCH: No specific match for "${query}". Opening Marketplace.`);
        openModal('modal-marketplace');
      }
      searchInput.value = '';
    }
  });
}

/* --------------------------------------------------------------------------
   Interactive Cyber Trailer Canvas Renderer
   -------------------------------------------------------------------------- */
let trailerAnimId = null;
function initTrailerCanvas() {
  const canvas = document.getElementById('trailer-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let time = 0;
  function renderTrailer() {
    time += 0.03;
    const width = canvas.width;
    const height = canvas.height;

    // Dark background
    ctx.fillStyle = '#050507';
    ctx.fillRect(0, 0, width, height);

    // Synthwave Horizon Grid
    ctx.strokeStyle = '#FF145B';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x <= width; x += 40) {
      ctx.moveTo(x, height / 2);
      ctx.lineTo((x - width / 2) * 3 + width / 2, height);
    }
    const offset = (time * 40) % 20;
    for (let y = height / 2; y <= height; y += 15 + (y - height / 2) * 0.1) {
      ctx.moveTo(0, y + offset);
      ctx.lineTo(width, y + offset);
    }
    ctx.stroke();

    // Sun / Orb
    const grad = ctx.createLinearGradient(0, 50, 0, height / 2);
    grad.addColorStop(0, '#FF145B');
    grad.addColorStop(1, '#E8B3DF');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(width / 2, height / 2 - 20, 70, 0, Math.PI * 2);
    ctx.fill();

    // Text Overlay
    ctx.font = 'bold 36px Orbitron, sans-serif';
    ctx.fillStyle = '#F0EDF3';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#FF145B';
    ctx.shadowBlur = 15;
    ctx.fillText('CYBER RUN: THE NEXT HORIZON', width / 2, height / 2 - 120);
    ctx.shadowBlur = 0;

    ctx.font = '14px Rajdhani, sans-serif';
    ctx.fillStyle = '#00F0FF';
    ctx.fillText('PRESS GAMES IN NAVBAR TO PLAY LIVE NOW', width / 2, height - 30);

    trailerAnimId = requestAnimationFrame(renderTrailer);
  }

  window.startTrailerAnimation = () => {
    if (!trailerAnimId) renderTrailer();
  };
  window.stopTrailerAnimation = () => {
    if (trailerAnimId) {
      cancelAnimationFrame(trailerAnimId);
      trailerAnimId = null;
    }
  };
}

/* --------------------------------------------------------------------------
   Social Buttons
   -------------------------------------------------------------------------- */
function initSocials() {
  const socials = {
    'btn-twitter': 'https://x.com',
    'btn-discord': 'https://discord.com',
    'btn-instagram': 'https://instagram.com',
    'btn-youtube': 'https://youtube.com'
  };

  Object.keys(socials).forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        alert(`Connecting to CYBER OF X ${id.replace('btn-', '').toUpperCase()} feed...`);
      });
    }
  });
}

/* --------------------------------------------------------------------------
   Character Selection System
   -------------------------------------------------------------------------- */
function initCharacterSelection() {
  const charCards = document.querySelectorAll('.char-card');
  if (!charCards.length) return;

  // Set initial selected state from localStorage
  const savedChar = localStorage.getItem('cyber_run_char') || 'vex';
  charCards.forEach(card => {
    const charId = card.dataset.char;
    const btn = card.querySelector('.char-select-btn');
    if (charId === savedChar) {
      card.classList.add('selected');
      if (btn) btn.textContent = 'EQUIPPED';
    } else {
      card.classList.remove('selected');
      if (btn) btn.textContent = 'SELECT';
    }
  });

  charCards.forEach(card => {
    const selectChar = () => {
      const charId = card.dataset.char;
      if (!charId) return;

      // Update UI
      charCards.forEach(c => {
        c.classList.remove('selected');
        const b = c.querySelector('.char-select-btn');
        if (b) b.textContent = 'SELECT';
      });
      card.classList.add('selected');
      const btn = card.querySelector('.char-select-btn');
      if (btn) btn.textContent = 'EQUIPPED';

      // Apply to game engine
      if (window.CyberRunGame) {
        window.CyberRunGame.setCharacter(charId);
      }
    };

    card.addEventListener('click', selectChar);
    card.addEventListener('touchend', (e) => {
      e.preventDefault();
      selectChar();
    });
  });
}
