// Predefined blog categories for consistent use across the application
export const BLOG_CATEGORIES = [
  'Spiritual Guidance',
  'Mediumship',
  'Clairvoyance', 
  'Tarot Reading',
  'Angel Messages',
  'Healing & Wellness',
  'Personal Stories',
  'Spiritual Development',
  'Life After Death',
  'Dreams & Visions',
  'Energy Healing',
  'Crystals & Gemstones',
  'Chakras & Auras',
  'Moon Phases & Astrology',
  'Meditation & Mindfulness'
] as const;

export type BlogCategory = typeof BLOG_CATEGORIES[number];

// Category styling for visual consistency
export const CATEGORY_STYLES: Record<string, { color: string; bgColor: string; icon: string }> = {
  'Spiritual Guidance': { color: 'text-purple-700', bgColor: 'bg-purple-100', icon: '✨' },
  'Mediumship': { color: 'text-indigo-700', bgColor: 'bg-indigo-100', icon: '👻' },
  'Clairvoyance': { color: 'text-blue-700', bgColor: 'bg-blue-100', icon: '👁️' },
  'Tarot Reading': { color: 'text-amber-700', bgColor: 'bg-amber-100', icon: '🔮' },
  'Angel Messages': { color: 'text-pink-700', bgColor: 'bg-pink-100', icon: '👼' },
  'Healing & Wellness': { color: 'text-green-700', bgColor: 'bg-green-100', icon: '🌿' },
  'Personal Stories': { color: 'text-orange-700', bgColor: 'bg-orange-100', icon: '📖' },
  'Spiritual Development': { color: 'text-violet-700', bgColor: 'bg-violet-100', icon: '🧘' },
  'Life After Death': { color: 'text-gray-700', bgColor: 'bg-gray-100', icon: '🕊️' },
  'Dreams & Visions': { color: 'text-cyan-700', bgColor: 'bg-cyan-100', icon: '💫' },
  'Energy Healing': { color: 'text-emerald-700', bgColor: 'bg-emerald-100', icon: '⚡' },
  'Crystals & Gemstones': { color: 'text-rose-700', bgColor: 'bg-rose-100', icon: '💎' },
  'Chakras & Auras': { color: 'text-rainbow-700', bgColor: 'bg-gradient-to-r from-red-100 to-purple-100', icon: '🌈' },
  'Moon Phases & Astrology': { color: 'text-slate-700', bgColor: 'bg-slate-100', icon: '🌙' },
  'Meditation & Mindfulness': { color: 'text-teal-700', bgColor: 'bg-teal-100', icon: '🧿' }
};

// Helper function to get category styling
export const getCategoryStyle = (category: string) => {
  return CATEGORY_STYLES[category] || { color: 'text-gray-700', bgColor: 'bg-gray-100', icon: '📝' };
}; 