// Cursor follow
const cursor = document.querySelector('.cursor');
document.addEventListener('mousemove', e => {
  if (cursor) {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  }
});

const bindCursorEvents = () => {
  document.querySelectorAll('a, button, .project, .skills span, .metric-card').forEach(el => {
    el.addEventListener('mouseenter', () => cursor && cursor.classList.add('active'));
    el.addEventListener('mouseleave', () => cursor && cursor.classList.remove('active'));
  });
};
bindCursorEvents();

// Magnetic effect
document.querySelectorAll('.magnetic').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) * .18;
    const y = (e.clientY - r.top - r.height / 2) * .18;
    el.style.transform = `translate(${x}px,${y}px)`;
  });
  el.addEventListener('mouseleave', () => el.style.transform = 'translate(0,0)');
});

// Scroll Reveal
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: .1 });

document.querySelectorAll('.project, .about-grid, .statement, .contact, .metric-card, .cert-card').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(35px)';
  el.style.transition = 'opacity .9s ease, transform .9s cubic-bezier(.16,1,.3,1)';
  observer.observe(el);
});

// Theme Switcher (Dark / Light mode)
const themeBtn = document.getElementById('themeBtn');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    themeBtn.textContent = isDark ? 'LIGHT MODE' : 'DARK MODE';
  });
}

// Project Details Data
const projectData = {
  'ghumo-ai': {
    title: 'Ghumo AI — Intelligent Travel Engine',
    tech: 'TypeScript • React • OpenStreetMap • Web APIs',
    desc: 'An AI-driven travel planning and destination tracking platform designed to automate travel research, map navigation, itemized budgeting, and dynamic packing checklists.',
    highlights: [
      'Interactive destination mapping and location-based recommendations.',
      'Automated travel expense calculator and currency tracker.',
      'Dynamic, customizable checklist generator per trip activity.',
      'Responsive, offline-capable progressive web interface.'
    ],
    repo: 'https://github.com/mahendrapratap23/ghumo-ai'
  },
  'trackly': {
    title: 'Trackly — Universal Graph Analytics',
    tech: 'TypeScript • Chart Engine • Local Storage • CSS System',
    desc: 'A minimal, visual metrics tracker designed to record habits, productivity counters, and project milestones with real-time graph visualization.',
    highlights: [
      'Visual timeline and streak analytics graphs.',
      'Custom metric creation with multi-category filtering.',
      'Instant local storage persistence and CSV data export.',
      'Ultra-fast render speed with zero external UI framework dependencies.'
    ],
    repo: 'https://github.com/mahendrapratap23/trackly'
  },
  'college-practical-codes': {
    title: 'AI & ML Practical Suite',
    tech: 'Python • Jupyter Notebooks • Scikit-learn • Pandas',
    desc: 'An extensive repository containing practical implementations of Artificial Intelligence models, Machine Learning algorithms, and DAA (Design & Analysis of Algorithms) problems.',
    highlights: [
      'Supervised and unsupervised ML algorithms written from scratch.',
      'Algorithmic analysis (Divide & Conquer, Dynamic Programming, Greedy).',
      'Model evaluation scripts with confusion matrix & accuracy plots.',
      'Well-documented Jupyter Notebooks for computer science education.'
    ],
    repo: 'https://github.com/mahendrapratap23/college-practical-codes'
  }
};

// Modal Elements
const modal = document.getElementById('projectModal');
const modalTitle = document.getElementById('modalTitle');
const modalTech = document.getElementById('modalTech');
const modalDesc = document.getElementById('modalDesc');
const modalHighlights = document.getElementById('modalHighlights');
const modalRepoBtn = document.getElementById('modalRepoBtn');
const modalClose = document.getElementById('modalClose');
const modalCloseBtn = document.getElementById('modalCloseBtn');
const modalOverlay = document.getElementById('modalOverlay');

const openModal = (projectId) => {
  const data = projectData[projectId];
  if (!data) return;

  modalTitle.textContent = data.title;
  modalTech.textContent = data.tech;
  modalDesc.textContent = data.desc;
  modalRepoBtn.href = data.repo;

  modalHighlights.innerHTML = data.highlights.map(h => `<li>${h}</li>`).join('');

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};

document.querySelectorAll('.project').forEach(project => {
  project.addEventListener('click', (e) => {
    e.preventDefault();
    const id = project.getAttribute('data-project');
    if (id) openModal(id);
  });
});

if (modalClose) modalClose.addEventListener('click', closeModal);
if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
if (modalOverlay) modalOverlay.addEventListener('click', closeModal);

document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && modal.classList.contains('active')) {
    closeModal();
  }
});

// Toast notification & Copy email functionality
const toast = document.getElementById('toast');
const copyEmailBtn = document.getElementById('copyEmailBtn');

const showToast = (message) => {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2600);
};

if (copyEmailBtn) {
  copyEmailBtn.addEventListener('click', () => {
    const emailToCopy = 'mp498343@gmail.com';
    navigator.clipboard.writeText(emailToCopy).then(() => {
      showToast('✓ Email mp498343@gmail.com copied to clipboard!');
    }).catch(() => {
      showToast('Email: mp498343@gmail.com');
    });
  });
}

