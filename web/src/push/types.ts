export type PushNotificationKind = "match_found" | "lobby_invite";

export type PushPermissionState =
  | "unsupported"
  | "default"
  | "granted"
  | "denied";

export type LocalPushNotification = {
  title: string;
  body?: string;
  url?: string;
  tag?: string;
  kind?: PushNotificationKind;
};
