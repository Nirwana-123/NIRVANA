const SKIN = ['#f1c9a5', '#d9a77c', '#b98259', '#e9bf99'];
const HAIR = ['#5a3b2a', '#2b1d17', '#1f1511', '#7a4a2a'];
const INK = '#2f2018';

const arm = (x1, y1, x2, y2, color) =>
  `<path d="M${x1} ${y1}L${x2} ${y2}" stroke="${color}" stroke-width="7" stroke-linecap="round" fill="none"/>`;

const kid = (x, skin, hair, shirt) =>
  `<rect x="${x - 15}" y="68" width="30" height="44" rx="14" fill="${shirt}"/>` +
  `<circle cx="${x}" cy="52" r="15" fill="${skin}"/>` +
  `<path d="M${x - 15} 51Q${x - 15} 35 ${x} 35Q${x + 15} 35 ${x + 15} 51Q${x + 6} 43 ${x} 44Q${x - 6} 43 ${x - 15} 51Z" fill="${hair}"/>` +
  `<circle cx="${x - 5}" cy="54" r="1.8" fill="${INK}"/><circle cx="${x + 5}" cy="54" r="1.8" fill="${INK}"/>` +
  `<path d="M${x - 5} 60Q${x} 66 ${x + 5} 60" fill="none" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>`;

const heart = (x, y, color, scale = 1) =>
  `<g transform="translate(${x} ${y}) scale(${scale})"><path class="prop" d="M0 8C-14-4-8-16 0-8C8-16 14-4 0 8Z" fill="${color}"/></g>`;

const sparkle = (x, y, color) =>
  `<g transform="translate(${x} ${y})"><path class="prop" d="M0-6V6M-6 0H6" stroke="${color}" stroke-width="2" stroke-linecap="round"/></g>`;

const svg = (inner, label) =>
  `<svg viewBox="0 0 140 112" role="img" aria-label="${label}">${inner}</svg>`;

export const stepAvatars = [
  svg(
    kid(70, SKIN[0], HAIR[0], '#f2c14e') +
      arm(58, 78, 48, 92, SKIN[0]) + arm(82, 78, 92, 92, SKIN[0]) +
      `<path d="M42 90L70 82L98 90V104L70 96L42 104Z" fill="#f5f1e6" stroke="#8cc3dd" stroke-width="1.5"/>` +
      `<path d="M70 82V96" stroke="#8cc3dd" stroke-width="1.5"/>` +
      sparkle(112, 30, '#f2c14e') + sparkle(28, 40, '#f2c14e'),
    'Child reading a book',
  ),
  svg(
    kid(42, SKIN[1], HAIR[1], '#8cc3dd') + kid(98, SKIN[2], HAIR[2], '#e8a0a8') +
      arm(52, 80, 70, 88, SKIN[1]) + arm(88, 80, 70, 88, SKIN[2]) +
      `<circle cx="70" cy="88" r="4.5" fill="${SKIN[1]}"/>` +
      heart(70, 22, '#e8a0a8', 1.5),
    'Two children holding hands under a heart',
  ),
  svg(
    `<g><circle class="prop glow" cx="100" cy="26" r="20" fill="#f2c14e" opacity="0.25"/></g>` +
      kid(58, SKIN[3], HAIR[3], '#b9a9d9') +
      arm(46, 78, 40, 94, SKIN[3]) + arm(70, 76, 86, 52, SKIN[3]) +
      `<circle cx="87" cy="48" r="4.5" fill="${SKIN[3]}"/>` +
      `<circle cx="100" cy="26" r="9" fill="#f2c14e"/><rect x="95.5" y="35" width="9" height="5" rx="1.5" fill="#cfa238"/>` +
      `<path d="M100 10V5M86 16L83 12M114 16L117 12" stroke="#f2c14e" stroke-width="2" stroke-linecap="round"/>`,
    'Child with a raised hand and a bright idea',
  ),
  svg(
    kid(30, SKIN[0], HAIR[2], '#a9c8a2') + kid(110, SKIN[2], HAIR[0], '#f0b58f') +
      arm(42, 78, 58, 84, SKIN[0]) + arm(98, 78, 94, 86, SKIN[2]) +
      `<rect x="80" y="70" width="20" height="20" rx="3" fill="#f2c14e"/>` +
      `<rect x="56" y="70" width="20" height="20" rx="3" fill="#8cc3dd"/><circle cx="78" cy="80" r="5" fill="#8cc3dd"/>` +
      sparkle(70, 40, '#8cc3dd'),
    'Two children solving a puzzle together',
  ),
  svg(
    arm(40, 80, 100, 80, SKIN[1]).replace('stroke-width="7"', 'stroke-width="9"') +
      kid(30, SKIN[1], HAIR[1], '#e8a0a8') + kid(70, SKIN[0], HAIR[3], '#f2c14e') + kid(110, SKIN[2], HAIR[2], '#8cc3dd') +
      heart(70, 18, '#e8a0a8', 1.3),
    'Three friends standing arm in arm',
  ),
  svg(
    `<ellipse cx="108" cy="108" rx="16" ry="5" fill="#8a6a4a"/>` +
      `<path d="M108 106V84" stroke="#6f9c6a" stroke-width="3" stroke-linecap="round"/>` +
      `<path d="M108 94Q96 92 96 82Q106 82 108 94Z" fill="#6f9c6a"/><path d="M108 88Q120 86 120 76Q110 76 108 88Z" fill="#6f9c6a"/>` +
      kid(34, SKIN[3], HAIR[0], '#a9c8a2') +
      arm(46, 78, 62, 86, SKIN[3]) +
      `<rect x="60" y="78" width="22" height="16" rx="3" fill="#8cc3dd"/>` +
      `<path d="M82 82L96 70" stroke="#8cc3dd" stroke-width="4" stroke-linecap="round"/>` +
      `<ellipse class="drop" cx="99" cy="74" rx="1.8" ry="2.6" fill="#8cc3dd"/>` +
      `<ellipse class="drop d2" cx="102" cy="74" rx="1.8" ry="2.6" fill="#8cc3dd"/>` +
      `<ellipse class="drop d3" cx="96" cy="74" rx="1.8" ry="2.6" fill="#8cc3dd"/>`,
    'Child watering a young plant',
  ),
];
