import { defaultNotifications, defaultProfile } from "./profile-data";
import type { NotificationPreferences, ProfileData } from "./profile-types";

const PROFILE_STORAGE_KEY = "sofistike-admin-profile-v1";

type PersistedProfile = {
  profile: ProfileData;
  notifications: NotificationPreferences;
};

export function loadPersistedProfile(): PersistedProfile {
  try {
    const stored = window.localStorage.getItem(PROFILE_STORAGE_KEY);
    if (!stored) {
      return { profile: defaultProfile, notifications: defaultNotifications };
    }
    const parsed = JSON.parse(stored) as Partial<PersistedProfile>;
    return {
      profile: { ...defaultProfile, ...parsed.profile },
      notifications: {
        ...defaultNotifications,
        ...parsed.notifications,
      },
    };
  } catch {
    return { profile: defaultProfile, notifications: defaultNotifications };
  }
}

export function persistProfile(
  profile: ProfileData,
  notifications: NotificationPreferences,
) {
  window.localStorage.setItem(
    PROFILE_STORAGE_KEY,
    JSON.stringify({ profile, notifications } satisfies PersistedProfile),
  );
}
