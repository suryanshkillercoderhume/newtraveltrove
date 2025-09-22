import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  InputBase,
  alpha,
  styled,
} from '@mui/material';
import {
  Search as SearchIcon,
  AccountCircle,
  Login,
  PersonAdd,
  Add,
  Home,
  Groups,
  Explore,
  Route,
  Favorite,
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
    navigate('/');
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter' && searchQuery.trim()) {
      navigate(`/communities?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <AppBar position="sticky" elevation={1}>
      <Toolbar>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: 0,
            cursor: 'pointer',
            fontWeight: 'bold',
            color: 'white',
            textDecoration: 'none',
          }}
          onClick={() => navigate('/')}
        >
          TravelTrove
        </Typography>

        <Search>
          <SearchIconWrapper>
            <SearchIcon />
          </SearchIconWrapper>
          <StyledInputBase
            placeholder="Search communities..."
            inputProps={{ 'aria-label': 'search' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={handleSearch}
          />
        </Search>

        <Box sx={{ flexGrow: 1 }} />

        <Button
          color="inherit"
          startIcon={<Home />}
          onClick={() => navigate('/')}
          sx={{
            backgroundColor: isActive('/') ? alpha('#fff', 0.1) : 'transparent',
            mr: 1,
          }}
        >
          Home
        </Button>

        <Button
          color="inherit"
          startIcon={<Explore />}
          onClick={() => navigate('/destinations')}
          sx={{
            backgroundColor: isActive('/destinations') ? alpha('#fff', 0.1) : 'transparent',
            mr: 1,
          }}
        >
          Destinations
        </Button>

        <Button
          color="inherit"
          startIcon={<Route />}
          onClick={() => navigate('/itineraries')}
          sx={{
            backgroundColor: isActive('/itineraries') ? alpha('#fff', 0.1) : 'transparent',
            mr: 1,
          }}
        >
          Itineraries
        </Button>

        {isAuthenticated && (
          <Button
            color="inherit"
            startIcon={<Favorite />}
            onClick={() => navigate('/favorites')}
            sx={{
              backgroundColor: isActive('/favorites') ? alpha('#fff', 0.1) : 'transparent',
              mr: 1,
            }}
          >
            Favorites
          </Button>
        )}

        <Button
          color="inherit"
          startIcon={<Groups />}
          onClick={() => navigate('/communities')}
          sx={{
            backgroundColor: isActive('/communities') ? alpha('#fff', 0.1) : 'transparent',
            mr: 1,
          }}
        >
          Communities
        </Button>

        {isAuthenticated ? (
          <>
            <Button
              color="inherit"
              startIcon={<Add />}
              onClick={() => navigate('/create-community')}
              sx={{ mr: 2 }}
            >
              Create Community
            </Button>

            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenuOpen}
              color="inherit"
            >
              {user?.profilePicture ? (
                <Avatar
                  src={user.profilePicture}
                  alt={user.firstName}
                  sx={{ width: 32, height: 32 }}
                />
              ) : (
                <AccountCircle />
              )}
            </IconButton>

            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              keepMounted
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                Profile
              </MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          <>
            <Button
              color="inherit"
              startIcon={<Login />}
              onClick={() => navigate('/login')}
              sx={{ mr: 1 }}
            >
              Login
            </Button>
            <Button
              color="inherit"
              startIcon={<PersonAdd />}
              onClick={() => navigate('/register')}
              variant="outlined"
              sx={{
                borderColor: 'white',
                color: 'white',
                '&:hover': {
                  borderColor: 'white',
                  backgroundColor: alpha('#fff', 0.1),
                },
              }}
            >
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
