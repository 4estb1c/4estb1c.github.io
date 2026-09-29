/* Small dependency-free SVG charts. Inputs are plain data, never markup. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const palette = ['#7a392b', '#4d6d65', '#9a7b4e', '#65508b'];
  const el = (tag, attrs = {}, value) => {
    const node = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([key, val]) => node.setAttribute(key, String(val)));
    if (value != null) node.textContent = String(value);
    return node;
  };
  const num = value => value === '' || value == null ? NaN : Number(value);
  const nice = value => Number.isFinite(value)
    ? (Math.abs(value) >= 1000 ? Math.round(value).toLocaleString() : Number(value.toPrecision(3)).toString())
    : '';
  const safeColor = (value, fallback) => typeof value === 'string' && /^(#[\da-f]{3,8}|[a-z]+)$/i.test(value) ? value : fallback;
  const base = () => el('svg', { viewBox: '0 0 400 245', role: 'img', focusable: 'false' });
  const niceRange = values => {
    const finite = values.filter(Number.isFinite);
    if (!finite.length) return [0, 1];
    let min = Math.min(...finite), max = Math.max(...finite);
    if (min === max) { const pad = Math.abs(min) * .08 || 1; min -= pad; max += pad; }
    return [min, max];
  };
  const validData = (series, keys = ['x', 'y']) => (series || []).map(item => ({
    ...item,
    data: (Array.isArray(item.data) ? item.data : []).filter(point => point && keys.every(key => Number.isFinite(num(point[key]))))
  }));
  const extent = (series, key) => niceRange(series.flatMap(item => item.data.map(point => num(point[key]))));
  const linear = (min, max, from, to) => value => from + ((value - min) * (to - from)) / (max - min);
  function marker(svg, x, y, color, index) {
    const style = { fill: color, class: 'chart-dot' };
    if (index % 3 === 1) svg.append(el('rect', { x: x - 3.5, y: y - 3.5, width: 7, height: 7, ...style }));
    else if (index % 3 === 2) svg.append(el('polygon', { points: `${x},${y - 4.5} ${x + 4.5},${y} ${x},${y + 4.5} ${x - 4.5},${y}`, ...style }));
    else svg.append(el('circle', { cx: x, cy: y, r: 3.7, ...style }));
  }
  function axes(svg, xr, yr, xLabel, yLabel) {
    const left = 48, right = 388, top = 16, bottom = 184;
    svg.append(el('line', { x1: left, y1: bottom, x2: right, y2: bottom, class: 'chart-axis' }));
    svg.append(el('line', { x1: left, y1: top, x2: left, y2: bottom, class: 'chart-axis' }));
    for (let i = 0; i < 4; i++) {
      const ratio = i / 3, x = left + ratio * (right - left), y = bottom - ratio * (bottom - top);
      svg.append(el('text', { x, y: 202, class: 'chart-label', 'text-anchor': 'middle' }, nice(xr[0] + (xr[1] - xr[0]) * ratio)));
      svg.append(el('text', { x: 41, y: y + 3, class: 'chart-label', 'text-anchor': 'end' }, nice(yr[0] + (yr[1] - yr[0]) * ratio)));
    }
    if (xLabel) svg.append(el('text', { x: 218, y: 218, class: 'chart-label', 'text-anchor': 'middle' }, xLabel));
    if (yLabel) svg.append(el('text', { x: 12, y: 100, class: 'chart-label', transform: 'rotate(-90 12 100)', 'text-anchor': 'middle' }, yLabel));
  }
  function cartesian(figure) {
    const series = validData(figure.series), xr = extent(series, 'x'), yr = extent(series, 'y'), svg = base();
    axes(svg, xr, yr, figure.xLabel, figure.yLabel);
    return { svg, series, x: linear(xr[0], xr[1], 48, 388), y: linear(yr[0], yr[1], 184, 16) };
  }
  function line(figure) {
    const { svg, series, x, y } = cartesian(figure);
    series.forEach((item, index) => {
      if (!item.data.length) return;
      const points = item.data.map(point => `${x(num(point.x))},${y(num(point.y))}`).join(' ');
      svg.append(el('polyline', { points, stroke: safeColor(item.color, palette[index % palette.length]), 'stroke-dasharray': index % 3 === 1 ? '7 4' : index % 3 === 2 ? '2 3' : 'none', class: 'chart-line' }));
      if (item.data.length === 1) marker(svg, x(num(item.data[0].x)), y(num(item.data[0].y)), safeColor(item.color, palette[index % palette.length]), index);
    });
    return svg;
  }
  function scatter(figure) {
    const { svg, series, x, y } = cartesian(figure);
    series.forEach((item, index) => item.data.forEach(point => marker(svg, x(num(point.x)), y(num(point.y)), safeColor(item.color, palette[index % palette.length]), index)));
    return svg;
  }
  function bars(figure) {
    const item = Array.isArray(figure.series) ? figure.series[0] : null;
    const data = (Array.isArray(item?.data) ? item.data : []).filter(point => point && Number.isFinite(num(point.y)));
    const svg = base();
    const [min, max] = niceRange([0, ...data.map(point => num(point.y))]);
    const scale = linear(min, max, 184, 16), zero = scale(0), span = 340;
    svg.append(el('line', { x1: 48, y1: zero, x2: 388, y2: zero, class: 'chart-axis' }));
    if (!data.length) {
      svg.append(el('text', { x: 218, y: 108, class: 'chart-label', 'text-anchor': 'middle' }, 'No numeric data'));
      return svg;
    }
    const step = span / data.length, width = Math.min(48, step * .64);
    data.forEach((point, index) => {
      const value = num(point.y), x = 48 + index * step + (step - width) / 2, y = Math.min(scale(value), zero), height = Math.max(1, Math.abs(zero - scale(value)));
      svg.append(el('rect', { x, y, width, height, fill: safeColor(item.color, palette[0]) }));
      svg.append(el('text', { x: x + width / 2, y: value >= 0 ? Math.max(12, y - 5) : Math.min(196, y + height + 12), class: 'chart-value', 'text-anchor': 'middle' }, nice(value)));
      const label = String(point.x ?? index + 1), maxChars = Math.max(5, Math.floor(step / 5.5));
      const words = label.split(/\s+/), lines = [];
      let line = '';
      words.forEach(word => {
        while (word.length > maxChars) { if (line) { lines.push(line); line = ''; } lines.push(`${word.slice(0, maxChars - 1)}‐`); word = word.slice(maxChars - 1); }
        if (line && `${line} ${word}`.length > maxChars) { lines.push(line); line = word; } else line = line ? `${line} ${word}` : word;
      });
      if (line) lines.push(line);
      const labelNode = el('text', { x: x + width / 2, y: 201, class: 'chart-label', 'text-anchor': 'middle' });
      lines.slice(0, 3).forEach((part, lineIndex) => labelNode.append(el('tspan', { x: x + width / 2, dy: lineIndex ? 11 : 0 }, part)));
      svg.append(labelNode);
    });
    if (figure.yLabel) svg.append(el('text', { x: 48, y: 12, class: 'chart-label' }, figure.yLabel));
    return svg;
  }
  function table(figure) {
    const columns = Array.isArray(figure.columns) ? figure.columns : [];
    const table = document.createElement('table'); table.className = 'chart-table';
    const head = document.createElement('thead'), header = document.createElement('tr');
    columns.forEach(column => { const cell = document.createElement('th'); cell.scope = 'col'; cell.textContent = String(column.label ?? column.key ?? ''); header.append(cell); });
    head.append(header); table.append(head);
    const body = document.createElement('tbody');
    (Array.isArray(figure.rows) ? figure.rows : []).forEach(row => {
      const tr = document.createElement('tr');
      columns.forEach(column => {
        const cell = document.createElement('td'), value = row?.[column.key];
        cell.textContent = column.format === 'number' && Number.isFinite(num(value)) ? nice(num(value)) : String(value ?? '');
        tr.append(cell);
      });
      body.append(tr);
    });
    table.append(body); return table;
  }
  function histogram(figure) {
    const first = Array.isArray(figure.series) ? figure.series[0] : null;
    const rawValues = Array.isArray(figure.values) ? figure.values.map(num)
      : (Array.isArray(first?.data) ? first.data.map(point => num(point?.value ?? point?.y)) : []);
    const values = rawValues.filter(Number.isFinite);
    let bins = [];
    if (Array.isArray(figure.bins) && figure.bins.length) {
      if (figure.bins.every(bin => Number.isFinite(num(bin)))) {
        const edges = figure.bins.map(num).sort((a, b) => a - b);
        bins = edges.slice(0, -1).map((min, index) => {
          const max = edges[index + 1];
          return { min, max, count: values.filter(value => value >= min && (value < max || (index === edges.length - 2 && value <= max))).length, label: `${nice(min)}–${nice(max)}` };
        });
      } else bins = figure.bins.map(bin => {
        if (typeof bin === 'number') return { min: bin, max: NaN, count: 0 };
        return { min: num(bin.min ?? bin.start), max: num(bin.max ?? bin.end), count: Number.isFinite(num(bin.count)) ? num(bin.count) : null, label: bin.label };
      }).filter(bin => Number.isFinite(bin.min));
      bins.sort((a, b) => a.min - b.min);
      bins.forEach((bin, i) => {
        const next = bins[i + 1];
        if (!Number.isFinite(bin.max)) bin.max = next?.min ?? bin.min;
        if (bin.count == null) bin.count = values.filter(value => value >= bin.min && (value < bin.max || (!next && value <= bin.max))).length;
        if (!bin.label) bin.label = `${nice(bin.min)}–${nice(bin.max)}`;
      });
    } else if (values.length) {
      let min = Math.min(...values), max = Math.max(...values);
      if (min === max) { min -= .5; max += .5; }
      const count = Math.max(1, Math.min(20, Math.floor(num(figure.binCount) || Math.ceil(Math.sqrt(values.length)))));
      const width = (max - min) / count;
      bins = Array.from({ length: count }, (_, i) => ({ min: min + i * width, max: i === count - 1 ? max : min + (i + 1) * width, count: 0 }));
      values.forEach(value => { const index = Math.min(count - 1, Math.floor((value - min) / width)); bins[index].count++; });
      bins.forEach(bin => { bin.label = `${nice(bin.min)}–${nice(bin.max)}`; });
    }
    return bars({ ...figure, type: 'bar', series: [{ color: first?.color, data: bins.map(bin => ({ x: bin.label, y: bin.count })) }] });
  }
  window.MarginCharts = { render(figure) {
    if (!figure || typeof figure !== 'object') return null;
    switch (figure.type) {
      case 'table': return table(figure);
      case 'bar': return bars(figure);
      case 'histogram': return histogram(figure);
      case 'scatter': return scatter(figure);
      case 'line': return line(figure);
      default: return null;
    }
  } };
})();
