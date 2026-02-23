// =============================================
// RESULTS PAGE — Rendering
// =============================================

function renderSummaryCards(hosted, aws, onprem) {
  const options = [
    { key: 'hosted', label: 'Exacaster Hosted', data: hosted, cls: 'hosted' },
    { key: 'aws', label: 'Self-Hosted AWS', data: aws, cls: 'aws' },
    { key: 'onprem', label: 'Self-Hosted On-Prem', data: onprem, cls: 'onprem' }
  ];

  const cheapest = options.reduce((a, b) => a.data.tco5 < b.data.tco5 ? a : b);

  const html = options.map(o => {
    const badge = o.key === cheapest.key ? '<span class="badge">Recommended</span>' : '';
    return `<div class="card ${o.cls}">
      ${badge}
      <div class="card-label">${o.label}</div>
      <div class="card-price">${fmt(o.data.totalAnnual)}</div>
      <div class="card-sub">Annual Recurring</div>
      <div class="card-details">
        <div class="card-detail"><span class="label">Deployment Fee</span><span class="value">${fmtFull(o.data.deployFee)}</span></div>
        <div class="card-detail"><span class="label">Implementation</span><span class="value">${fmtFull(o.data.implCost)}</span></div>
        <div class="card-detail"><span class="label">Year 1 Total</span><span class="value">${fmtFull(o.data.year1)}</span></div>
        <div class="card-detail" style="border-top:1px solid var(--light);padding-top:6px;margin-top:2px"><span class="label" style="font-weight:600">5-Year TCO</span><span class="value" style="font-size:1rem">${fmt(o.data.tco5)}</span></div>
      </div>
    </div>`;
  }).join('');

  document.getElementById('summaryCards').innerHTML = html;
}

function renderCompetitorTable(recommended, competitors) {
  const ourTCO = recommended.tco5;
  const ourAnnual = recommended.totalAnnual;
  const ourImpl = recommended.deployFee + recommended.implCost;

  let rows = `<tr style="background:rgba(39,204,180,0.08)">
    <td style="font-weight:700">OpenCVM (${recommended.label})</td>
    <td class="number">${fmtFull(ourAnnual)}</td>
    <td class="number">${fmtFull(ourImpl)}</td>
    <td class="number">\u20AC0</td>
    <td class="number" style="font-weight:700">${fmtFull(ourTCO)}</td>
    <td class="number">\u2014</td>
  </tr>`;

  const compEntries = Object.entries(competitors).sort((a,b) => a[1].tco5 - b[1].tco5);

  for (const [name, data] of compEntries) {
    const savings = pctSavings(ourTCO, data.tco5);
    rows += `<tr>
      <td>${name}</td>
      <td class="number">${fmtFull(data.annualPlatform)}</td>
      <td class="number">${fmtFull(data.impl)}</td>
      <td class="number">${fmtFull(data.support)}</td>
      <td class="number" style="font-weight:600">${fmtFull(data.tco5)}</td>
      <td class="number savings-positive">${savings}</td>
    </tr>`;
  }

  const html = `<table>
    <thead><tr>
      <th>Platform</th>
      <th>Annual Platform</th>
      <th>Implementation</th>
      <th>Annual Support</th>
      <th>5-Year TCO</th>
      <th>OpenCVM Saves</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>`;

  document.getElementById('competitorTable').innerHTML = html;

  // Bar chart
  const allEntries = [{ name: 'OpenCVM', tco5: ourTCO }, ...compEntries.map(([n,d]) => ({ name: n, tco5: d.tco5 }))];
  const maxTCO = Math.max(...allEntries.map(e => e.tco5));
  const chartW = 700, barH = 28, gap = 8, labelW = 130, valueW = 100;
  const chartH = allEntries.length * (barH + gap) + 20;
  const barAreaW = chartW - labelW - valueW - 20;

  let bars = '';
  allEntries.forEach((e, i) => {
    const y = i * (barH + gap) + 10;
    const w = (e.tco5 / maxTCO) * barAreaW;
    const color = e.name === 'OpenCVM' ? 'var(--green)' : '#CBD5E0';
    bars += `<text x="${labelW - 8}" y="${y + barH/2 + 4}" text-anchor="end" font-size="11" font-weight="${e.name==='OpenCVM'?'700':'400'}" fill="var(--dark)">${e.name}</text>`;
    bars += `<rect x="${labelW}" y="${y}" width="${w}" height="${barH}" rx="4" fill="${color}"/>`;
    bars += `<text x="${labelW + w + 8}" y="${y + barH/2 + 4}" font-size="11" font-weight="600" fill="var(--dark)">${fmt(e.tco5)}</text>`;
  });

  document.getElementById('competitorChart').innerHTML = `<svg viewBox="0 0 ${chartW} ${chartH}" xmlns="http://www.w3.org/2000/svg" style="font-family:var(--font)">${bars}</svg>`;
}

