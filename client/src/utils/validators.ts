export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export const isValidEmail = (email: string): boolean => {
  // Simple email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): ValidationResult => {
  if (password.length < 8) {
    return { 
      isValid: false, 
      error: 'Password must be at least 8 characters long' 
    };
  }
  if (!/[A-Z]/.test(password)) {
    return { 
      isValid: false, 
      error: 'Password must contain at least one uppercase letter' 
    };
  }
  if (!/\d/.test(password)) {
    return { 
      isValid: false, 
      error: 'Password must contain at least one number' 
    };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { 
      isValid: false, 
      error: 'Password must contain at least one special character' 
    };
  }
  return { isValid: true };
};
