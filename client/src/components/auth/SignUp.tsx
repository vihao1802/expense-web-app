import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Button, 
  TextField, 
  Typography, 
  Card, 
  Box,
  InputAdornment,
  Avatar,
  IconButton,
  Stack,
  Alert,
  CircularProgress
} from '@mui/material';
import { validatePassword, isValidEmail } from '../../utils/validators';
import { 
  Person as PersonIcon, 
  Email as EmailIcon, 
  Lock as LockIcon,
  Upload as UploadIcon,
  DeleteOutline as TrashIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon
} from '@mui/icons-material';
import { toast } from 'react-hot-toast';
import type { SignUpFormData } from '../../types/auth'; 
import { useAuth } from '@/contexts/AuthContext';

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    email: '',
    password: '',
    avatar: null,
  });
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);
  const { signUp,checkAuth } = useAuth();

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setFormData(prev => ({ ...prev, email: newEmail }));
    
    if (newEmail && !isValidEmail(newEmail)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError(null);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setFormData(prev => ({ ...prev, password: newPassword }));
    
    const { error } = validatePassword(newPassword);
    setPasswordError(error || null);
  };


  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate password before submitting
    const { isValid, error } = validatePassword(formData.password);
    if (!isValid) {
      setPasswordError(error || 'Invalid password');
      return;
    }
    
    setLoading(true);
    
    // Clean up the preview URL when submitting
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }

    try {
      await signUp({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        avatar: formData.avatar,
      });
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setAvatarPreview(URL.createObjectURL(file));
      setFormData({ 
        ...formData, 
        avatar: file
      });
    }
  };

  const handleRemoveAvatar = () => {
    if (avatarPreview) {
      URL.revokeObjectURL(avatarPreview);
    }
    setFormData({ ...formData, avatar: null });
    setAvatarPreview('');
  };

  useEffect(() => {
    checkAuth();
  },[])

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', height: '100%', maxWidth: 400, margin: 'auto' }}>
      <Card sx={{ p: 3, width: '100%' }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          Sign Up
        </Typography>
        <form onSubmit={handleSubmit}>
          <Stack spacing={3}>
            <TextField
              fullWidth
              label="Full Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleEmailChange}
              error={!!emailError}
              helperText={emailError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon />
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              fullWidth
              label="Password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handlePasswordChange}
              margin="normal"
              required
              error={!!passwordError}
              helperText={passwordError}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon />
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
            <Box >
              <Stack spacing={2} alignItems="center" justifyContent="center">
                {avatarPreview && (
                  <Box
                    position="relative"
                    sx={{
                      width: 100,
                      height: 100,
                      '&:hover .delete-avatar-btn': {
                        opacity: 1,
                        visibility: 'visible',
                      },
                    }}
                  >
                    <Avatar
                      src={avatarPreview}
                      sx={{ width: 100, height: 100 }}
                    />
                    <IconButton
                      className="delete-avatar-btn"
                      onClick={handleRemoveAvatar}
                      sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                        color: 'white',
                        p: 0.5,
                        opacity: 0,
                        visibility: 'hidden',
                        transition: 'all 0.2s ease-in-out',
                        '&:hover': {
                          bgcolor: 'rgba(0, 0, 0, 0.7)',
                        },
                      }}
                    >
                      <TrashIcon sx={{ fontSize: 20 }} />
                    </IconButton>
                  </Box>
                )}
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  fullWidth
                  sx={{
                    "&:hover": {
                      bgcolor: "white",
                    }
                  }}
                >
                  Upload Avatar
                  <input
                    hidden
                    accept="image/*"
                    type="file"
                    onChange={handleAvatarChange}
                  />
                </Button>
              </Stack>
            </Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Sign Up'}
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
              <Link to="/sign-in">Already have an account? Sign in</Link>
            </Box>
          </Stack>
        </form>
      </Card>
    </Box>
  );
}