function renderTCOChart(recommended, competitors) {
  const W = 750, H = 380, pad = { t: 30, r: 120, b: 50, l: 80 };
  const plotW = W - pad.l - pad.r;
  const plotH = H - pad.t - pad.b;

  const compColors = ['#A0AEC0','#718096','#E53E3E','#DD6B20','#805AD5','#2B6CB0'];
  const compEntries = Object.entries(competitors).sort((a,b) => a[1].tco5 - b[1].tco5);

  const lines = [
    {
      name: 'OpenCVM',
      color: 'var(--green)',
      weight: 3,
      data: (() => {
        const impl = recommended.deployFee + recommended.implCost;
        const pts = [impl];
        for (let y = 1; y <= 5; y++) pts.push(impl + recommended.totalAnnual * y);
        return pts;
      })()
    },
    ...compEntries.map(([name, data], i) => ({
      name: name.replace(' CDP','').replace(' RT-CDP',''),
      color: compColors[i % compColors.length],
      weight: 1.5,
      data: (() => {
        const pts = [data.impl];
        for (let y = 1; y <= 5; y++) pts.push(data.impl + (data.annualPlatform + data.support) * y);
        return pts;
      })()
    }))
  ];

  const maxVal = Math.max(...lines.flatMap(l => l.data));
  const niceMax = Math.ceil(maxVal / 500000) * 500000;

  function x(yr) { return pad.l + (yr / 5) * plotW; }
  function y(val) { return pad.t + (1 - val / niceMax) * plotH; }

  let svg = '';

  // Grid lines
  const gridSteps = 5;
  for (let i = 0; i <= gridSteps; i++) {
    const val = (niceMax / gridSteps) * i;
    const yPos = y(val);
    svg += `<line x1="${pad.l}" y1="${yPos}" x2="${W - pad.r}" y2="${yPos}" stroke="#E2E8F0" stroke-width="1"/>`;
    svg += `<text x="${pad.l - 8}" y="${yPos + 4}" text-anchor="end" font-size="10" fill="#8B95A5">${fmt(val)}</text>`;
  }

  // X axis labels
  for (let yr = 0; yr <= 5; yr++) {
    svg += `<text x="${x(yr)}" y="${H - pad.b + 20}" text-anchor="middle" font-size="11" fill="var(--dark)">Year ${yr}</text>`;
  }

  // Draw competitor lines first (behind), then OpenCVM on top
  const [ocvmLine, ...compLines] = lines;

  compLines.forEach(line => {
    const points = line.data.map((val, i) => `${x(i)},${y(val)}`).join(' ');
    svg += `<polyline points="${points}" fill="none" stroke="${line.color}" stroke-width="${line.weight}" stroke-linejoin="round" opacity="0.5"/>`;
    const lastVal = line.data[5];
    svg += `<circle cx="${x(5)}" cy="${y(lastVal)}" r="3" fill="${line.color}" opacity="0.6"/>`;
    svg += `<text x="${x(5) + 8}" y="${y(lastVal) + 4}" font-size="9" fill="${line.color}" opacity="0.8">${line.name}</text>`;
  });

  // OpenCVM line (bold, on top)
  const ocvmPts = ocvmLine.data.map((val, i) => `${x(i)},${y(val)}`).join(' ');
  svg += `<polyline points="${ocvmPts}" fill="none" stroke="${ocvmLine.color}" stroke-width="${ocvmLine.weight}" stroke-linejoin="round"/>`;
  ocvmLine.data.forEach((val, i) => {
    svg += `<circle cx="${x(i)}" cy="${y(val)}" r="4.5" fill="${ocvmLine.color}" stroke="white" stroke-width="2"/>`;
  });
  const ocvmLast = ocvmLine.data[5];
  svg += `<text x="${x(5) + 8}" y="${y(ocvmLast) + 4}" font-size="11" font-weight="700" fill="var(--dark)">OpenCVM</text>`;

  // Savings annotation at Year 5
  const worstComp = lines.reduce((a, b) => a.data[5] > b.data[5] ? a : b);
  if (worstComp.name !== 'OpenCVM') {
    const midY = (y(ocvmLast) + y(worstComp.data[5])) / 2;
    const savingsAmt = worstComp.data[5] - ocvmLast;
    svg += `<line x1="${x(5) - 4}" y1="${y(ocvmLast)}" x2="${x(5) - 4}" y2="${y(worstComp.data[5])}" stroke="var(--green)" stroke-width="1.5" stroke-dasharray="4,3"/>`;
    svg += `<text x="${x(5) - 10}" y="${midY + 4}" text-anchor="end" font-size="10" font-weight="600" fill="var(--dark)">Save ${fmt(savingsAmt)}</text>`;
  }

  // Axis lines
  svg += `<line x1="${pad.l}" y1="${pad.t}" x2="${pad.l}" y2="${H - pad.b}" stroke="var(--dark)" stroke-width="1.5"/>`;
  svg += `<line x1="${pad.l}" y1="${H - pad.b}" x2="${W - pad.r}" y2="${H - pad.b}" stroke="var(--dark)" stroke-width="1.5"/>`;

  document.getElementById('tcoChart').innerHTML = `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="font-family:var(--font)">${svg}</svg>`;
}

