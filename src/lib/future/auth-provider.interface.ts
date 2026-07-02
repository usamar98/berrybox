export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
};

export interface AuthProvider {
  getCurrentUser(): Promise<AuthUser | null>;
  signIn(): Promise<AuthUser>;
  signOut(): Promise<void>;
}
