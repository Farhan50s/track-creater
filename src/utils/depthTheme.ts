export interface DepthTokens {
  level: number;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  cardBorder: string;
  cardHoverBorder: string;
  cardBg: string;
  accentText: string;
  guideBorder: string;
}

export const DEPTH_THEMES: Record<number, DepthTokens> = {
  1: {
    level: 1,
    label: 'Pillar',
    badgeBg: 'bg-blue-950/40',
    badgeText: 'text-blue-300',
    badgeBorder: 'border-blue-800/50',
    cardBorder: 'border-blue-900/40',
    cardHoverBorder: 'hover:border-blue-500/70',
    cardBg: 'bg-blue-950/10',
    accentText: 'text-blue-400',
    guideBorder: 'border-blue-500/40',
  },
  2: {
    level: 2,
    label: 'Topic',
    badgeBg: 'bg-emerald-950/40',
    badgeText: 'text-emerald-300',
    badgeBorder: 'border-emerald-800/50',
    cardBorder: 'border-emerald-900/40',
    cardHoverBorder: 'hover:border-emerald-500/70',
    cardBg: 'bg-emerald-950/10',
    accentText: 'text-emerald-400',
    guideBorder: 'border-emerald-500/40',
  },
  3: {
    level: 3,
    label: 'Subtopic',
    badgeBg: 'bg-amber-950/40',
    badgeText: 'text-amber-300',
    badgeBorder: 'border-amber-800/50',
    cardBorder: 'border-amber-900/40',
    cardHoverBorder: 'hover:border-amber-500/70',
    cardBg: 'bg-amber-950/10',
    accentText: 'text-amber-400',
    guideBorder: 'border-amber-500/40',
  },
  4: {
    level: 4,
    label: 'Skill Node',
    badgeBg: 'bg-purple-950/40',
    badgeText: 'text-purple-300',
    badgeBorder: 'border-purple-800/50',
    cardBorder: 'border-purple-900/40',
    cardHoverBorder: 'hover:border-purple-500/70',
    cardBg: 'bg-purple-950/10',
    accentText: 'text-purple-400',
    guideBorder: 'border-purple-500/40',
  },
};

export function getDepthTheme(level: number): DepthTokens {
  return DEPTH_THEMES[level] || DEPTH_THEMES[4];
}
