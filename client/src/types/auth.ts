export interface SignUpFormData {
  name: string;
  email: string;
  password: string;
  avatar: File | null;
}

export interface SignInFormData {
  email: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface AccountResponse {
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}
  