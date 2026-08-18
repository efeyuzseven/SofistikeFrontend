export type ProfileTab = "personal" | "security" | "notifications";

export type ProfileData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  timezone: string;
  language: string;
  role: "Süper Yönetici";
  permissionLevel: "Tam erişim";
  lastLogin: string;
  photoDataUrl: string | null;
};

export type NotificationPreferenceKey =
  | "newOrders"
  | "criticalStock"
  | "refundRequests"
  | "failedPayments"
  | "integrationErrors"
  | "b2bApplications"
  | "weeklySummary"
  | "emailNotifications"
  | "inAppNotifications";

export type NotificationPreferences = Record<
  NotificationPreferenceKey,
  boolean
>;

export type ActiveSession = {
  id: string;
  device: string;
  location: string;
  lastActivity: string;
  current: boolean;
};

export type ProfileNotice = {
  type: "success" | "error";
  text: string;
};
