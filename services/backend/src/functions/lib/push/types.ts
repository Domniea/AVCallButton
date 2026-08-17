export type PushNotification = {
  title: string;
  body: string;
  data?: {
    alertId?: string;
    eventId?: string;
    roomId?: string;
    url?: string;
    /** Discriminator for clients (`chat` | omit for alerts). */
    type?: string;
    threadId?: string;
    workspaceId?: string;
  };
};
