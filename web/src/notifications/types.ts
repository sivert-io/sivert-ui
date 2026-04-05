export type Notification = {
  id: string;
  type: string;
  title: string;
  body?: string;
  createdAt?: string;
  readAt?: string | null;
  data?: unknown;
};
