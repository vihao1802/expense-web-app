interface JwtPayload {
  exp: number;
  [key: string]: any;
}

export const decodeJwt = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
};

// Check if token is expired or will expire within thresholdMinutes
export const isTokenExpired = (token: string, thresholdMinutes = 1): boolean => {
  const decoded = decodeJwt(token);
  if (!decoded?.exp) return true;
  
  const now = Math.floor(Date.now() / 1000);
  const expiresIn = decoded.exp - now;
  
  // Return true if token is expired or will expire within thresholdMinutes
  return expiresIn < (thresholdMinutes * 60);
};
