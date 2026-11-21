const I = (d: string, extra?: string) => () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" dangerouslySetInnerHTML={{ __html: d + (extra ?? "") }} />
);
export const Arrow = I('<path d="M5 12h14"/><path d="m13 6 6 6-6 6"/>');
export const Back = I('<path d="M19 12H5"/><path d="m11 18-6-6 6-6"/>');
export const Check = I('<path d="m5 12 5 5L20 7"/>');
export const Globe = I('<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3a14 14 0 0 1 0 18a14 14 0 0 1 0-18"/>');
export const Lock = I('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>');
export const Phone = I('<rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/>');
export const Desktop = I('<rect x="2" y="4" width="20" height="13" rx="2"/><path d="M8 21h8"/><path d="M12 17v4"/>');
export const Spark = I('<path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M6 18l2.5-2.5M15.5 8.5 18 6"/>');
export const Qr = I('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h3v3h-3zM20 14v.01M14 20h.01M17 20h4v-3"/>');
export const Mail = I('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>');
export const Chart = I('<path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 5-6"/>');
export const Cash = I('<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M6 10v4M18 10v4"/>');
export const Brush = I('<path d="M9.06 11.9 18.07 2.9a2.12 2.12 0 0 1 3 3l-9 9"/><path d="M7.07 14.94c-1.66 0-3 1.35-3 3.02 0 1.33-2.5 1.52-2 2.02 1.08 1.1 2.49 2.02 4 2.02 2.2 0 4-1.8 4-4.04a3.01 3.01 0 0 0-3-3.02z"/>');
export const Users = I('<circle cx="9" cy="8" r="4"/><path d="M2 21a7 7 0 0 1 14 0"/><path d="M16 3.13a4 4 0 0 1 0 7.75M22 21a7 7 0 0 0-5-6.7"/>');
export const Spin = () => <span className="spin" aria-hidden="true" />;
