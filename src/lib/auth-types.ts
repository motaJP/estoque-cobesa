import { Timestamp } from "firebase/firestore";

export type UserRole = 'admin' | 'user';

export type Group = {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: Timestamp | Date | string;
};

export type UserProfile = {
  id: string;
  username: string;
  role: UserRole;
  groupId: string; // ID do grupo/loja ao qual o usuário pertence
  isActive: boolean;
  createdAt: Timestamp | Date | string;
};
