// Tipos relacionados a usuário
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  whatsapp?: string;
  isVerified?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  profilePicture?: string;
}

export interface UpdateUserProfile {
  firstName?: string;
  lastName?: string;
  whatsapp?: string;
}

// Tipos relacionados a autenticação
export interface AuthResponse {
  user?: User;
  message?: string;
  verificationToken?: string;
  verificationLink?: string;
  error?: string;
  accessToken?: string;
  success?: boolean;
  data?: any;
}

export interface RegisterResponse extends AuthResponse {
  // campos específicos do registro, se houver
}

export interface RegisterData {
  email: string;
  confirmEmail: string;
  firstName: string;
  lastName: string;
  whatsapp?: string;
}

export interface LoginData {
  email: string;
}
