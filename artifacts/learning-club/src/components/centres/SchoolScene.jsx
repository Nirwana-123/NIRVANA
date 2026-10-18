export default function SchoolScene() {
  return (
    <svg
      className="polaroid-scene"
      viewBox="0 0 240 140"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <circle cx="186" cy="38" r="20" fill="#f2eedc" opacity=".9" />
      <path d="M0 112 Q60 84 120 106 T240 98 V140 H0Z" fill="currentColor" opacity=".3" />
      <rect x="78" y="62" width="84" height="56" fill="currentColor" />
      <path d="M70 64 L120 34 L170 64Z" fill="currentColor" />
      <rect x="108" y="88" width="24" height="30" fill="#f2eedc" />
      <rect x="88" y="74" width="14" height="14" fill="#f2eedc" />
      <rect x="138" y="74" width="14" height="14" fill="#f2eedc" />
      <path d="M120 34 V16 M120 16 h16 l-4 5 4 5 h-16" stroke="currentColor" strokeWidth="2" fill="currentColor" />
      <rect x="0" y="116" width="240" height="24" fill="currentColor" opacity=".5" />
    </svg>
  );
}
