/* ============================================================
   CableSpec Pro — Application Logic
   ============================================================ */

/* ── Canvas Particle Background ── */
(function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function createParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.3,
      dx: (Math.random() - 0.5) * 0.25,
      dy: (Math.random() - 0.5) * 0.25,
      alpha: Math.random() * 0.6 + 0.1,
      color: Math.random() < 0.5 ? '56,189,248' : '167,139,250',
    };
  }
  for (let i = 0; i < 120; i++) particles.push(createParticle());

  function drawLine(a, b) {
    const dist = Math.hypot(a.x - b.x, a.y - b.y);
    if (dist > 120) return;
    ctx.strokeStyle = `rgba(56,189,248,${0.08 * (1 - dist / 120)})`;
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  let raf;
  function animate() {
    ctx.clearRect(0, 0, W, H);
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
      ctx.fill();
      for (let j = i + 1; j < particles.length; j++) drawLine(p, particles[j]);
    }
    raf = requestAnimationFrame(animate);
  }
  animate();
})();

/* ── Hero Orbit Visual ── */
(function buildOrbit() {
  const orbitEl = document.getElementById('connector-orbit');
  if (!orbitEl) return;

  const icons = ['🔌','🔗','⚡','📡','🛢️','🚗','✈️','☀️','🔬','🏥','🌾','📺','🤖','⚓','🏭'];
  const rings = ['r1','r2','r3'];

  rings.forEach(r => {
    const ring = document.createElement('div');
    ring.className = `orbit-ring ${r}`;
    orbitEl.appendChild(ring);
  });

  const center = document.createElement('div');
  center.className = 'orbit-center';
  center.textContent = '⚡';
  orbitEl.appendChild(center);

  // Place icons on ring 2 and ring 3
  const ring2Icons = [icons[0], icons[1], icons[2], icons[3]];
  const ring3Icons = [icons[4], icons[5], icons[6], icons[7], icons[8], icons[9]];

  function placeDots(iconList, radius, parent) {
    iconList.forEach((icon, i) => {
      const angle = (i / iconList.length) * Math.PI * 2;
      const dot = document.createElement('div');
      dot.className = 'orbit-dot';
      dot.textContent = icon;
      const cx = 210, cy = 210;
      const x = cx + radius * Math.cos(angle) - 16;
      const y = cy + radius * Math.sin(angle) - 16;
      dot.style.left = `${x}px`;
      dot.style.top = `${y}px`;
      dot.style.position = 'absolute';
      parent.appendChild(dot);
    });
  }

  placeDots(ring2Icons, 110, orbitEl);
  placeDots(ring3Icons, 160, orbitEl);
})();

/* ── Animated Counters ── */
function animateCounter(el, target, duration = 1800) {
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target + (target >= 30 ? '+' : '');
  }
  requestAnimationFrame(step);
}

const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      animateCounter(el, +el.dataset.target);
      io.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-num[data-target]').forEach(el => io.observe(el));

/* ── Navbar scroll effect ── */
window.addEventListener('scroll', () => {
  document.getElementById('navbar').classList.toggle('scrolled', window.scrollY > 40);
});

/* ── Build Cards ── */
function makeCard(industry) {
  const card = document.createElement('div');
  card.className = 'industry-card';
  card.dataset.filter = industry.filter;
  card.dataset.id = industry.id;
  card.style.setProperty('--card-accent', industry.accentColor || '#38bdf8');
  card.style.setProperty('--card-color-a', industry.colorA || 'rgba(56,189,248,0.08)');
  card.style.setProperty('--card-color-b', industry.colorB || 'transparent');

  // Staggered animation
  const idx = card.dataset.idx || 0;
  card.style.animationDelay = `${idx * 0.05}s`;

  const cablesHtml = (industry.cables || []).slice(0, 5).map(c =>
    `<span class="cable-tag">${c}</span>`
  ).join('');

  const specsHtml = (industry.specs || []).slice(0, 3).map(s =>
    `<span class="spec-chip">✓ ${s}</span>`
  ).join('');

  card.innerHTML = `
    <div class="card-header">
      <div class="card-icon">${industry.icon}</div>
      <div class="card-meta">
        <div class="card-industry-name">${industry.name}</div>
        <div class="card-sector">${industry.filter}</div>
      </div>
    </div>
    <div class="key-cables">${cablesHtml}</div>
    <div class="card-spec-row">${specsHtml}</div>
    <div class="card-footer">
      <span class="card-connector-count">${industry.connectorCount || '—'} connector types</span>
      <span class="card-cta">Explore details →</span>
    </div>
  `;

  card.addEventListener('click', () => openModal(industry));
  return card;
}

