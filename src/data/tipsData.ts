// src/data/tipsData.ts

export enum TipCategory {
  Focus = 'focus-and-productivity',
  Energy = 'energy-and-wellbeing',
  Planning = 'planning-and-task-management',
  Consistency = 'consistency-and-routine',
  Progress = 'progress-and-motivation',
}

export interface TipItem {
  id: number;
  category: TipCategory;
  text: string;
}

export interface TipCategoryMeta {
  label: string;
  icon: string;
  themeClassName: string;
}

export const TIP_CATEGORIES: readonly TipCategory[] = [
  TipCategory.Focus,
  TipCategory.Energy,
  TipCategory.Planning,
  TipCategory.Consistency,
  TipCategory.Progress,
] as const;

export const TIP_CATEGORY_META: Record<TipCategory, TipCategoryMeta> = {
  [TipCategory.Focus]: {
    label: 'Focus & productivity',
    icon: '🎯',
    themeClassName: 'tips-card--focus',
  },
  [TipCategory.Energy]: {
    label: 'Energy & well-being',
    icon: '☀️',
    themeClassName: 'tips-card--energy',
  },
  [TipCategory.Planning]: {
    label: 'Planning & task management',
    icon: '🗂️',
    themeClassName: 'tips-card--planning',
  },
  [TipCategory.Consistency]: {
    label: 'Consistency & routine',
    icon: '🌱',
    themeClassName: 'tips-card--consistency',
  },
  [TipCategory.Progress]: {
    label: 'Progress & motivation',
    icon: '✨',
    themeClassName: 'tips-card--progress',
  },
};

export const STUDY_TIPS: readonly TipItem[] = [
  {
    id: 1,
    category: TipCategory.Focus,
    text: 'Study distraction-free: silence notifications to stay in the zone.',
  },
  {
    id: 2,
    category: TipCategory.Focus,
    text: 'Avoid multitasking: focusing on one task at a time significantly improves efficiency.',
  },
  {
    id: 3,
    category: TipCategory.Focus,
    text: "If you're stuck, step away for a bit and come back when your mind is clear.",
  },
  {
    id: 4,
    category: TipCategory.Focus,
    text: 'The hardest part is starting: even 10 minutes is enough to build your momentum.',
  },
  {
    id: 5,
    category: TipCategory.Focus,
    text: 'Quality over quantity: short, focused sessions beat long hours.',
  },
  {
    id: 6,
    category: TipCategory.Energy,
    text: 'Complete your most challenging tasks when your energy is at its peak.',
  },
  {
    id: 7,
    category: TipCategory.Energy,
    text: 'Feeling tired? Review what you know instead of starting new topics.',
  },
  {
    id: 8,
    category: TipCategory.Energy,
    text: "Quality sleep is essential for your brain to successfully consolidate what you've learned.",
  },
  {
    id: 9,
    category: TipCategory.Energy,
    text: 'Even a quick burst of movement during your break helps restore your focus.',
  },
  {
    id: 10,
    category: TipCategory.Energy,
    text: 'Take regular breaks to prevent burnout and keep your focus sharp.',
  },
  {
    id: 11,
    category: TipCategory.Planning,
    text: 'Break down large tasks into smaller, manageable steps.',
  },
  {
    id: 12,
    category: TipCategory.Planning,
    text: 'Plan ahead and let the app distribute your workload evenly over time.',
  },
  {
    id: 13,
    category: TipCategory.Planning,
    text: 'Keep your tasks specific – clarity makes them easier to start and complete.',
  },
  {
    id: 14,
    category: TipCategory.Planning,
    text: 'Organize your tasks first: a clear plan leads to a focused mind.',
  },
  {
    id: 15,
    category: TipCategory.Planning,
    text: 'Update your availability regularly to keep your study plan realistic.',
  },
  {
    id: 16,
    category: TipCategory.Consistency,
    text: 'Trust the process: consistent, spaced learning beats last-minute cramming.',
  },
  {
    id: 17,
    category: TipCategory.Consistency,
    text: 'Stick to your planned sessions, even if they’re short.',
  },
  {
    id: 18,
    category: TipCategory.Consistency,
    text: 'Build a routine: studying at the same time each day makes consistency easier.',
  },
  {
    id: 19,
    category: TipCategory.Consistency,
    text: 'Show up regularly – small daily efforts lead to big results.',
  },
  {
    id: 20,
    category: TipCategory.Consistency,
    text: "Missed a session? Don't worry—just get back on track with the next one.",
  },
  {
    id: 21,
    category: TipCategory.Progress,
    text: 'Track your progress: seeing how far you’ve come is the best motivation to keep going.',
  },
  {
    id: 22,
    category: TipCategory.Progress,
    text: 'Mark completed tasks to build a sense of achievement and momentum.',
  },
  {
    id: 23,
    category: TipCategory.Progress,
    text: 'Focus on progress, not perfection.',
  },
  {
    id: 24,
    category: TipCategory.Progress,
    text: 'Review your completed work to stay inspired and motivated.',
  },
  {
    id: 25,
    category: TipCategory.Progress,
    text: 'Use your progress data to identify which areas need more of your attention.',
  },
] as const;