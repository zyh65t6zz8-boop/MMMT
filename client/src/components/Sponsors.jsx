import './Sponsors.css';

const SPONSORS = [
  {
    name: '6D Helmets',
    category: 'Head Protection',
    description: 'Advanced helmet technology engineered for impact management and rider safety.',
    url: 'https://www.6dhelmets.com',
    accent: '#cc0000',
  },
  {
    name: 'Leatt',
    category: 'Protection & Apparel',
    description: 'Neck braces, body armor, helmets, and gear built for motocross and off-road.',
    url: 'https://www.leatt.com',
    accent: '#22c55e',
  },
  {
    name: 'Dirt Tricks',
    category: 'Sprockets',
    description: 'Precision-machined sprockets built to handle the punishment of off-road racing.',
    url: 'https://www.dirttricks.com',
    accent: '#ffc107',
  },
  {
    name: 'Flow Vision',
    category: 'Goggles',
    description: 'High-performance goggles designed for clarity and comfort on any terrain.',
    url: 'https://www.flowvision.com',
    accent: '#3b82f6',
  },
];

export default function Sponsors() {
  return (
    <div className="sponsors-page">
      <div className="sponsors-header">
        <p className="sponsors-badge">NORTHERN NEVADA</p>
        <h1 className="sponsors-title">Team Sponsors</h1>
        <p className="sponsors-subtitle">Proud partners of the Moto Mouth Mini Team</p>
      </div>

      <div className="sponsors-grid">
        {SPONSORS.map((sponsor) => (
          <a
            key={sponsor.name}
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer"
            className="sponsor-card"
            style={{ '--accent': sponsor.accent }}
          >
            <div className="sponsor-card-accent" />
            <div className="sponsor-card-body">
              <p className="sponsor-category">{sponsor.category}</p>
              <h2 className="sponsor-name">{sponsor.name}</h2>
              <p className="sponsor-desc">{sponsor.description}</p>
              <span className="sponsor-link">
                Visit Website
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="5" y1="12" x2="19" y2="12" />
                  <polyline points="12 5 19 12 12 19" />
                </svg>
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
