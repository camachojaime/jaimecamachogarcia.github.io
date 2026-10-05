(() => {
  'use strict';
  const root = document.documentElement;
  const en = root.lang === 'en';
  const say = (es, english) => en ? english : es;
  const config = window.PORTFOLIO_CONFIG || {};
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.site-header');
  const topButton = document.querySelector('.back-top');
  const progress = document.querySelector('.scroll-progress');
  const menu = document.querySelector('.nav-links');
  const toggle = document.querySelector('.menu-toggle');
  const sections = [...document.querySelectorAll('main > section[id]')];
  const navLinks = [...document.querySelectorAll('.nav-links a[data-section]')];
  const desktop = matchMedia('(min-width: 992px)');
  const toast = document.querySelector('.toast-message');
  let toastTimer, framePending = false;

  function announce(message) {
    if (!toast) return;
    clearTimeout(toastTimer); toast.textContent = message; toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 4200);
  }
  function setMenu(open, focusToggle = false) {
    if (!toggle || !menu) return;
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', say(open ? 'Cerrar menú' : 'Abrir menú', open ? 'Close menu' : 'Open menu'));
    menu.classList.toggle('open', open);
    if (focusToggle) toggle.focus();
  }
  toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  document.querySelectorAll('.language, .menu-toggle').forEach(button => {
    button.title = button.getAttribute('aria-label') || '';
  });
  desktop.addEventListener('change', () => setMenu(false));
  document.addEventListener('click', event => { if (header && !header.contains(event.target)) setMenu(false); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') setMenu(false, true);
  });
  function updateScroll() {
    const y = window.scrollY, height = document.documentElement.scrollHeight - innerHeight;
    header?.classList.toggle('visible', y > 120 || document.body.classList.contains('subpage'));
    topButton?.classList.toggle('visible', y > 550);
    if (progress) progress.style.transform = `scaleX(${height > 0 ? Math.min(1, Math.max(0, y / height)) : 0})`;
    let active = '';
    const pivot = Math.min(innerHeight * .28, 220) + (header?.offsetHeight || 0);
    for (const section of sections) if (section.getBoundingClientRect().top <= pivot) active = section.id;
    if (height > 0 && y >= height - 8 && sections.length) active = sections[sections.length - 1].id;
    navLinks.forEach(link => {
      if (link.dataset.section === active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    framePending = false;
  }
  window.addEventListener('scroll', () => { if (!framePending) { framePending = true; requestAnimationFrame(updateScroll); } }, { passive: true });
  window.addEventListener('resize', updateScroll, { passive: true });
  window.addEventListener('load', updateScroll);
  updateScroll();
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      const id = link.getAttribute('href').slice(1); const target = document.getElementById(id);
      if (!target) return;
      event.preventDefault(); setMenu(false);
      target.scrollIntoView({ behavior: reduceMotion.matches ? 'instant' : 'smooth' });
      history.replaceState(null, '', '#' + id);
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  const systemTheme = matchMedia('(prefers-color-scheme: dark)');
  const choices = ['system', 'light', 'dark'];
  function applyTheme(choice) {
    root.dataset.themeChoice = choice;
    root.dataset.theme = choice === 'system' ? (systemTheme.matches ? 'dark' : 'light') : choice;
    document.querySelectorAll('[data-theme-toggle]').forEach(button => {
      const labels = {system: say('automático', 'automatic'), light: say('claro', 'light'), dark: say('oscuro', 'dark')};
      const next = choices[(choices.indexOf(choice) + 1) % choices.length];
      button.setAttribute('aria-label', say(`Tema ${labels[choice]}. Cambiar a ${labels[next]}`, `${labels[choice]} theme. Switch to ${labels[next]}`));
      button.title = button.getAttribute('aria-label');
      const use = button.querySelector('use');
      if (use) use.setAttribute('href', use.getAttribute('href').split('#')[0] + '#' + ({system:'display',light:'sun',dark:'moon'}[choice]));
    });
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', root.dataset.theme === 'dark' ? '#23262b' : '#e7e9ec');
  }
  applyTheme(root.dataset.themeChoice || 'system');
  document.querySelectorAll('[data-theme-toggle]').forEach(button => button.addEventListener('click', () => {
    const choice = choices[(choices.indexOf(root.dataset.themeChoice) + 1) % choices.length];
    try { localStorage.setItem('jc-theme', choice); } catch (_) {}
    applyTheme(choice);
  }));
  systemTheme.addEventListener('change', () => { if (root.dataset.themeChoice === 'system') applyTheme('system'); });

  const typed = document.querySelector('[data-typed]');
  if (typed && !reduceMotion.matches) {
    const phrases = say(['Software que resuelve problemas.', 'Electrónica que responde.', 'Ideas que se pueden probar.'], ['Software that solves problems.', 'Electronics that respond.', 'Ideas you can test.']);
    let phrase = 0, step = phrases[0].length, deleting = true, timer;
    function tick() {
      if (document.hidden || reduceMotion.matches) return;
      if (deleting) step--; else step++;
      typed.textContent = phrases[phrase].slice(0, Math.max(0, step));
      let delay = deleting ? 36 : 62;
      if (deleting && step <= 0) { deleting = false; phrase = (phrase + 1) % phrases.length; delay = 280; }
      if (!deleting && step >= phrases[phrase].length) { deleting = true; delay = 2600; }
      timer = setTimeout(tick, delay);
    }
    timer = setTimeout(tick, 2800);
    document.addEventListener('visibilitychange', () => { clearTimeout(timer); if (!document.hidden) timer = setTimeout(tick, 1000); });
    reduceMotion.addEventListener('change', () => { clearTimeout(timer); typed.textContent = phrases[0]; if (!reduceMotion.matches) timer = setTimeout(tick, 2800); });
  }

  function openDialog(dialog) {
    if (!dialog) return;
    dialog.showModal(); document.body.classList.add('modal-open');
  }
  document.querySelectorAll('dialog').forEach(dialog => {
    dialog.addEventListener('close', () => document.body.classList.remove('modal-open'));
    dialog.querySelector('[data-close-dialog]')?.addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  });
  document.querySelectorAll('[data-cv]').forEach(link => {
    if (config.cvAvailable) {
      link.href = document.body.dataset.root + config.cvPath;
      link.setAttribute('download', 'CV-JaimeCamachoGarcia.pdf');
    } else {
      link.setAttribute('aria-haspopup', 'dialog');
      link.addEventListener('click', event => { event.preventDefault(); openDialog(document.getElementById('cv-dialog')); });
    }
  });
  async function copyText(value) {
    try { if (!navigator.clipboard) throw new Error('Clipboard not available'); await navigator.clipboard.writeText(value); return true; }
    catch (_) {
      const area = document.createElement('textarea'); area.value = value; area.style.position = 'fixed'; area.style.top = '-999px';
      document.body.append(area); area.select(); let copied = false;
      try { copied = document.execCommand('copy'); } catch (_) {} area.remove(); return copied;
    }
  }
  document.querySelectorAll('[data-copy-email]').forEach(button => button.addEventListener('click', async () => {
    const copied = await copyText(config.email || '');
    announce(copied ? say('Correo copiado.', 'Email address copied.') : say('No se pudo copiar. Puedes seleccionar el correo visible.', 'Could not copy. You can select the visible email address.'));
  }));
  const form = document.querySelector('.contact-form');
  if (form) {
    const feedback = form.querySelector('.form-feedback');
    const buildMessage = () => {
      const data = new FormData(form);
      return { subject: `${String(data.get('subject')).replace(/[\r\n]/g, ' ')} · ${String(data.get('name')).replace(/[\r\n]/g, ' ')}`,
        body: `${say('Hola Jaime,','Hi Jaime,')}\n\n${data.get('message')}\n\n${data.get('name')}${data.get('email') ? '\n' + data.get('email') : ''}` };
    };
    form.addEventListener('submit', event => {
      event.preventDefault(); if (!form.reportValidity()) return;
      const message = buildMessage();
      window.location.href = `mailto:${config.email}?subject=${encodeURIComponent(message.subject)}&body=${encodeURIComponent(message.body)}`;
      feedback.textContent = say('Se ha solicitado abrir tu aplicación de correo. Revisa el borrador y envíalo desde allí. Si no se abre, usa «Copiar mensaje».', 'Your email app was requested. Review and send the draft there. If it does not open, use “Copy message”.');
    });
    form.querySelector('[data-copy-message]')?.addEventListener('click', async () => {
      if (!form.reportValidity()) return;
      const message = buildMessage(); const copied = await copyText(`${say('Para', 'To')}: ${config.email}\n${say('Asunto', 'Subject')}: ${message.subject}\n\n${message.body}`);
      feedback.textContent = copied ? say('Mensaje copiado. Pégalo en tu correo y envíalo cuando quieras.', 'Message copied. Paste it into your email app and send it when ready.') : say('No se pudo copiar. Selecciona el texto del formulario.', 'Could not copy. Select the text in the form.');
    });
  }

  const gallery = [...document.querySelectorAll('.media-carousel .carousel-item')];
  const lightbox = document.querySelector('#lightbox');
  let imageIndex = 0;
  function clearLightboxVideo() {
    lightbox?.querySelector('[data-lightbox-video-frame]')?.replaceChildren();
  }
  function showMedia(index) {
    if (!gallery.length || !lightbox) return;
    imageIndex = (index + gallery.length) % gallery.length;
    delete lightbox.dataset.standalone;
    const item = gallery[imageIndex];
    const imageButton = item.querySelector('.carousel-image');
    const videoButton = item.querySelector('.carousel-video');
    const wrap = lightbox.querySelector('.lightbox-image-wrap');
    const videoWrap = lightbox.querySelector('.lightbox-video-wrap');
    const frame = lightbox.querySelector('[data-lightbox-video-frame]');
    clearLightboxVideo();
    wrap?.classList.remove('zoomed');
    if (imageButton) {
      wrap.hidden = false;
      videoWrap.hidden = true;
      const img = wrap.querySelector('img');
      img.src = imageButton.dataset.gallerySrc;
      img.alt = imageButton.dataset.galleryCaption;
    } else if (videoButton) {
      wrap.hidden = true;
      videoWrap.hidden = false;
      videoWrap.querySelector('img').src = videoButton.querySelector('img').src;
      videoWrap.querySelector('[data-play-lightbox-video]').dataset.videoId = videoButton.dataset.videoId;
      videoWrap.querySelector('[data-play-lightbox-video]').dataset.videoTitle = videoButton.dataset.videoTitle;
      videoWrap.querySelector('[data-play-lightbox-video]').hidden = false;
      frame.hidden = true;
    }
    lightbox.querySelector('[data-gallery-caption]').textContent = `${imageIndex + 1} / ${gallery.length} · ${item.querySelector('p')?.textContent || ''}`;
  }
  gallery.forEach((slide, index) => slide.querySelector('.carousel-image')?.addEventListener('click', () => { showMedia(index); openDialog(lightbox); }));
  document.querySelectorAll('[data-gallery-src]:not(.carousel-image)').forEach(button => button.addEventListener('click', () => {
    if (!lightbox) return;
    clearLightboxVideo();
    lightbox.dataset.standalone = '';
    lightbox.querySelector('.lightbox-video-wrap').hidden = true;
    const wrap = lightbox.querySelector('.lightbox-image-wrap');
    wrap.hidden = false;
    wrap.classList.remove('zoomed');
    wrap.querySelector('img').src = button.dataset.gallerySrc;
    wrap.querySelector('img').alt = button.dataset.galleryCaption;
    lightbox.querySelector('[data-gallery-caption]').textContent = button.dataset.galleryCaption;
    openDialog(lightbox);
  }));
  lightbox?.querySelector('[data-gallery-prev]')?.addEventListener('click', () => showMedia(imageIndex - 1));
  lightbox?.querySelector('[data-gallery-next]')?.addEventListener('click', () => showMedia(imageIndex + 1));
  lightbox?.addEventListener('keydown', event => {
    if (lightbox.dataset.standalone !== undefined) return;
    if (event.key === 'ArrowLeft') {event.preventDefault();showMedia(imageIndex - 1);}
    if (event.key === 'ArrowRight') {event.preventDefault();showMedia(imageIndex + 1);}
  });
  let touchX = null;
  lightbox?.addEventListener('touchstart', event => { touchX = event.touches[0].clientX; }, {passive:true});
  lightbox?.addEventListener('touchend', event => { if (touchX === null || lightbox.dataset.standalone !== undefined) return; const dx = event.changedTouches[0].clientX - touchX; if (Math.abs(dx) > 60) showMedia(imageIndex + (dx < 0 ? 1 : -1)); touchX = null; }, {passive:true});
  lightbox?.querySelector('.lightbox-image-wrap img')?.addEventListener('click', () => {
    lightbox.querySelector('.lightbox-image-wrap')?.classList.toggle('zoomed');
  });
  lightbox?.querySelector('[data-play-lightbox-video]')?.addEventListener('click', event => {
    const button = event.currentTarget;
    const { videoId, videoTitle } = button.dataset;
    if (!/^[A-Za-z0-9_-]{11}$/.test(videoId || '')) return;
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
    iframe.title = videoTitle;
    iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    lightbox.querySelector('[data-lightbox-video-frame]').replaceChildren(iframe);
    lightbox.querySelector('[data-lightbox-video-frame]').hidden = false;
    button.hidden = true;
  });
  lightbox?.addEventListener('close', clearLightboxVideo);

  const carousel = document.querySelector('.media-carousel');
  const prevSlide = document.querySelector('[data-carousel-prev]');
  const nextSlide = document.querySelector('[data-carousel-next]');
  const slides = [...(carousel?.querySelectorAll('.carousel-item') || [])];
  const slideStatus = document.querySelector('.carousel-status');
  let activeSlide = 0, swipeX = null;
  function renderCarousel() {
    if (!slides.length) return;
    slides.forEach((slide, index) => {
      // Nearest circular position keeps the first and last slides adjacent.
      const forward = (index - activeSlide + slides.length) % slides.length;
      const offset = forward <= slides.length / 2 ? forward : forward - slides.length;
      const position = ({0:'center',[-1]:'previous',1:'next',[-2]:'far-left',2:'far-right'})[offset] || 'hidden';
      slide.dataset.position = position;
      const concealed = position === 'hidden' || (matchMedia('(max-width: 767px)').matches && Math.abs(offset) > 1);
      slide.inert = concealed;
      slide.setAttribute('aria-hidden', String(concealed));
    });
    if (slideStatus) slideStatus.textContent = `${activeSlide + 1} / ${slides.length} · ${slides[activeSlide].querySelector('p')?.textContent || ''}`;
  }
  function moveCarousel(direction) {
    if (!slides.length) return;
    activeSlide = (activeSlide + direction + slides.length) % slides.length;
    renderCarousel();
  }
  prevSlide?.addEventListener('click', () => moveCarousel(-1));
  nextSlide?.addEventListener('click', () => moveCarousel(1));
  carousel?.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); moveCarousel(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  carousel?.addEventListener('click', event => {
    const selected = event.target.closest('.carousel-item');
    if (!selected || selected === slides[activeSlide]) return;
    event.preventDefault(); event.stopPropagation();
    activeSlide = slides.indexOf(selected); renderCarousel();
  }, true);
  carousel?.addEventListener('touchstart', event => { swipeX = event.touches[0].clientX; }, {passive:true});
  carousel?.addEventListener('touchend', event => {
    if (swipeX === null) return;
    const dx = event.changedTouches[0].clientX - swipeX;
    if (Math.abs(dx) > 45) moveCarousel(dx < 0 ? 1 : -1);
    swipeX = null;
  }, {passive:true});
  window.addEventListener('resize', renderCarousel, {passive:true});
  renderCarousel();

  const videoDialog = document.querySelector('#video-dialog');
  document.querySelectorAll('[data-video-id]').forEach(button => button.addEventListener('click', () => {
    const { videoId, videoTitle } = button.dataset;
    if (!/^[A-Za-z0-9_-]{11}$/.test(videoId || '') || !videoDialog) return;
    videoDialog.querySelector('[data-video-heading]').textContent = videoTitle;
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`;
    iframe.title = videoTitle;
    iframe.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    videoDialog.querySelector('[data-video-frame]').replaceChildren(iframe);
    openDialog(videoDialog);
  }));
  videoDialog?.addEventListener('close', () => {
    videoDialog.querySelector('[data-video-frame]').replaceChildren();
  });
})();
