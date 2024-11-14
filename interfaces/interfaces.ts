import { User } from "@/types/types";

export interface FormProfileProps {
  user: User;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => Promise<void>;
  refreshAuth: () => Promise<boolean>;
}
