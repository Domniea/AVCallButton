export type PushNotification = {
  title: string;
  body: string;
  data?: {
    alertId?: string;
    eventId?: string;
    roomId?: string;
    url?: string;
  };
};