// Render all categories
const categoryGridMap = {
  industrial: 'grid-industrial',
  transport: 'grid-transport',
  energy: 'grid-energy',
  tech: 'grid-tech',
  healthcare: 'grid-healthcare',
  infrastructure: 'grid-infrastructure',
};

let cardIdx = 0;
Object.entries(INDUSTRIES).forEach(([catKey, industries]) => {
  const gridEl = document.getElementById(categoryGridMap[catKey]);
  if (!gridEl) return;
  industries.forEach(ind => {
    const card = makeCard(ind);
    card.dataset.idx = cardIdx++;
    gridEl.appendChild(card);
  });
});

/* ── Update industry count ── */
document.getElementById('industry-count').textContent = ALL_INDUSTRIES.length + '+';

/* ── Footer tag cloud ── */
const tagCloud = document.getElementById('footer-tags');
const allCables = [...new Set(ALL_INDUSTRIES.flatMap(i => i.cables || []))].slice(0, 32);
allCables.forEach(tag => {
  const span = document.createElement('span');
  span.className = 'cable-tag';
  span.textContent = tag;
  tagCloud.appendChild(span);
});

/* ── Filter Pills ── */
document.querySelectorAll('.pill').forEach(pill => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    pill.classList.add('active');
    const filter = pill.dataset.filter;
    filterCards(filter);
  });
});

function filterCards(filter) {
  const allCards = document.querySelectorAll('.industry-card');
  let visible = 0;

  allCards.forEach(card => {
    if (filter === 'all' || card.dataset.filter === filter) {
      card.classList.remove('hidden');
      visible++;
    } else {
      card.classList.add('hidden');
    }
  });

  // Show/hide category sections
  const sections = document.querySelectorAll('.category-section');
  sections.forEach(section => {
    const gridId = section.querySelector('.cards-grid').id;
    const gridCards = section.querySelectorAll('.industry-card:not(.hidden)');
    section.style.display = gridCards.length === 0 ? 'none' : '';
  });

  // No results message
  removeNoResults();
  if (visible === 0) {
    document.getElementById('main-content').insertAdjacentHTML('afterbegin',
      '<div class="no-results">No industries match your filter. Try a different category.</div>');
  }
}

function removeNoResults() {
  document.querySelectorAll('.no-results').forEach(el => el.remove());
}

/* ── Global Search ── */
const searchEl = document.getElementById('global-search');
searchEl.addEventListener('input', () => {
  const q = searchEl.value.toLowerCase().trim();
  const allCards = document.querySelectorAll('.industry-card');

  // Reset pills
  if (!q) {
    document.querySelectorAll('.pill').forEach(p => p.classList.toggle('active', p.dataset.filter === 'all'));
    filterCards('all');
    return;
  }

  document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
  removeNoResults();

  let visible = 0;
  allCards.forEach(card => {
    const id = card.dataset.id;
    const industry = ALL_INDUSTRIES.find(i => i.id === id);
    if (!industry) return;
    const match = [
      industry.name,
      industry.sector,
      ...(industry.cables || []),
      ...(industry.specs || []),
      ...(industry.standards || []),
      ...(industry.useCases || []),
      (industry.description || ''),
    ].join(' ').toLowerCase().includes(q);

    card.classList.toggle('hidden', !match);
    if (match) visible++;
  });

  // Show/hide category sections
  document.querySelectorAll('.category-section').forEach(section => {
    const gridCards = section.querySelectorAll('.industry-card:not(.hidden)');
    section.style.display = gridCards.length === 0 ? 'none' : '';
  });

  if (visible === 0) {
    document.getElementById('main-content').insertAdjacentHTML('afterbegin',
      `<div class="no-results">No results found for "<strong>${q}</strong>". Try searching for a connector type, standard, or industry name.</div>`);
  }
});

