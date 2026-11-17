const menuButton = document.getElementById('menu');
const nav = document.getElementById('nav');
const form = document.getElementById('contactForm');
const yearElement = document.getElementById('year');
const siteIntro = document.getElementById('siteIntro');
const heroParallax = document.querySelector('[data-parallax]');
const pageDialog = document.getElementById('pageDialog');
const pageDialogTitle = document.getElementById('pageDialogTitle');
const pageDialogContent = document.getElementById('pageDialogContent');
const pageDialogClose = document.getElementById('pageDialogClose');
const momentDialog = document.getElementById('momentDialog');
const momentDialogKicker = document.getElementById('momentDialogKicker');
const momentDialogTitle = document.getElementById('momentDialogTitle');
const momentDialogDescription = document.getElementById('momentDialogDescription');
const momentDialogSteps = document.getElementById('momentDialogSteps');
const momentDialogClose = document.getElementById('momentDialogClose');
const momentDialogContact = document.getElementById('momentDialogContact');

const pageViews = new Map([
  ['solucoes', 'Soluções'],
  ['studio', 'Nossa visão'],
  ['processo', 'Nosso processo'],
  ['contato', 'Vamos conversar']
]);
let activePage = null;

const contactInfo = {
  email: 'grdesingmarkting@gmail.com'
};

const momentDialogDetails = new Map([
  ['starting', {
    kicker: 'SEU PRIMEIRO PASSO',
    title: 'Tire sua ideia do papel.',
    description: 'A GR ajuda a transformar seu plano em uma presença digital clara e profissional, pronta para apresentar seu negócio.',
    steps: [
      'Entendemos sua ideia, seu público e as prioridades do momento.',
      'Criamos uma identidade e um site alinhados ao que você quer oferecer.',
      'Organizamos os próximos passos para sua marca começar com confiança.'
    ]
  }],
  ['positioning', {
    kicker: 'UMA MARCA MAIS FORTE',
    title: 'Mostre o que torna sua marca única.',
    description: 'Se o negócio já está em movimento, a GR conecta identidade, comunicação e experiência digital para deixar seu valor mais evidente.',
    steps: [
      'Alinhamos a percepção atual da marca com seus objetivos.',
      'Construímos uma identidade visual consistente e reconhecível.',
      'Aprimoramos seu site e sua comunicação para falar com as pessoas certas.'
    ]
  }],
  ['growth', {
    kicker: 'PRÓXIMO NÍVEL',
    title: 'Cresça com direção.',
    description: 'A GR ajuda sua marca a explorar novas oportunidades com estratégia, conteúdo e campanhas digitais pensadas para seus objetivos.',
    steps: [
      'Definimos prioridades e canais que fazem sentido para o negócio.',
      'Planejamos conteúdos e campanhas com uma mensagem clara.',
      'Acompanhamos os resultados para ajustar a direção e seguir evoluindo.'
    ]
  }]
]);

function setMenuOpen(isOpen) {
  nav.classList.toggle('open', isOpen);
  menuButton.setAttribute('aria-expanded', String(isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
}

menuButton.addEventListener('click', () => {
  setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
});

nav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenuOpen(false));
});

const showcaseStage = document.querySelector('.showcase-stage');
if (showcaseStage) {
  const showcasePreviews = [...showcaseStage.querySelectorAll('[data-showcase-item]')];
  let activeIndex = showcasePreviews.findIndex((preview) => preview.dataset.slot === 'center');
  if (activeIndex < 0) activeIndex = 0;

  function showActiveShowcasePreview() {
    showcasePreviews.forEach((preview, index) => {
      const position = (index - activeIndex + showcasePreviews.length) % showcasePreviews.length;
      preview.dataset.slot = position === 0 ? 'center' : position === 1 ? 'left' : 'right';
    });
  }

  if (showcasePreviews.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    window.setInterval(() => {
      if (document.visibilityState !== 'visible') return;
      activeIndex = (activeIndex + 1) % showcasePreviews.length;
      showActiveShowcasePreview();
    }, 4000);
  }
}

function restoreActivePage() {
  if (!activePage) return;
  activePage.placeholder.parentNode.insertBefore(activePage.section, activePage.placeholder);
  activePage.placeholder.remove();
  activePage = null;
}

function openPageView(sectionId) {
  const section = document.getElementById(sectionId);
  const title = pageViews.get(sectionId);
  if (!section || !title) return;

  restoreActivePage();
  const placeholder = document.createComment('page-view-placeholder');
  section.before(placeholder);
  pageDialogContent.append(section);
  activePage = { section, placeholder };
  pageDialogTitle.textContent = title;
  pageDialogContent.scrollTop = 0;
  if (!pageDialog.open) pageDialog.showModal();
  pageDialogContent.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible'));
}

