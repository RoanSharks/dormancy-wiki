function pseudoRandom(seed) {
  const x = Math.sin(seed * 999.91) * 43758.5453;
  return x - Math.floor(x);
}

const stars = Array.from({ length: 160 }, (_, index) => {
  const n = index + 1;
  const x = pseudoRandom(n * 1.21) * 100;
  const y = pseudoRandom(n * 2.37) * 100;
  const size = 0.7 + pseudoRandom(n * 3.19) * 2.1;
  const opacity = 0.25 + pseudoRandom(n * 4.41) * 0.7;
  const delay = pseudoRandom(n * 5.73) * 8;
  const duration = 2.8 + pseudoRandom(n * 6.93) * 5.2;

  return { id: n, x, y, size, opacity, delay, duration };
});

const meteors = Array.from({ length: 4 }, (_, index) => {
  const n = index + 1;
  const y = 8 + pseudoRandom(n * 7.17) * 36;
  const delay = 4 + pseudoRandom(n * 8.27) * 12;
  const duration = 8 + pseudoRandom(n * 9.61) * 8;

  return { id: n, y, delay, duration };
});

export default function StarField() {
  return (
    <div
      className="star-layer"
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }}
    >
      {/* Moon SVG (large, white) */}
      <svg
        width="220"
        height="220"
        viewBox="0 0 220 220"
        style={{ position: 'absolute', left: '4%', top: '4%', zIndex: 1 }}
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="moonGlow" cx="100%" cy="100%" r="95%">
            <stop offset="0%" stopColor="#fff" stopOpacity="1" />
            <stop offset="80%" stopColor="#fff" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle cx="110" cy="110" r="95" fill="url(#moonGlow)" />
        <circle cx="110" cy="110" r="75" fill="url(#moonGlow)" />
      </svg>

      {/* Stars */}
      {stars.map((star) => (
        <span
          key={star.id}
          className="star"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: `${star.delay}s`,
            animationDuration: `${star.duration}s`,
          }}
        />
      ))}

      {/* Meteors */}
      {meteors.map((meteor) => (
        <span
          key={`meteor-${meteor.id}`}
          className="meteor"
          style={{
            top: `${meteor.y}%`,
            animationDelay: `${meteor.delay}s`,
            animationDuration: `${meteor.duration}s`,
          }}
        />
      ))}
    </div>
  );
}
