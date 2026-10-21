(() => {
  const root = document.documentElement;
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const saveData = navigator.connection && navigator.connection.saveData;

  const ytEmbed = (id, params) =>
    `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?${new URLSearchParams(params)}`;
  const mutedLoop = id => ({
    autoplay: 1, mute: 1, controls: 0, loop: 1, playlist: id, playsinline: 1,
    rel: 0, modestbranding: 1, disablekb: 1, iv_load_policy: 3, fs: 0
  });

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (!reduceMotion && window.Lenis) {
    lenis = new Lenis({ lerp: 0.11, smoothWheel: true });
    const raf = t => { lenis.raf(t); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
  }

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const hash = a.getAttribute('href');
      const target = hash === '#top' ? 0 : document.querySelector(hash);
      if (target === null) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { duration: 1.2 });
      else if (target === 0) window.scrollTo({ top: 0 });
      else target.scrollIntoView();
    });
  });

  /* ---------- Nav state ---------- */
  const nav = document.querySelector('.nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Hero entrance ---------- */
  let started = false;
  const start = () => { if (!started) { started = true; root.classList.add('is-loaded'); } };
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(start));
  setTimeout(start, 1200);

  /* ---------- Hero background reel ---------- */
  const reel = document.querySelector('.hero-reel');
  if (reel && !reduceMotion && !saveData) {
    if (reel.dataset.mp4) {
      const v = document.createElement('video');
      Object.assign(v, { src: reel.dataset.mp4, muted: true, loop: true, playsInline: true, autoplay: true });
      v.addEventListener('playing', () => reel.classList.add('is-playing'), { once: true });
      reel.appendChild(v);
      v.play().catch(() => {});
    } else if (reel.dataset.youtube) {
      const f = document.createElement('iframe');
      f.src = ytEmbed(reel.dataset.youtube, mutedLoop(reel.dataset.youtube));
      f.title = 'Showreel background';
      f.allow = 'autoplay; encrypted-media';
      f.tabIndex = -1;
      // Wait out YouTube's title overlay before fading in
      f.addEventListener('load', () => setTimeout(() => reel.classList.add('is-playing'), 2200), { once: true });
      reel.appendChild(f);
    }
  }

  /* ---------- Scroll reveals ---------- */
  document.querySelectorAll('[data-stagger]').forEach(group => {
    [...group.children].forEach((el, i) => el.style.setProperty('--i', i % 6));
  });
  const reveals = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    reveals.forEach(el => io.observe(el));
  }

  /* ---------- YouTube thumbnails: fall back when maxres is missing ---------- */
  document.querySelectorAll('img[src*="i.ytimg.com"]').forEach(img => {
    const fallback = () => {
      if (img.src.includes('maxresdefault')) img.src = img.src.replace('maxresdefault', 'hqdefault');
    };
    const check = () => { if (img.naturalWidth > 0 && img.naturalWidth <= 120) fallback(); };
    img.addEventListener('error', fallback);
    img.addEventListener('load', check);
    if (img.complete) img.naturalWidth === 0 ? fallback() : check();
  });

  /* ---------- Card hover previews ---------- */
  const cards = document.querySelectorAll('.card');
  const startPreview = card => {
    const link = card.querySelector('.card-link');
    const media = card.querySelector('.card-media');
    if (card.querySelector('.preview')) return;
    let el;
    if (link.dataset.preview) {
      el = document.createElement('video');
      Object.assign(el, { src: link.dataset.preview, muted: true, loop: true, playsInline: true });
      el.className = 'preview';
      el.addEventListener('playing', () => card.classList.add('is-playing'), { once: true });
      media.appendChild(el);
      el.play().catch(() => {});
    } else if (link.dataset.yt) {
      el = document.createElement('div');
      el.className = 'preview' + ('vertical' in link.dataset ? ' is-vertical' : '');
      const f = document.createElement('iframe');
      f.src = ytEmbed(link.dataset.yt, mutedLoop(link.dataset.yt));
      f.title = '';
      f.allow = 'autoplay; encrypted-media';
      f.tabIndex = -1;
      f.addEventListener('load', () => {
        card._t = setTimeout(() => card.classList.add('is-playing'), 900);
      }, { once: true });
      el.appendChild(f);
      media.appendChild(el);
    }
  };
  const stopPreview = card => {
    clearTimeout(card._t);
    card.classList.remove('is-playing');
    const el = card.querySelector('.preview');
    if (el) setTimeout(() => { if (!card.classList.contains('is-playing')) el.remove(); }, 450);
  };

  if (!reduceMotion && !saveData) {
    if (canHover) {
      cards.forEach(card => {
        const link = card.querySelector('.card-link');
        let delay;
        link.addEventListener('mouseenter', () => { delay = setTimeout(() => startPreview(card), 180); });
        link.addEventListener('mouseleave', () => { clearTimeout(delay); stopPreview(card); });
      });
    } else if ('IntersectionObserver' in window) {
      // Touch: autoplay only lightweight mp4 previews when a card is centred
      const touchIO = new IntersectionObserver(entries => {
        entries.forEach(en => (en.isIntersecting ? startPreview(en.target) : stopPreview(en.target)));
      }, { threshold: 0.7 });
      cards.forEach(card => { if (card.querySelector('[data-preview]')) touchIO.observe(card); });
    }
  }

  /* ---------- Media viewer ---------- */
  const modal = document.querySelector('.modal');
  const stage = modal.querySelector('.modal-stage');
  const openModal = html => {
    stage.innerHTML = html;
    modal.showModal();
    if (lenis) lenis.stop();
  };
  modal.addEventListener('close', () => {
    stage.innerHTML = '';
    modal.classList.remove('is-vertical');
    if (lenis) lenis.start();
  });
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
  modal.querySelector('.modal-close').addEventListener('click', () => modal.close());

  document.querySelectorAll('[data-yt]').forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const id = el.dataset.yt;
      modal.classList.toggle('is-vertical', 'vertical' in el.dataset);
      const title = (el.dataset.title || 'Video').replace(/"/g, '&quot;');
      openModal(`<iframe src="${ytEmbed(id, { autoplay: 1, rel: 0, modestbranding: 1, playsinline: 1 })}" title="${title}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen></iframe>`);
    });
  });
  document.querySelectorAll('[data-img]').forEach(el => {
    el.addEventListener('click', () => {
      const alt = (el.querySelector('img') || {}).alt || '';
      openModal(`<img src="${el.dataset.img}" alt="${alt.replace(/"/g, '&quot;')}">`);
    });
  });

  /* ---------- Page transitions (for links to other pages) ---------- */
  document.querySelectorAll('a[data-transition]').forEach(a => {
    a.addEventListener('click', e => {
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      root.classList.add('is-leaving');
      setTimeout(() => { location.href = a.href; }, reduceMotion ? 0 : 340);
    });
  });
  window.addEventListener('pageshow', e => { if (e.persisted) root.classList.remove('is-leaving'); });

  /* ---------- Footer ---------- */
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = new Date().getFullYear();
  const clock = document.querySelector('[data-clock]');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Kuala_Lumpur', hour: '2-digit', minute: '2-digit' });
    const tick = () => { clock.textContent = fmt.format(new Date()); };
    tick();
    setInterval(tick, 30000);
  }
})();
