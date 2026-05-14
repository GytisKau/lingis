const MAX_DAILY_ADS = 4;
const AD_LIMIT_STORAGE_PREFIX = "lingis_daily_ads";

type DailyAdState = {
  date: string;
  count: number;
};

function getLocalDateKey() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStorageKey(userKey: string) {
  return `${AD_LIMIT_STORAGE_PREFIX}_${userKey}`;
}

function readDailyAdState(userKey: string): DailyAdState {
  const today = getLocalDateKey();
  const storageKey = getStorageKey(userKey);

  try {
    const saved = localStorage.getItem(storageKey);

    if (!saved) {
      return {
        date: today,
        count: 0,
      };
    }

    const parsed = JSON.parse(saved) as DailyAdState;

    if (parsed.date !== today) {
      return {
        date: today,
        count: 0,
      };
    }

    return {
      date: parsed.date,
      count: Number(parsed.count) || 0,
    };
  } catch {
    return {
      date: today,
      count: 0,
    };
  }
}

function saveDailyAdState(userKey: string, state: DailyAdState) {
  localStorage.setItem(getStorageKey(userKey), JSON.stringify(state));
}

export function getAdUserKey(user: any) {
  return String(
    user?.id ??
    user?.email ??
    user?.username ??
    "local-user"
  );
}

export function isPremiumUser(user: any) {
  return Boolean(
    user?.is_premium ||
    user?.isPremium ||
    user?.premium ||
    user?.plan === "premium" ||
    user?.subscription === "premium"
  );
}

export function reserveDailyAdView(userKey: string, isPremium: boolean) {
  if (isPremium) return false;

  const state = readDailyAdState(userKey);

  if (state.count >= MAX_DAILY_ADS) {
    return false;
  }

  saveDailyAdState(userKey, {
    ...state,
    count: state.count + 1,
  });

  return true;
}