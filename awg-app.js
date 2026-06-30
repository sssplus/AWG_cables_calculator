/* ============================================================
   CableSpec Pro — AWG Guide Application Logic
   ============================================================ */

(function initAWGGuide() {

  /* ── Tab switching ── */
  document.querySelectorAll('.awg-tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.awg-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.awg-panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.getElementById(btn.dataset.tab);
      if (panel) panel.classList.add('active');
    });
  });

  /* ================================================================
     TAB 1 — AWG Reference Table
  ================================================================ */
  (function buildAWGTable() {
    const tbody = document.getElementById('awg-tbody');
    if (!tbody) return;

    AWG_DATA.forEach((row, idx) => {
      const tr = document.createElement('tr');
      tr.style.animationDelay = `${idx * 0.04}s`;

      // sheath OD pills
      const odCells = Object.entries(row.od).map(([sheath, val]) => {
        const cls = { PVC: 'od-pvc', PUR: 'od-pur', TPE: 'od-tpe', Silicone: 'od-sil' }[sheath] || 'od-pvc';
        return `<span class="od-pill ${cls}">${sheath}: ${val} mm</span>`;
      }).join(' ');

      tr.innerHTML = `
        <td><span class="awg-num">${row.awg}</span></td>
        <td><span class="awg-mm2">${row.mm2}</span></td>
        <td><span class="awg-cond-od">${row.condOD} mm</span></td>
        <td><span class="awg-current">${row.currentA}</span></td>
        <td><span class="awg-res">${row.resistance}</span></td>
        <td><span class="od-pill od-pvc">${row.od.PVC} mm</span></td>
        <td><span class="od-pill od-pur">${row.od.PUR} mm</span></td>
        <td><span class="od-pill od-tpe">${row.od.TPE} mm</span></td>
        <td><span class="od-pill od-sil">${row.od.Silicone} mm</span></td>
        <td><span class="awg-use-badge ${row.useClass}">${row.useLabel}</span></td>
      `;

      // Tooltip title
      tr.title = row.note;
      tbody.appendChild(tr);
    });
  })();

  /* ================================================================
     TAB 2 — Sheath Compatibility Cards
  ================================================================ */
  (function buildSheathCards() {
    const container = document.getElementById('sheath-cards');
    if (!container) return;

    SHEATH_DATA.forEach(sheath => {
      const card = document.createElement('div');
      card.className = 'sheath-card';
      card.style.setProperty('--sc-color', sheath.color);

      const propsHtml = sheath.props.map(p => `
        <div class="sheath-prop">
          <span class="sheath-prop-key">${p.key}</span>
          <span class="sheath-prop-val">${p.val}</span>
        </div>
      `).join('');

      const awgTagsHtml = sheath.awgRange.slice(0, 10).map(a =>
        `<span class="sheath-awg-tag">${a} AWG</span>`
      ).join('');

      const usesHtml = sheath.uses.map(u =>
        `<span class="sheath-use-tag">${u}</span>`
      ).join('');

      card.innerHTML = `
        <div class="sheath-name">${sheath.name}</div>
        <div class="sheath-fullname">${sheath.fullName}</div>
        <div class="sheath-props">${propsHtml}</div>
        <div style="font-size:0.72rem;color:var(--text-dim);margin-bottom:0.4rem;text-transform:uppercase;letter-spacing:0.5px;">
          OD add (single-core)
        </div>
        <div style="font-family:var(--mono);font-size:0.78rem;color:var(--text-muted);margin-bottom:0.8rem;">${sheath.odAddSingle}</div>
        <div style="font-size:0.72rem;color:var(--text-dim);margin-bottom:0.4rem;text-transform:uppercase;letter-spacing:0.5px;">
          Compatible AWG
        </div>
        <div class="sheath-awg-range">${awgTagsHtml}</div>
        <div class="sheath-uses">${usesHtml}</div>
        <div style="margin-top:1rem;font-size:0.78rem;color:var(--text-dim);line-height:1.55;border-top:1px solid rgba(255,255,255,0.05);padding-top:0.8rem;">
          ${sheath.notes}
        </div>
      `;
      container.appendChild(card);
    });
  })();

  /* ================================================================
     TAB 3 — Connector Matrix (Interactive)
  ================================================================ */
  let selectedAWG = 24;
  let selectedSheath = 'all';

  (function buildMatrix() {
    buildAWGSelector();
    buildSheathBtns();
    renderCompatMatrix();
    renderODReadout();
  })();

  function buildAWGSelector() {
    const sel = document.getElementById('awg-selector');
    if (!sel) return;
    AWG_DATA.forEach(row => {
      const btn = document.createElement('button');
      btn.className = 'awg-sel-btn' + (row.awg === selectedAWG ? ' active' : '');
      btn.textContent = row.awg;
      btn.title = `${row.awg} AWG = ${row.mm2} mm² | ${row.currentA} | ${row.note}`;
      btn.addEventListener('click', () => {
        selectedAWG = row.awg;
        document.querySelectorAll('.awg-sel-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        renderCompatMatrix();
        renderODReadout();
      });
      sel.appendChild(btn);
    });
  }

  function buildSheathBtns() {
    document.querySelectorAll('.sheath-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.sheath-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        selectedSheath = btn.dataset.sheath;
        renderODReadout();
      });
    });
  }

  function getCompatibility(series, awg) {
    const compat = AWG_CONNECTOR_COMPAT[series];
    if (!compat) return 'incompatible';
    if (compat.ok.includes(awg)) return 'compatible';
    if (compat.marginal.includes(awg)) return 'marginal';
    return 'incompatible';
  }

  function renderCompatMatrix() {
    const matrix = document.getElementById('compat-matrix');
    if (!matrix) return;
    matrix.innerHTML = '';

    const awgRow = AWG_DATA.find(r => r.awg === selectedAWG);
    const awgMM2 = awgRow ? awgRow.mm2 : '?';

    M_SERIES.forEach(ms => {
      const compat = getCompatibility(ms.series, selectedAWG);
      const card = document.createElement('div');
      card.className = `matrix-card ${compat}`;

      const badgeClass = compat === 'compatible' ? 'badge-ok' : compat === 'marginal' ? 'badge-mg' : 'badge-no';
      const badgeLabel = compat === 'compatible' ? '✓ Compatible' : compat === 'marginal' ? '⚠ Marginal' : '✕ Too large';

      // Show pins relevant to the selected AWG
      const compatPins = ms.pins.filter(pin => {
        const awgStr = pin.awgMatch;
        const parts = awgStr.match(/(\d+)/g);
        if (!parts || parts.length < 2) return true;
        const hi = parseInt(parts[0]);
        const lo = parseInt(parts[1]);
        return selectedAWG <= hi && selectedAWG >= lo;
      });

      const pinsToShow = compat === 'incompatible' ? ms.pins.slice(0, 1) : (compatPins.length ? compatPins : ms.pins.slice(0, 3));

      const pinRowsHtml = pinsToShow.map(pin => {
        const gendersHtml = pin.gender.map(g =>
          `<span class="gender-tag ${g === 'M' ? 'gender-m' : 'gender-f'}">${g === 'M' ? '♂ Male' : '♀ Female'}</span>`
        ).join('');
        return `
          <div class="pin-row">
            <span class="pin-count">${typeof pin.count === 'number' ? pin.count + 'P' : pin.count}</span>
            <span class="pin-label">${pin.application}</span>
            <span class="pin-genders">${gendersHtml}</span>
          </div>
        `;
      }).join('');

      const cableRange = AWG_CONNECTOR_COMPAT[ms.series];
      const awgRangeStr = cableRange
        ? `${Math.max(...cableRange.ok)}–${Math.min(...cableRange.ok)} AWG (${ms.cableEntryMin}–${ms.cableEntryMax} cable Ø)`
        : 'See datasheet';

      card.innerHTML = `
        <div class="matrix-card-head">
          <span class="matrix-series">${ms.series}</span>
          <span class="matrix-compat-badge ${badgeClass}">${badgeLabel}</span>
        </div>
        <div class="matrix-card-body">
          <div class="pin-rows">${pinRowsHtml}</div>
          <div class="matrix-cable-range">
            Cable entry: <span class="matrix-cable-val">${ms.cableEntryMin}–${ms.cableEntryMax} mm Ø</span>
            &nbsp;|&nbsp; <span class="matrix-cable-val">${awgRangeStr.split('(')[0].trim()}</span>
          </div>
        </div>
      `;
      matrix.appendChild(card);
    });
  }

  function renderODReadout() {
    const awgRow = AWG_DATA.find(r => r.awg === selectedAWG);
    if (!awgRow) return;

    const odEl = document.getElementById('od-values');
    if (!odEl) return;
    odEl.innerHTML = '';

    const sheathColors = {
      PVC: { color: '#60a5fa', border: 'rgba(96,165,250,0.3)', bg: 'rgba(96,165,250,0.08)' },
      PUR: { color: '#34d399', border: 'rgba(52,211,153,0.3)', bg: 'rgba(52,211,153,0.08)' },
      TPE: { color: '#f472b6', border: 'rgba(244,114,182,0.3)', bg: 'rgba(244,114,182,0.08)' },
      Silicone: { color: '#fb923c', border: 'rgba(251,146,60,0.3)', bg: 'rgba(251,146,60,0.08)' },
    };

    const entries = selectedSheath === 'all'
      ? Object.entries(awgRow.od)
      : [[selectedSheath, awgRow.od[selectedSheath]]];

    entries.forEach(([sheath, od]) => {
      const c = sheathColors[sheath] || sheathColors.PVC;
      const pill = document.createElement('div');
      pill.className = 'od-val-pill';
      pill.style.color = c.color;
      pill.style.borderColor = c.border;
      pill.style.background = c.bg;
      pill.innerHTML = `<strong>${sheath}</strong> ${od} mm`;
      odEl.appendChild(pill);
    });

    // Also show mm²
    const mm2pill = document.createElement('div');
    mm2pill.className = 'od-val-pill';
    mm2pill.style.color = '#38bdf8';
    mm2pill.style.borderColor = 'rgba(56,189,248,0.3)';
    mm2pill.style.background = 'rgba(56,189,248,0.07)';
    mm2pill.innerHTML = `Conductor: ${awgRow.mm2} mm² · ${awgRow.condOD} mm Ø`;
    odEl.appendChild(mm2pill);
  }

  /* ================================================================
     TAB 4 — M-Series Detail Cards
  ================================================================ */
  (function buildMSeriesCards() {
    const container = document.getElementById('mseries-cards');
    if (!container) return;

    M_SERIES.forEach(ms => {
      const card = document.createElement('div');
      card.className = 'ms-card';
      card.style.setProperty('--ms-color', ms.color);
      card.style.setProperty('--ms-glow', ms.glow);
      card.style.setProperty('--ms-bg-a', ms.bgA);
      card.style.setProperty('--ms-bg-b', ms.bgB);

      const awgTagsHtml = ms.awgCompatible.map(a =>
        `<span class="ms-awg-tag">${a} AWG</span>`
      ).join('');

      const pinRowsHtml = ms.pins.map(pin => {
        const gendersHtml = pin.gender.map(g =>
          `<span class="gender-tag ${g === 'M' ? 'gender-m' : 'gender-f'}">${g === 'M' ? '♂' : '♀'}</span>`
        ).join(' ');
        return `
          <tr>
            <td><span class="ms-pin-num">${typeof pin.count === 'number' ? pin.count + 'P' : pin.count}</span></td>
            <td><span class="ms-keying">${pin.keying}</span></td>
            <td><span class="ms-awg-match">${pin.awgMatch}</span></td>
            <td>${gendersHtml}</td>
            <td style="max-width:120px;font-size:0.72rem;color:var(--text-dim);">${pin.application}</td>
            <td style="font-family:var(--mono);font-size:0.72rem;color:var(--orange);">${pin.maxCurrent}</td>
          </tr>
        `;
      }).join('');

      card.innerHTML = `
        <div class="ms-card-head">
          <div>
            <div class="ms-series-name">${ms.series}</div>
            <div style="font-size:0.78rem;color:var(--text-dim);margin-top:0.4rem;">${ms.description}</div>
          </div>
          <span class="ms-ip-badge">${ms.ipRating}</span>
        </div>
        <div class="ms-card-body">
          <div class="ms-spec-grid">
            <div class="ms-spec-item">
              <div class="ms-spec-key">Thread Dia.</div>
              <div class="ms-spec-val">${ms.threadDia}</div>
            </div>
            <div class="ms-spec-item">
              <div class="ms-spec-key">Cable Entry</div>
              <div class="ms-spec-val">${ms.cableEntryMin}–${ms.cableEntryMax} mm</div>
            </div>
            <div class="ms-spec-item">
              <div class="ms-spec-key">Temp Range</div>
              <div class="ms-spec-val" style="font-size:0.75rem;">${ms.tempRange}</div>
            </div>
            <div class="ms-spec-item">
              <div class="ms-spec-key">Mating Cycles</div>
              <div class="ms-spec-val">${ms.matings}</div>
            </div>
            <div class="ms-spec-item" style="grid-column:1/-1;">
              <div class="ms-spec-key">Standard</div>
              <div class="ms-spec-val" style="font-size:0.78rem;">${ms.standard}</div>
            </div>
            <div class="ms-spec-item" style="grid-column:1/-1;">
              <div class="ms-spec-key">Keying Codes</div>
              <div class="ms-spec-val" style="font-size:0.78rem;">${ms.keying}</div>
            </div>
          </div>

          <div style="font-size:0.72rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.5rem;">
            Compatible AWG
          </div>
          <div class="ms-awg-compat">${awgTagsHtml}</div>

          <div style="font-size:0.72rem;color:var(--text-dim);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:0.5rem;">
            Pin Configurations
          </div>
          <div style="overflow-x:auto;">
            <table class="ms-pin-table">
              <thead>
                <tr>
                  <th>Pins</th>
                  <th>Keying</th>
                  <th>AWG Range</th>
                  <th>Gender</th>
                  <th>Application</th>
                  <th>Max I</th>
                </tr>
              </thead>
              <tbody>${pinRowsHtml}</tbody>
            </table>
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  })();

  /* ── Reveal animations for AWG cards ── */
  const awgObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'none';
        awgObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  function observeAWGCards() {
    document.querySelectorAll('.sheath-card, .ms-card, .matrix-card').forEach((el, i) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = `opacity 0.4s ${i * 0.05}s ease, transform 0.4s ${i * 0.05}s ease`;
      awgObserver.observe(el);
    });
  }
  // Observe after a short delay to allow DOM to settle
  setTimeout(observeAWGCards, 200);

})();
