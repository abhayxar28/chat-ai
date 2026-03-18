
export interface User {
  id: string;
  email: string;
  fullName: {
    firstName: string;
    lastName: string;
  }
}

export interface RegisterPayload {
  fullName: {
    firstName: string;
    lastName: string;
  };
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: User;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ProfileResponse {
  user: User;
}