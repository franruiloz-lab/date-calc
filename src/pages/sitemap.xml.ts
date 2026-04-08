// Sitemap generator — runs at build time, outputs /sitemap.xml
const SITE = 'https://countingdate.com';
const TODAY = new Date().toISOString().split('T')[0];

function url(path: string, priority: string, changefreq: string) {
  return `  <url>
    <loc>${SITE}${path}</loc>
    <lastmod>${TODAY}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

// ── Static pages ─────────────────────────────────────────────
const staticPages = [
  url('/',                           '1.0', 'daily'),
  url('/date-calculator/',           '0.9', 'monthly'),
  url('/days-between-dates/',        '0.9', 'monthly'),
  url('/age-calculator/',            '0.9', 'monthly'),
  url('/business-days-calculator/',  '0.9', 'monthly'),
  url('/days-left-in-year/',         '0.9', 'daily'),
  url('/privacy/',                   '0.3', 'yearly'),
  url('/cookie-policy/',             '0.3', 'yearly'),
  url('/terms/',                     '0.3', 'yearly'),
];

// ── Days from today / ago ─────────────────────────────────────
const daysFuture = [1,2,3,5,7,10,14,21,28,30,45,60,90,120,180,365];
const daysPast   = [1,2,3,5,7,10,14,21,28,30,45,60,90,120,180,365];

const daysFromPages = [
  ...daysFuture.map(n => url(`/days-from/${n}-days-from-today/`, '0.8', 'daily')),
  ...daysPast.map(n   => url(`/days-from/${n}-days-ago-from-today/`, '0.8', 'daily')),
  ...daysPast.map(n   => url(`/days-from/${n}-days-ago/`, '0.8', 'daily')),
];

// ── Hours from now ────────────────────────────────────────────
const hoursFromPages = [1,2,3,4,5,6,8,10,12,15,16,18,20,24,36,48,72,96,120].map(n =>
  url(`/hours-from/${n}-hours-from-now/`, '0.8', 'daily')
);

// ── Minutes from now ─────────────────────────────────────────
const minutesFromPages = [5,10,15,20,25,30,45,60,90,120,180].map(n =>
  url(`/minutes-from/${n}-minutes-from-now/`, '0.8', 'daily')
);

// ── Countdown timers ──────────────────────────────────────────
function pad(n: number) { return String(n).padStart(2, '0'); }

const countdownPages: string[] = [];
for (let h = 6; h <= 11; h++) {
  for (const m of [0, 15, 30, 45]) {
    countdownPages.push(url(`/countdown-timer/how-long-until-${h}-${pad(m)}-am/`, '0.8', 'daily'));
  }
}
for (let h = 12; h <= 23; h++) {
  const h12 = h === 12 ? 12 : h - 12;
  for (const m of [0, 15, 30, 45]) {
    countdownPages.push(url(`/countdown-timer/how-long-until-${h12}-${pad(m)}-pm/`, '0.8', 'daily'));
  }
}

// ── Assemble ──────────────────────────────────────────────────
const allUrls = [
  ...staticPages,
  ...daysFromPages,
  ...hoursFromPages,
  ...minutesFromPages,
  ...countdownPages,
].join('\n');

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls}
</urlset>`;

export async function GET() {
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
