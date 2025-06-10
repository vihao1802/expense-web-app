import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  ListItemIcon,
  Skeleton,
} from '@mui/material';
import { Logout as LogoutIcon } from '@mui/icons-material';

const getInitials = (name?: string | null): string => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase();
};

const Header = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenu = (event: React.MouseEvent<HTMLElement>): void => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (): void => {
    setAnchorEl(null);
  };

  const handleLogout = (): void => {
    signOut();
    navigate('/login');
  };

  // Show skeleton when user data is loading
  if (user === null || user === undefined) {
    return (
      <AppBar 
        position="static" 
        color="default" 
        elevation={0}
        sx={{
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          backgroundColor: 'white',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', width: '100%' }}>
          <Typography 
              variant="h6" 
              component={Link}
              to="/"
              noWrap 
              sx={{ 
                flexGrow: 1,
                textDecoration: 'none',
                color: 'inherit',
                '&:hover': {
                  textDecoration: 'none',
                },
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                lineHeight: 1.2,
                fontWeight: 700,
              }}
            >
              Expense Tracker
            </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Skeleton variant="rectangular" width={80} height={36} />
            <Skeleton variant="circular" width={40} height={40} />
          </Box>
        </Toolbar>
      </AppBar>
    );
  }

  return (
    <AppBar 
      position="static" 
      color="default" 
      elevation={0}
      sx={{
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        backgroundColor: 'white',
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between' }}>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          noWrap
          sx={{
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'inherit',
            '&:hover': {
              textDecoration: 'none',
            },
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            lineHeight: 1.2,
            fontWeight: 700,
          }}
        >
          Expense Tracker
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography>
              {user.name}
            </Typography>
            <IconButton
              onClick={handleMenu}
              size="small"
              sx={{ ml: 1 }}
              aria-controls={open ? 'account-menu' : undefined}
            >
              <Avatar 
                sx={{ 
                  width: 32, 
                  height: 32, 
                  bgcolor: 'primary.main',
                  color: 'white',
                }}
              >
                {getInitials(user.name)}
              </Avatar>
            </IconButton>
        </Box>
      </Toolbar>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            overflow: 'visible',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: 1,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
    </AppBar>
  );
};

export default Header;
