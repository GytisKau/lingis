interface StoredTipState {
  currentIndex: number;
  lastOpenedDate: string;
}

const STORAGE_PREFIX = 'daily-tip-rotation';

function getTodayLocalDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getStorageKey(key: string): string {
  return `${STORAGE_PREFIX}:${key}`;
}

export function getProgressiveDailyTip<T>(
  tips: T[],
  storageKey: string
): T | null {
  if (!tips.length) return null;

  const today = getTodayLocalDateString();
  const fullStorageKey = getStorageKey(storageKey);

  const raw = localStorage.getItem(fullStorageKey);

  if (!raw) {
    const initialState: StoredTipState = {
      currentIndex: 0,
      lastOpenedDate: today,
    };

    localStorage.setItem(fullStorageKey, JSON.stringify(initialState));
    return tips[0];
  }

  try {
    const parsed: StoredTipState = JSON.parse(raw);

    if (parsed.lastOpenedDate === today) {
      return tips[parsed.currentIndex % tips.length];
    }

    const nextIndex = (parsed.currentIndex + 1) % tips.length;

    const nextState: StoredTipState = {
      currentIndex: nextIndex,
      lastOpenedDate: today,
    };

    localStorage.setItem(fullStorageKey, JSON.stringify(nextState));
    return tips[nextIndex];
  } catch {
    const fallbackState: StoredTipState = {
      currentIndex: 0,
      lastOpenedDate: today,
    };

    localStorage.setItem(fullStorageKey, JSON.stringify(fallbackState));
    return tips[0];
  }
}