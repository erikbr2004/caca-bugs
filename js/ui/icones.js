/* Caça-Bugs — ilustrações em SVG (robô, insetos e caixas), desenhadas para o jogo. */
(function (raiz) {
  'use strict';
  const CB = raiz.CB;

  function inseto(cor, rotulo) {
    const titulo = rotulo ? `<title>${rotulo}</title>` : '';
    return `<svg viewBox="0 0 64 64" role="img" aria-hidden="${rotulo ? 'false' : 'true'}">${titulo}
      <g stroke="#1F2937" stroke-width="3" stroke-linecap="round" fill="none">
        <path d="M22 28 L9 21"/><path d="M20 37 L7 37"/><path d="M22 46 L10 54"/>
        <path d="M42 28 L55 21"/><path d="M44 37 L57 37"/><path d="M42 46 L54 54"/>
        <path d="M28 14 Q25 6 18 5"/><path d="M36 14 Q39 6 46 5"/>
      </g>
      <circle cx="32" cy="18" r="7.5" fill="#1F2937"/>
      <ellipse cx="32" cy="39" rx="13.5" ry="17" fill="${cor}" stroke="#1F2937" stroke-width="3"/>
      <line x1="32" y1="23" x2="32" y2="55" stroke="#1F2937" stroke-width="2.5"/>
      <circle cx="26.5" cy="35" r="2.8" fill="#1F2937" opacity=".5"/>
      <circle cx="37.5" cy="44" r="2.8" fill="#1F2937" opacity=".5"/>
    </svg>`;
  }

  /** Robô visto de cima, virado para a direita (a rotação é aplicada por CSS). */
  function roboTopo(segurando) {
    return `<svg viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="16" fill="#E2E8F0" stroke="#0F172A" stroke-width="2.5"/>
      ${segurando ? '<rect x="5" y="12" width="13" height="16" rx="2" fill="#C98A2E" stroke="#0F172A" stroke-width="1.6"/>' : ''}
      <rect x="17" y="12" width="12" height="16" rx="4" fill="#1E2A47"/>
      <circle cx="24.5" cy="16.5" r="2.4" fill="#67E8F9"/><circle cx="24.5" cy="23.5" r="2.4" fill="#67E8F9"/>
      <polygon points="39,20 32,14.5 32,25.5" fill="#FFC845" stroke="#0F172A" stroke-width="1.5"/>
    </svg>`;
  }

  function caixa() {
    return `<svg viewBox="0 0 34 34" aria-hidden="true">
      <rect x="3" y="5" width="28" height="24" rx="3" fill="#C98A2E" stroke="#0F172A" stroke-width="2"/>
      <path d="M3 12h28" stroke="#0F172A" stroke-width="2"/>
      <rect x="14" y="5" width="6" height="7" fill="#F2D49B" stroke="#0F172A" stroke-width="1.5"/>
    </svg>`;
  }

  function marca() {
    return `<svg viewBox="0 0 64 64" aria-hidden="true">${inseto('#fff').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</svg>`;
  }

  function roboGrande() {
    return `<svg viewBox="0 0 520 520" aria-hidden="true">
      <g opacity=".95">
        <path d="M60 120 q40 -40 90 -10" stroke="#FFC845" stroke-width="3" stroke-dasharray="6 8" fill="none"/>
        <g transform="translate(20 90) scale(.875)">${inseto('#F97316').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>
        <path d="M440 330 q40 -10 50 -60" stroke="#FFC845" stroke-width="3" stroke-dasharray="6 8" fill="none"/>
        <g transform="translate(455 210) scale(.78)">${inseto('#22C55E').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>
        <g transform="translate(400 60) scale(.69)">${inseto('#A78BFA').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>
      </g>
      <g transform="translate(110 70)" stroke="#0F172A" stroke-linejoin="round">
        <line x1="150" y1="20" x2="150" y2="62" stroke-width="6"/>
        <circle cx="150" cy="16" r="14" fill="#FFC845" stroke-width="5"/>
        <rect x="62" y="62" width="176" height="128" rx="34" fill="#E2E8F0" stroke-width="6"/>
        <rect x="84" y="84" width="132" height="84" rx="20" fill="#1E2A47" stroke-width="4"/>
        <circle cx="122" cy="122" r="13" fill="#67E8F9" stroke="none"/>
        <circle cx="178" cy="122" r="13" fill="#67E8F9" stroke="none"/>
        <circle cx="126" cy="117" r="4" fill="#fff" stroke="none"/>
        <circle cx="182" cy="117" r="4" fill="#fff" stroke="none"/>
        <path d="M126 148 q24 16 48 0" fill="none" stroke="#67E8F9" stroke-width="5" stroke-linecap="round"/>
        <rect x="132" y="190" width="36" height="18" fill="#94A3B8" stroke-width="5"/>
        <rect x="52" y="208" width="196" height="150" rx="30" fill="#CBD5E1" stroke-width="6"/>
        <rect x="96" y="236" width="108" height="80" rx="14" fill="#fff" stroke-width="4"/>
        <g transform="translate(122 248) scale(.875)">${inseto('#EF4444').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>
        <rect x="14" y="226" width="34" height="96" rx="17" fill="#94A3B8" stroke-width="5"/>
        <rect x="252" y="196" width="34" height="96" rx="17" fill="#94A3B8" stroke-width="5" transform="rotate(-28 269 244)"/>
        <circle cx="318" cy="150" r="34" fill="rgba(103,232,249,.25)" stroke-width="7"/>
        <line x1="296" y1="176" x2="276" y2="204" stroke-width="10" stroke-linecap="round"/>
        <rect x="78" y="356" width="56" height="30" rx="12" fill="#475569" stroke-width="5"/>
        <rect x="166" y="356" width="56" height="30" rx="12" fill="#475569" stroke-width="5"/>
      </g>
    </svg>`;
  }

  CB.Icones = { inseto, roboTopo, caixa, marca, roboGrande };
})(typeof window !== 'undefined' ? window : globalThis);
