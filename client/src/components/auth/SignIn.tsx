import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Button, 
  TextField, 
  Typography, 
  Card, 
  Box,
  InputAdornment,
  Stack,
  Alert,
  CircularProgress,
  IconButton
} from '@mui/material';
import { 
  Email as EmailIcon, 
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { validatePassword, isValidEmail } from '../../utils/validators';
import { useAuth } from "../../contexts/AuthContext";

export default function SignIn() {
  const { signIn, checkAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    
    const { error } = validatePassword(newPassword);
    setPasswordError(error || null);
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    
    if (!isValidEmail(newEmail) && newEmail.length > 0) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate email
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email address');
      return;
    }
    
    // Validate password before submitting
    const { isValid, error } = validatePassword(password);
    if (!isValid) {
      setPasswordError(error || 'Invalid password');
      return;
    }
    
    setLoading(true);

    try {
      await signIn({email, password});
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth()
  }, [])

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%', maxWidth: 400, margin: 'auto' }}>
      <Card sx={{ p: 3 }} style={{ width: '100%' }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Sign In
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Email"
              value={email}
              onChange={handleEmailChange}
              placeholder="Enter your email"
              type="email"
              error={!!emailError}
              helperText={emailError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color={emailError ? 'error' : 'inherit'} />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter your password"
              type={showPassword ? 'text' : 'password'}
              error={!!passwordError}
              helperText={passwordError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color={passwordError ? 'error' : 'inherit'} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign In'}
            </Button>
            {error && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
            )}
            <Box textAlign="center" sx={{
              ":hover": {
                color: "primary.main",
              }
            }}>
              <Link to="/sign-up">Don't have an account? Sign up</Link>
            </Box>
          </Stack>
        </form>
      </Card>
    </Box>
  );
}
