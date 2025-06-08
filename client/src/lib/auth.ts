import { User } from "@shared/schema";

export interface AuthUser extends Omit<User, 'passwordHash'> {}

export interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export const getInitials = (name: string): string => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const formatLastVisit = (date: string): string => {
  const visitDate = new Date(date);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - visitDate.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return visitDate.toLocaleDateString();
};
