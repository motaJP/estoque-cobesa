export type UserSettings = {
  id: string;
  userId: string;
  notifications: {
    lowStockEmail: boolean;
    weeklyReportsEmail: boolean;
  };
  theme: 'light' | 'dark' | 'system';
  updatedAt?: Date | string;
};
