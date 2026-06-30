/* ============================================================
   CableSpec Pro — Standards & Technical Reference App Logic
   ============================================================ */

(function initStandardsSection() {

  /* ── Tab switching ── */
  document.querySelectorAll('.std-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.std-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.std-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById(btn.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });

  /* ================================================================
     TAB 1 — IEC 61076-2-101 Edition 4.0
  ================================================================ */
  buildIEC61076Panel();

  function buildIEC61076Panel() {
    const container = document.getElementById('std-iec61076');
    if (!container) return;

    // Meta banner
    const meta = document.createElement('div');
    meta.className = 'std-meta-banner';
    meta.innerHTML = `
      <div class="std-meta-item"><span class="std-meta-key">Standard</span><span class="std-meta-val">${IEC_61076_CHANGES.standard}</span></div>
      <div class="std-meta-item"><span class="std-meta-key">Edition</span><span class="std-meta-val">${IEC_61076_CHANGES.edition}</span></div>
      <div class="std-meta-item"><span class="std-meta-key">Published</span><span class="std-meta-val">${IEC_61076_CHANGES.published}</span></div>
      <div class="std-meta-item"><span class="std-meta-key">Replaces</span><span class="std-meta-val">${IEC_61076_CHANGES.previousEdition}</span></div>
    `;
    container.appendChild(meta);

    // Scope
    const scopeDiv = document.createElement('div');
    scopeDiv.className = 'std-scope-note';
    scopeDiv.innerHTML = `<strong>Scope:</strong> ${IEC_61076_CHANGES.scope} — ${IEC_61076_CHANGES.scopeNote}`;
    container.appendChild(scopeDiv);

    // Changes
    const changesGrid = document.createElement('div');
    changesGrid.className = 'std-changes-grid';
    IEC_61076_CHANGES.changes.forEach(ch => {
      const card = document.createElement('div');
      card.className = 'std-change-card' + (ch.highlight ? ' highlight' : '');
      card.style.setProperty('--ch-color', ch.color);
      card.innerHTML = `
        <div class="std-change-head">
          <span class="std-change-icon">${ch.icon}</span>
          <div>
            <div class="std-change-category" style="color:${ch.color}">${ch.category}</div>
            <div class="std-change-title">${ch.title}</div>
          </div>
          <span class="std-verify-badge">✓</span>
        </div>
        <p class="std-change-detail">${ch.detail}</p>
        <div class="std-change-impact"><strong>⚡ Impact:</strong> ${ch.impact}</div>
      `;
      changesGrid.appendChild(card);
    });
    container.appendChild(changesGrid);

    // M12 Coding table
    const codingTitle = document.createElement('h3');
    codingTitle.className = 'std-subsection-title';
    codingTitle.textContent = 'M12 Coding Reference (IEC 61076-2-101 Ed.4)';
    container.appendChild(codingTitle);

    const codeWrap = document.createElement('div');
    codeWrap.className = 'coding-table-wrap';
    const rows = M12_CODING_GUIDE.map(c => `
      <tr>
        <td><span class="code-badge" style="background:${c.color}20;color:${c.color};border-color:${c.color}40">${c.code}</span></td>
        <td><span class="mono-cell">${c.pins}</span></td>
        <td style="font-size:0.8rem;color:var(--text-muted)">${c.application}</td>
        <td><span class="mono-cell dim">${c.protocol}</span></td>
        <td><span class="mono-cell">${c.contactDia}</span></td>
        <td><span class="mono-cell orange">${c.maxCurrent}</span></td>
        <td><span class="mono-cell dim">${c.voltage}</span></td>
        <td><span class="ip-small-badge">${c.ipRating}</span></td>
      </tr>
    `).join('');
    codeWrap.innerHTML = `
      <table class="coding-table">
        <thead>
          <tr>
            <th>Code</th><th>Pins</th><th>Application</th><th>Protocol</th>
            <th>Contact Ø</th><th>Max I</th><th>Voltage</th><th>IP Rating</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    `;
    container.appendChild(codeWrap);
  }

  /* ================================================================
     TAB 2 — IP67 vs IP68 vs IP69K
  ================================================================ */
  buildIPPanel();

  function buildIPPanel() {
    const container = document.getElementById('std-ip-ratings');
    if (!container) return;

    const metaDiv = document.createElement('div');
    metaDiv.className = 'std-scope-note';
    metaDiv.innerHTML = `<strong>Standard:</strong> ${IP_RATINGS.system}`;
    container.appendChild(metaDiv);

    // IP digit explanation
    const digitBar = document.createElement('div');
    digitBar.className = 'ip-digit-bar';
    digitBar.innerHTML = `
      <div class="ip-digit-box">
        <div class="ip-digit-num">6</div>
        <div class="ip-digit-label">First Digit</div>
        <div class="ip-digit-desc">Dust-tight — Complete protection against dust ingress after 8+ hours of continuous exposure. Shared by IP67, IP68, and IP69K.</div>
      </div>
      <div class="ip-digit-connector">+</div>
      <div class="ip-digit-box">
        <div class="ip-digit-num" style="color:var(--accent)">7 / 8 / 9K</div>
        <div class="ip-digit-label">Second Digit</div>
        <div class="ip-digit-desc">Water protection level. 7 = temporary immersion. 8 = continuous immersion (depth/duration manufacturer-defined). 9K = high-pressure steam jet.</div>
      </div>
      <div class="ip-digit-connector">=</div>
      <div class="ip-digit-box highlight-box">
        <div class="ip-digit-num" style="background: linear-gradient(135deg,#38bdf8,#34d399);-webkit-background-clip:text;-webkit-text-fill-color:transparent;">IP67/68/69K</div>
        <div class="ip-digit-label">Combined Rating</div>
        <div class="ip-digit-desc">Both digits together define the complete enclosure protection level. An M12 connector only achieves its IP rating when <strong>fully mated and tightened</strong>.</div>
      </div>
    `;
    container.appendChild(digitBar);

    // Rating cards
    const ratingsGrid = document.createElement('div');
    ratingsGrid.className = 'ip-ratings-grid';

    IP_RATINGS.ratings.forEach(r => {
      const card = document.createElement('div');
      card.className = 'ip-card';
      card.style.setProperty('--ip-color', r.color);

      const limitsHtml = r.limitations.map(l => `<li>${l}</li>`).join('');
      const examplesHtml = r.m12Examples.map(e => `<span class="ip-example-tag">${e}</span>`).join('');

      card.innerHTML = `
        <div class="ip-card-head">
          <div class="ip-code-big">${r.code}</div>
          <div>
            <div class="ip-water-label">${r.waterLabel}</div>
            <div class="ip-conditions">${r.conditions}</div>
          </div>
        </div>
        <div class="ip-card-body">
          <div class="ip-test-row">
            <span class="ip-test-key">Test Conditions:</span>
            <span class="ip-test-val">${r.testConditions}</span>
          </div>
          <div class="ip-test-row">
            <span class="ip-test-key">Standard Reference:</span>
            <span class="ip-test-val">${r.standardRef}</span>
          </div>
          <div class="ip-real-world">${r.realWorldNote}</div>
          <div class="ip-limits-title">⚠ Important Limitations</div>
          <ul class="ip-limits-list">${limitsHtml}</ul>
          <div class="ip-examples-title">M12 Application Examples</div>
          <div class="ip-examples-wrap">${examplesHtml}</div>
        </div>
      `;
      ratingsGrid.appendChild(card);
    });
    container.appendChild(ratingsGrid);

    // Male vs Female section (also in this panel as a sub-section)
    const genderTitle = document.createElement('h3');
    genderTitle.className = 'std-subsection-title';
    genderTitle.textContent = 'Male ♂ vs Female ♀ Connectors — Full Technical Reference';
    container.appendChild(genderTitle);

    const genderGrid = document.createElement('div');
    genderGrid.className = 'gender-grid';

    [GENDER_GUIDE.male, GENDER_GUIDE.female].forEach(g => {
      const card = document.createElement('div');
      card.className = 'gender-card';
      card.style.setProperty('--g-color', g.color);
      const diamsHtml = g.contactDiameters.map(d => `
        <div class="gender-diam-row">
          <span class="gender-diam-key">${d.pins}</span>
          <span class="gender-diam-val">${d.dia}</span>
          <span class="gender-diam-note">${d.note}</span>
        </div>
      `).join('');
      card.innerHTML = `
        <div class="gender-card-head">
          <span class="gender-symbol" style="color:${g.color}">${g.icon}</span>
          <div>
            <div class="gender-label">${g.label}</div>
            <div class="gender-isoref" style="color:${g.color}">${g.isoRef}</div>
          </div>
        </div>
        <p class="gender-desc">${g.description}</p>
        <div class="gender-diam-title">Contact / Pin Diameters</div>
        <div class="gender-diams">${diamsHtml}</div>
        <div class="gender-thread-title">Screw Thread Mechanics</div>
        <div class="gender-thread">${g.threadMechanic}</div>
        <div class="gender-use-title">Typical Installation</div>
        <div class="gender-use">${g.typicalUse}</div>
      `;
      genderGrid.appendChild(card);
    });
    container.appendChild(genderGrid);
  }

  /* ================================================================
     TAB 3 — IEC 60228 Ed.4 + Conductor Classes
  ================================================================ */
  buildIEC60228Panel();

  function buildIEC60228Panel() {
    const container = document.getElementById('std-iec60228');
    if (!container) return;

    // Meta
    const meta = document.createElement('div');
    meta.className = 'std-meta-banner';
    meta.innerHTML = `
      <div class="std-meta-item"><span class="std-meta-key">Standard</span><span class="std-meta-val">${IEC_60228_CHANGES.standard}</span></div>
      <div class="std-meta-item"><span class="std-meta-key">Edition</span><span class="std-meta-val">${IEC_60228_CHANGES.edition}</span></div>
      <div class="std-meta-item"><span class="std-meta-key">Published</span><span class="std-meta-val">${IEC_60228_CHANGES.published}</span></div>
      <div class="std-meta-item"><span class="std-meta-key">Replaces</span><span class="std-meta-val">${IEC_60228_CHANGES.previousEdition}</span></div>
    `;
    container.appendChild(meta);

    const scope = document.createElement('div');
    scope.className = 'std-scope-note';
    scope.innerHTML = `<strong>Scope:</strong> ${IEC_60228_CHANGES.scope}`;
    container.appendChild(scope);

    // Changes
    const changesGrid = document.createElement('div');
    changesGrid.className = 'std-changes-grid three-col';
    IEC_60228_CHANGES.changes.forEach(ch => {
      const card = document.createElement('div');
      card.className = 'std-change-card';
      card.style.setProperty('--ch-color', ch.color);
      card.innerHTML = `
        <div class="std-change-head">
          <span class="std-change-icon">${ch.icon}</span>
          <div><div class="std-change-title">${ch.title}</div></div>
          <span class="std-verify-badge">✓</span>
        </div>
        <p class="std-change-detail">${ch.detail}</p>
        <div class="std-change-impact"><strong>⚡ Impact:</strong> ${ch.impact}</div>
      `;
      changesGrid.appendChild(card);
    });
    container.appendChild(changesGrid);

    // Conductor Classes
    const clsTitle = document.createElement('h3');
    clsTitle.className = 'std-subsection-title';
    clsTitle.textContent = 'IEC 60228 Conductor Classes — Class 1, 2, 5, 6';
    container.appendChild(clsTitle);

    const clsGrid = document.createElement('div');
    clsGrid.className = 'conductor-cls-grid';

    IEC_60228_CHANGES.conductorClasses.forEach(cls => {
      const card = document.createElement('div');
      card.className = 'cls-card';
      card.style.setProperty('--cls-color', cls.color);
      const stdsHtml = (cls.standards || []).map(s => `<span class="cls-std-tag">${s}</span>`).join('');
      card.innerHTML = `
        <div class="cls-card-head">
          <div class="cls-label-badge" style="color:${cls.color};border-color:${cls.color}40;background:${cls.color}15">${cls.cls}</div>
          <div class="cls-label">${cls.label}</div>
        </div>
        <p class="cls-desc">${cls.description}</p>
        <div class="cls-props">
          <div class="cls-prop"><span class="cls-prop-k">Strand Count</span><span class="cls-prop-v">${cls.strandCount}</span></div>
          <div class="cls-prop"><span class="cls-prop-k">Max Strand Ø</span><span class="cls-prop-v">${cls.maxStrandDia}</span></div>
          <div class="cls-prop"><span class="cls-prop-k">Flex Rating</span><span class="cls-prop-v">${cls.flexRating}</span></div>
          <div class="cls-prop"><span class="cls-prop-k">Typical AWG</span><span class="cls-prop-v">${cls.awgEquiv}</span></div>
        </div>
        <div class="cls-app">${cls.typicalApplication}</div>
        <div class="cls-stds">${stdsHtml}</div>
      `;
      clsGrid.appendChild(card);
    });
    container.appendChild(clsGrid);

    // Related Standards
    const relTitle = document.createElement('h3');
    relTitle.className = 'std-subsection-title';
    relTitle.textContent = 'Related Standards Referencing IEC 60228 Conductor Classes';
    container.appendChild(relTitle);

    const relGrid = document.createElement('div');
    relGrid.className = 'related-stds-grid';
    IEC_60228_CHANGES.relatedStandards.forEach(rs => {
      const item = document.createElement('div');
      item.className = 'related-std-item';
      item.innerHTML = `
        <span class="related-std-code">${rs.std}</span>
        <span class="related-std-scope">${rs.scope}</span>
      `;
      relGrid.appendChild(item);
    });
    container.appendChild(relGrid);
  }

  /* ================================================================
     TAB 4 — ASTM Standards Reference
  ================================================================ */
  buildASTMPanel();

  function buildASTMPanel() {
    const container = document.getElementById('std-astm');
    if (!container) return;

    // Committee note
    const note = document.createElement('div');
    note.className = 'std-scope-note';
    note.innerHTML = `<strong>${ASTM_STANDARDS.committee}:</strong> ${ASTM_STANDARDS.scope}`;
    container.appendChild(note);

    // ASTM search
    const searchWrap = document.createElement('div');
    searchWrap.className = 'astm-search-wrap';
    searchWrap.innerHTML = `
      <input type="text" id="astm-search" class="astm-search" placeholder="Search ASTM standard code or keyword (e.g. B8, copper, aluminium, resistivity)…" />
      <span style="font-size:0.9rem;position:absolute;left:1rem;top:50%;transform:translateY(-50%);pointer-events:none">🔍</span>
    `;
    container.appendChild(searchWrap);

    // Category sections
    const astmBody = document.createElement('div');
    astmBody.id = 'astm-body';

    ASTM_STANDARDS.categories.forEach(cat => {
      const section = document.createElement('div');
      section.className = 'astm-category';
      section.dataset.catId = cat.id;
      section.style.setProperty('--cat-accent', cat.color);

      const catHead = document.createElement('div');
      catHead.className = 'astm-cat-head';
      catHead.innerHTML = `
        <span class="astm-cat-icon">${cat.icon}</span>
        <div>
          <div class="astm-cat-name" style="color:${cat.color}">${cat.label}</div>
          <div class="astm-cat-desc">${cat.description}</div>
        </div>
        <span class="astm-count-badge">${cat.standards.length} standards</span>
      `;
      section.appendChild(catHead);

      const tableWrap = document.createElement('div');
      tableWrap.className = 'astm-table-wrap';

      const rows = cat.standards.map(s => `
        <tr class="astm-row" data-search="${s.code.toLowerCase()} ${s.title.toLowerCase()} ${s.scope.toLowerCase()}">
          <td><span class="astm-code">${s.code}</span></td>
          <td><span class="astm-title">${s.title}</span></td>
          <td class="astm-scope-cell">${s.scope}${s.note ? `<span class="astm-note">${s.note}</span>` : ''}</td>
          <td><span class="astm-verified">✓</span></td>
        </tr>
      `).join('');

      tableWrap.innerHTML = `
        <table class="astm-table">
          <thead>
            <tr><th>Standard</th><th>Title</th><th>Scope</th><th>Verified</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      `;
      section.appendChild(tableWrap);
      astmBody.appendChild(section);
    });

    container.appendChild(astmBody);

    // ASTM search logic
    document.getElementById('astm-search').addEventListener('input', function () {
      const q = this.value.toLowerCase().trim();
      document.querySelectorAll('.astm-row').forEach(row => {
        const match = !q || row.dataset.search.includes(q);
        row.style.display = match ? '' : 'none';
      });
      document.querySelectorAll('.astm-category').forEach(cat => {
        const visRows = cat.querySelectorAll('.astm-row:not([style*="none"])');
        cat.style.display = visRows.length === 0 && q ? 'none' : '';
      });
    });
  }

  /* ── Reveal animations ── */
  const stdObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'none';
        stdObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  setTimeout(() => {
    document.querySelectorAll('.std-change-card, .ip-card, .gender-card, .cls-card, .astm-category').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = `opacity 0.4s ${i * 0.04}s ease, transform 0.4s ${i * 0.04}s ease`;
      stdObserver.observe(el);
    });
  }, 400);

})();