// =============================================
// INIT
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  const params = new URLSearchParams(window.location.search);
  const inp = getInputsFromParams(params);

  // Config summary
  const regionName = REGION_NAMES[inp.region] || 'Unknown';
  const apps = ['Core', inp.flow ? 'Flow' : null, inp.nbo ? 'NBO' : null, inp.churn ? 'Churn' : null].filter(Boolean).join(', ');
  document.getElementById('configSummary').textContent =
    `${inp.company} \u2014 ${fmtSubs(inp.subs)} subscribers, ${regionName}, ${inp.sla}, ${apps}`;

  // Calculate
  const hosted = calcHosted(inp);
  const aws = calcAWS(inp);
  const onprem = calcOnPrem(inp);
  const competitors = calcCompetitors(inp);

  // Find recommended (cheapest 5-year TCO)
  const options = [
    { label: 'Hosted', data: hosted },
    { label: 'Self-Hosted AWS', data: aws },
    { label: 'Self-Hosted On-Prem', data: onprem }
  ];
  const best = options.reduce((a, b) => a.data.tco5 < b.data.tco5 ? a : b);
  const recommended = { ...best.data, label: best.label };

  // Render
  renderSummaryCards(hosted, aws, onprem);
  renderCompetitorTable(recommended, competitors);
  renderTCOChart(recommended, competitors);

  // Download PDF
  document.getElementById('downloadBtn').addEventListener('click', async () => {
    const btn = document.getElementById('downloadBtn');
    btn.disabled = true;
    btn.classList.add('loading');

    try {
      const response = await fetch('/api/pdf?' + params.toString());
      if (!response.ok) throw new Error('PDF generation failed');
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `OpenCVM_Pricing_${inp.company.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to generate PDF. Please try again.');
      console.error(err);
    } finally {
      btn.disabled = false;
      btn.classList.remove('loading');
    }
  });
});
