// ساده‌ترین منطق تعاملی برای نمای کلی پروژه
const state = {
  ce: 0,
  perTap: 1,
};

function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return document.querySelectorAll(sel); }

document.addEventListener('DOMContentLoaded', () => {
  // nav
  qsa('#main-nav .nav-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      qsa('#main-nav .nav-pill').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      const screen = btn.dataset.screen;
      qsa('main[id^="screen-"]').forEach(m=>m.classList.add('hidden'));
      const el = document.getElementById(screen);
      if (el) el.classList.remove('hidden');
    });
  });

  // clicker logic
  const ceDisplay = qs('#ce-display');
  const perTapDisplay = qs('#pertap-display');
  const tapArea = qs('#tap-area');
  const particleContainer = qs('#particle-container');
  const floatContainer = qs('#float-container');
  const avatarGallery = qs('#avatar-gallery-container');
  const formContainer = qs('#form-container');
  const tabGallery = qs('#tab-gallery');
  const tabCustom = qs('#tab-custom');
  const customView = qs('#custom-view');
  const galleryView = qs('#gallery-view');
  const searchQuery = qs('#search-query');
  const searchResults = qs('#search-results');
  const searchResultsGrid = qs('#search-results-grid');

  function updateUI() {
    ceDisplay.textContent = state.ce;
    perTapDisplay.textContent = `+${state.perTap}`;
  }

  function spawnFloat(x,y,txt) {
    const el = document.createElement('div');
    el.className = 'ce-float';
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.textContent = txt;
    floatContainer.appendChild(el);
    setTimeout(()=>el.remove(),900);
  }

  function spawnParticle(x,y) {
    const p = document.createElement('div');
    p.className = 'particle';
    p.style.left = x + 'px';
    p.style.top = y + 'px';
    // random direction
    const px = (Math.random()-0.5)*200 + 'px';
    const py = (Math.random()-1.0)*200 + 'px';
    p.style.setProperty('--px', px);
    p.style.setProperty('--py', py);
    particleContainer.appendChild(p);
    setTimeout(()=>p.remove(),700);
  }

  tapArea.addEventListener('pointerdown', (ev) => {
    // increment
    state.ce += state.perTap;
    updateUI();
    if (!floatContainer) return;
    const rect = floatContainer.getBoundingClientRect();
    const x = ev.clientX - rect.left;
    const y = ev.clientY - rect.top;
    spawnFloat(x,y,`+${state.perTap}`);
    for (let i=0;i<6;i++) spawnParticle(x + (Math.random()*40-20), y + (Math.random()*40-20));
  });

  // demo upgrades (increase perTap)
  qs('#btn-upgrade-tap')?.addEventListener('click', () => {
    state.perTap += 1;
    updateUI();
  });

  qs('#btn-upgrade-energy')?.addEventListener('click', () => {
    const energyText = qs('#energy-text');
    if (energyText) energyText.textContent = `${Math.min(500, parseInt(energyText.textContent) + 20)}/500`;
  });
  qs('#btn-upgrade-timer')?.addEventListener('click', () => {
    qs('#timer-text').textContent = 'تایمر سریع‌تر فعال شد';
  });

  // save profile (stores form to localStorage)
  qs('#save-btn')?.addEventListener('click', () => {
    const profile = {
      name: qs('#char-name')?.value || '',
      title: qs('#char-title')?.value || '',
      planet: qs('#char-planet')?.value || '',
      class: qs('#char-class')?.value || '',
    };
    localStorage.setItem('never_island_profile', JSON.stringify(profile));
    const msg = qs('#status-msg');
    if (msg) {
      msg.textContent = 'ذخیره شد.';
      msg.classList.remove('hidden');
      setTimeout(()=>msg.classList.add('hidden'),2000);
    }
  });

  // load saved
  const saved = localStorage.getItem('never_island_profile');
  if (saved) {
    try {
      const p = JSON.parse(saved);
      if (p.name) qs('#char-name').value = p.name;
      if (p.title) qs('#char-title').value = p.title;
      if (p.planet) qs('#char-planet').value = p.planet;
      if (p.class) qs('#char-class').value = p.class;
      qs('#clicker-char-name').textContent = p.name || '—';
    } catch(e){ /* ignore */ }
  }

  updateUI();

  // handle avatar gallery vs custom input toggle
  qs('#toggle-avatar-gallery')?.addEventListener('click', () => {
    if (avatarGallery) avatarGallery.classList.toggle('hidden');
  });
  qs('#toggle-form')?.addEventListener('click', () => {
    if (formContainer) formContainer.classList.toggle('hidden');
  });
  tabGallery?.addEventListener('click', () => {
    if (galleryView && customView) { galleryView.classList.remove('hidden'); customView.classList.add('hidden'); }
  });
  tabCustom?.addEventListener('click', () => {
    if (galleryView && customView) { galleryView.classList.add('hidden'); customView.classList.remove('hidden'); }
  });

  qs('#btn-load-custom-image')?.addEventListener('click', () => {
    const url = searchQuery?.value || qs('#custom-image-url')?.value;
    if (!url) return;
    const preview = qs('#custom-preview');
    const previewContainer = qs('#custom-preview-container');
    if (preview && previewContainer) {
      preview.src = url;
      previewContainer.classList.remove('hidden');
    }
  });

  // تلاش برای بارگذاری گالری محلی از public/assets (gallery-1.svg ... gallery-8.svg)
  const avatarsGrid = qs('#avatars-grid');
  if (avatarsGrid) {
    for (let i=1;i<=8;i++) {
      const img = new Image();
      const svgPath = `/assets/gallery-${i}.svg`;
      const pngPath = `/assets/gallery-${i}.png`;
      img.src = svgPath;
      img.alt = `avatar-${i}`;
      img.className = 'w-full h-14 object-cover rounded-lg cursor-pointer gallery-chip transition-all';
      img.onload = () => {
        const wrapper = document.createElement('div');
        wrapper.className = 'overflow-hidden rounded-lg';
        wrapper.appendChild(img);
        img.addEventListener('click', () => {
          const avatar = qs('[data-template-id="avatar-placeholder"]');
          if (avatar) avatar.src = svgPath;
        });
        avatarsGrid.appendChild(wrapper);
      };
      img.onerror = () => {
        const fallback = new Image();
        fallback.src = pngPath;
        fallback.alt = `avatar-${i}`;
        fallback.className = 'w-full h-14 object-cover rounded-lg cursor-pointer gallery-chip transition-all';
        fallback.onload = () => {
          const wrapper = document.createElement('div');
          wrapper.className = 'overflow-hidden rounded-lg';
          wrapper.appendChild(fallback);
          fallback.addEventListener('click', () => {
            const avatar = qs('[data-template-id="avatar-placeholder"]');
            if (avatar) avatar.src = pngPath;
          });
          avatarsGrid.appendChild(wrapper);
        };
      };
    }
  }
});
