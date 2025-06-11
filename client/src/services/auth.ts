import { API_URL } from "../config";
import Cookies from "js-cookie";
import type {
  TokenResponse,
  SignUpFormData,
  SignInFormData,
  AccountResponse,
} from "../types/auth";
import axiosInstance from "../config/axios";

class AuthService {
  // Store tokens in cookies
  setTokens(tokens: { access_token: string; refresh_token: string }): void {
    // Access token - session cookie (no expires, gets cleared when browser closes)
    Cookies.set("access_token", tokens.access_token, {
      secure: import.meta.env.PROD,
      sameSite: "strict",
    });

    // Refresh token - longer lived
    Cookies.set("refresh_token", tokens.refresh_token, {
      secure: import.meta.env.PROD,
      sameSite: "strict",
      expires: 30, // 30 days
    });
  }

  // Get access token from cookies
  getAccessToken(): string | undefined {
    return Cookies.get("access_token");
  }

  // Get refresh token from cookies
  getRefreshToken(): string | undefined {
    return Cookies.get("refresh_token");
  }

  // Clear all auth tokens
  clearTokens(): void {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
  }

  // !! cast to boolean
  checkExistTokens(): boolean {
    return !!this.getAccessToken() && !!this.getRefreshToken();
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  }

  // Redirect to sign in page
  private redirectToSignIn() {
    // Using window.location to force a full page reload and clear any state
    window.location.href = "/sign-in";
  }

  private redirectToHome() {
    window.location.href = "/";
  }

  // Sign in with email and password
  async signIn(credentials: SignInFormData): Promise<TokenResponse> {
    const response = await axiosInstance.post<TokenResponse>(
      `${API_URL}/auth/signin`,
      credentials
    );

    // Store tokens in cookies
    this.setTokens(response.data);
    this.redirectToHome();
    return response.data;
  }

  // Register new user with file upload
  async signUp(userData: SignUpFormData): Promise<{ message: string }> {
    const formData = new FormData();
    formData.append("name", userData.name);
    formData.append("email", userData.email);
    formData.append("password", userData.password);
    if (userData.avatar) {
      formData.append("avatar", userData.avatar);
    }

    const response = await axiosInstance.post<{ message: string }>(
      `${API_URL}/auth/signup`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    this.redirectToSignIn();
    return response.data;
  }

  // Sign out the current user
  async signOut(): Promise<void> {
    try {
      const accessToken = this.getAccessToken();
      if (accessToken) {
        // Call the backend to invalidate the token
        await axiosInstance.post(
          "/auth/signout",
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Error during sign out:", error);
      // Even if the API call fails, we still want to clear local tokens
    } finally {
      // Always clear tokens and redirect
      this.clearTokens();
      this.redirectToSignIn();
    }
  }

  // Refresh access token using refresh token
  async refreshToken(): Promise<TokenResponse | null> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        this.redirectToSignIn();
        return null;
      }

      const response = await axiosInstance.post<TokenResponse>(
        `${API_URL}/auth/refresh`,
        { refresh_token: refreshToken }
      );

      // Update stored tokens
      this.setTokens(response.data);

      return response.data;
    } catch (error: any) {
      // If 401 or any other error, clear tokens and redirect to sign in
      this.clearTokens();
      this.redirectToSignIn();
      return null;
    }
  }

  // Get current user info
  async getCurrentUser(): Promise<AccountResponse | null> {
    try {
      const response = await axiosInstance.get<AccountResponse>(
        `${API_URL}/auth/me`
      );
      return response.data;
    } catch (error: any) {
      // The interceptor will handle the 401 case
      if (error.response?.status === 401) {
        return null;
      }
      throw error;
    }
  }
}

// Export a singleton instance of the AuthService
export const authService = new AuthService();

export default authService;