document.addEventListener('click', (event) => {
  const link = event.target.closest('a[href^="#"]');
  if (!link) return;

  const sectionId = link.getAttribute('href').slice(1);
  if (pageViews.has(sectionId)) {
    event.preventDefault();
    openPageView(sectionId);
  } else if (sectionId === 'inicio' && pageDialog.open) {
    event.preventDefault();
    pageDialog.close();
  }
});

pageDialogClose.addEventListener('click', () => {
  restoreActivePage();
  pageDialog.close();
});
pageDialog.addEventListener('close', restoreActivePage);

let activeMomentItem = null;
let momentCloseTimeout = null;
let restoringMomentFocus = false;
let suppressMomentHoverUntilMove = false;
let lastMomentPointerPosition = null;

function positionMomentDialog(item) {
  const triggerBounds = item.getBoundingClientRect();
  const viewportPadding = 16;
  const dialogWidth = momentDialog.offsetWidth;
  const dialogHeight = momentDialog.offsetHeight;
  const left = Math.max(
    viewportPadding,
    Math.min(triggerBounds.left + 56, window.innerWidth - dialogWidth - viewportPadding)
  );
  const belowTop = triggerBounds.bottom + 8;
  const aboveTop = triggerBounds.top - dialogHeight - 8;
  let top = belowTop;

  if (belowTop + dialogHeight > window.innerHeight - viewportPadding) {
    top = aboveTop >= viewportPadding
      ? aboveTop
      : Math.max(viewportPadding, window.innerHeight - dialogHeight - viewportPadding);
  }

  momentDialog.style.left = `${left}px`;
  momentDialog.style.top = `${top}px`;
}

function openMoment(item) {
  window.clearTimeout(momentCloseTimeout);
  const moment = momentDialogDetails.get(item.dataset.moment);
  if (!moment) throw new Error(`Missing dialog content for moment "${item.dataset.moment}"`);

  if (activeMomentItem && activeMomentItem !== item) {
    activeMomentItem.setAttribute('aria-expanded', 'false');
  }
  activeMomentItem = item;
  item.setAttribute('aria-expanded', 'true');
  momentDialog.dataset.moment = item.dataset.moment;
  momentDialogKicker.textContent = moment.kicker;
  momentDialogTitle.textContent = moment.title;
  momentDialogDescription.textContent = moment.description;
  momentDialogSteps.replaceChildren(...moment.steps.map((step) => {
    const stepElement = document.createElement('li');
    stepElement.textContent = step;
    return stepElement;
  }));
  item.after(momentDialog);
  momentDialog.hidden = false;
  positionMomentDialog(item);
  momentDialog.classList.remove('is-open');
  momentDialog.offsetWidth;
  momentDialog.classList.add('is-open');
}

function repositionMomentDialog() {
  if (activeMomentItem && !momentDialog.hidden) {
    positionMomentDialog(activeMomentItem);
  }
}

function closeMoment(restoreFocus) {
  window.clearTimeout(momentCloseTimeout);
  const pointerIsInside = momentDialog.matches(':hover') || (activeMomentItem && activeMomentItem.matches(':hover'));
  momentDialog.hidden = true;
  momentDialog.classList.remove('is-open');
  const focusTarget = activeMomentItem;
  if (activeMomentItem) {
    activeMomentItem.setAttribute('aria-expanded', 'false');
  }
  activeMomentItem = null;
  if (pointerIsInside) suppressMomentHoverUntilMove = true;
  if (restoreFocus && focusTarget) {
    restoringMomentFocus = true;
    focusTarget.focus();
    restoringMomentFocus = false;
  }
}

function scheduleMomentClose() {
  window.clearTimeout(momentCloseTimeout);
  momentCloseTimeout = window.setTimeout(() => {
    const pointerIsInside = (activeMomentItem && activeMomentItem.matches(':hover')) || momentDialog.matches(':hover');
    const focusIsInside = momentDialog.contains(document.activeElement) || activeMomentItem === document.activeElement;
    if (!pointerIsInside && !focusIsInside) closeMoment(false);
  }, 180);
}

document.querySelectorAll('.moment-item[data-moment]').forEach((item) => {
  item.addEventListener('pointerenter', (event) => {
    if (event.pointerType !== 'touch' && !suppressMomentHoverUntilMove) openMoment(item);
  });
  item.addEventListener('focus', () => {
    if (!restoringMomentFocus) {
      suppressMomentHoverUntilMove = false;
      openMoment(item);
    }
  });
  item.addEventListener('pointerleave', scheduleMomentClose);
  item.addEventListener('focusout', scheduleMomentClose);
  item.addEventListener('click', () => {
    suppressMomentHoverUntilMove = false;
    openMoment(item);
  });
});