/* ── Modal ── */
const modalOverlay = document.getElementById('modal-overlay');
const modalClose = document.getElementById('modal-close');

function openModal(industry) {
  document.getElementById('modal-icon').textContent = industry.icon;
  document.getElementById('modal-tag').textContent = industry.sector;
  document.getElementById('modal-title').textContent = industry.name;

  const body = document.getElementById('modal-body');
  body.innerHTML = '';

  // Description
  if (industry.description) {
    const sec = document.createElement('div');
    sec.className = 'modal-section';
    sec.innerHTML = `
      <div class="modal-section-title">Overview</div>
      <p class="modal-description">${industry.description}</p>
    `;
    body.appendChild(sec);
  }

  // Connectors table
  if (industry.connectors && industry.connectors.length) {
    const sec = document.createElement('div');
    sec.className = 'modal-section';
    const rows = industry.connectors.map(c => `
      <tr>
        <td><span class="conn-name">${c.name}</span></td>
        <td>${c.application}</td>
        <td><span class="rating-badge">${c.ipRating}</span></td>
        <td style="font-size:0.72rem;color:var(--text-dim);font-family:var(--mono)">${c.standard}</td>
      </tr>
    `).join('');
    sec.innerHTML = `
      <div class="modal-section-title">Key Connectors</div>
      <table class="conn-table">
        <thead>
          <tr>
            <th>Connector</th>
            <th>Application</th>
            <th>IP / Rating</th>
            <th>Standard</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
    body.appendChild(sec);
  }

  // Cable types
  if (industry.cables_detail && industry.cables_detail.length) {
    const sec = document.createElement('div');
    sec.className = 'modal-section';
    const items = industry.cables_detail.map(c =>
      `<div class="usecase-item">${c}</div>`
    ).join('');
    sec.innerHTML = `
      <div class="modal-section-title">Cable Types Used</div>
      <div class="usecase-list">${items}</div>
    `;
    body.appendChild(sec);
  }

  // Standards
  if (industry.standards && industry.standards.length) {
    const sec = document.createElement('div');
    sec.className = 'modal-section';
    const chips = industry.standards.map(s =>
      `<span class="standard-chip">${s}</span>`
    ).join('');
    sec.innerHTML = `
      <div class="modal-section-title">Standards & Certifications</div>
      <div class="standards-wrap">${chips}</div>
    `;
    body.appendChild(sec);
  }

  // Use cases
  if (industry.useCases && industry.useCases.length) {
    const sec = document.createElement('div');
    sec.className = 'modal-section';
    const items = industry.useCases.map(u =>
      `<div class="usecase-item">${u}</div>`
    ).join('');
    sec.innerHTML = `
      <div class="modal-section-title">Typical Use Cases</div>
      <div class="usecase-list">${items}</div>
    `;
    body.appendChild(sec);
  }

  modalOverlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  modalOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) closeModal();
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
});

/* ── Card entry animations via IntersectionObserver ── */
const cardObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'none';
      cardObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.industry-card').forEach((card, i) => {
  card.style.opacity = '0';
  card.style.transform = 'translateY(24px)';
  card.style.transition = `opacity 0.5s ${i * 0.04}s ease, transform 0.5s ${i * 0.04}s ease`;
  cardObserver.observe(card);
});