document.addEventListener('pointermove', (event) => {
  const pointerMoved = lastMomentPointerPosition
    && (event.clientX !== lastMomentPointerPosition.x || event.clientY !== lastMomentPointerPosition.y);
  if (pointerMoved) suppressMomentHoverUntilMove = false;
  lastMomentPointerPosition = { x: event.clientX, y: event.clientY };
});
window.addEventListener('resize', repositionMomentDialog);
window.addEventListener('scroll', repositionMomentDialog, { passive: true });
momentDialog.addEventListener('pointerenter', () => window.clearTimeout(momentCloseTimeout));
momentDialog.addEventListener('pointerleave', scheduleMomentClose);
momentDialog.addEventListener('focusin', () => window.clearTimeout(momentCloseTimeout));
momentDialog.addEventListener('focusout', scheduleMomentClose);
momentDialogClose.addEventListener('click', () => closeMoment(true));
document.addEventListener('pointerdown', (event) => {
  if (momentDialog.hidden || momentDialog.contains(event.target) || event.target.closest('.moment-item')) return;
  closeMoment(false);
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !momentDialog.hidden) {
    event.preventDefault();
    closeMoment(true);
  }
});
momentDialogContact.addEventListener('click', () => {
  closeMoment(false);
  window.setTimeout(() => openPageView('contato'), 0);
});

yearElement.textContent = new Date().getFullYear();

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (siteIntro) {
  if (reducedMotion) {
    siteIntro.remove();
  } else {
    window.setTimeout(() => {
      siteIntro.classList.add('is-exiting');
      window.setTimeout(() => siteIntro.remove(), 500);
    }, 850);
  }
}
const revealItems = document.querySelectorAll('.reveal');

if (!reducedMotion && 'IntersectionObserver' in window) {
  document.documentElement.classList.add('motion-ready');
  revealItems.forEach((item, index) => {
    item.style.setProperty('--reveal-delay', `${(index % 4) * 75}ms`);
  });

  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { rootMargin: '0px 0px 80px 0px', threshold: 0.08 });

  revealItems.forEach((item) => revealObserver.observe(item));
  window.setTimeout(() => revealItems.forEach((item) => item.classList.add('is-visible')), 1800);
}

const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
const navSections = navLinks
  .map((link) => document.querySelector(link.getAttribute('href')))
  .filter(Boolean);

if (!reducedMotion && 'IntersectionObserver' in window) {
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const isCurrent = link.getAttribute('href') === `#${entry.target.id}`;
        if (isCurrent) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-35% 0px -55% 0px', threshold: 0 });

  navSections.forEach((section) => sectionObserver.observe(section));
}

function updateScrollMotion() {
  if (heroParallax) {
    heroParallax.style.setProperty('--parallax-y', `${-Math.min(window.scrollY * 0.075, 64)}px`);
  }
}

window.addEventListener('scroll', updateScrollMotion, { passive: true });
window.addEventListener('resize', updateScrollMotion);
updateScrollMotion();

if (!reducedMotion) {
  document.querySelectorAll('[data-tilt], [data-glow]').forEach((element) => {
    element.addEventListener('pointermove', (event) => {
      if (event.pointerType === 'touch') return;
      const bounds = element.getBoundingClientRect();
      const x = Math.max(0, Math.min((event.clientX - bounds.left) / bounds.width, 1));
      const y = Math.max(0, Math.min((event.clientY - bounds.top) / bounds.height, 1));

      if (element.hasAttribute('data-glow')) {
        element.style.setProperty('--pointer-x', `${x * 100}%`);
        element.style.setProperty('--pointer-y', `${y * 100}%`);
      }
      if (element.hasAttribute('data-tilt')) {
        element.style.setProperty('--tilt-x', `${(0.5 - y) * 7}deg`);
        element.style.setProperty('--tilt-y', `${(x - 0.5) * 9}deg`);
      }
    });

    element.addEventListener('pointerleave', () => {
      element.style.removeProperty('--pointer-x');
      element.style.removeProperty('--pointer-y');
      element.style.removeProperty('--tilt-x');
      element.style.removeProperty('--tilt-y');
    });
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const formData = new FormData(event.target);
  const params = new URLSearchParams({
    view: 'cm',
    fs: '1',
    tf: 'cm',
    to: contactInfo.email,
    su: 'Novo contato pelo site — GR Company',
    body: `Nome: ${formData.get('name')}\nE-mail: ${formData.get('email')}\nInteresse: ${formData.get('service')}\nProjeto: ${formData.get('message')}`
  });

  window.location.href = `https://mail.google.com/mail/u/0/?${params.toString()}`;
});
