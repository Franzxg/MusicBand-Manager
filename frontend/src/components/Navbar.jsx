import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import CloseIcon from '@mui/icons-material/Close'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import DashboardIcon from '@mui/icons-material/Dashboard'
import HelpOutlineIcon from '@mui/icons-material/HelpOutlined'
import LightModeIcon from '@mui/icons-material/LightMode'
import LogoutIcon from '@mui/icons-material/Logout'
import MenuIcon from '@mui/icons-material/Menu'
import PersonIcon from '@mui/icons-material/Person'
import TranslateIcon from '@mui/icons-material/Translate'
import {
  AppBar,
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  ListSubheader,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import useAuth from '../hooks/useAuth'
import useLanguage from '../hooks/useLanguage'
import useThemeMode from '../hooks/useThemeMode'
import BrandLink from './BrandLink'
import LanguageSelect from './LanguageSelect'
import ThemeToggle from './ThemeToggle'

const links = [
  { to: '/', label: 'nav.dashboard', icon: <DashboardIcon /> },
  { to: '/guide', label: 'nav.guide', icon: <HelpOutlineIcon /> },
]

// Barra completa da md, cassetto su xs e sm
export default function Navbar() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const { language, setLanguage, languages } = useLanguage()
  const { mode, toggleMode } = useThemeMode()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [userAnchor, setUserAnchor] = useState(null)

  const handleLogout = async () => {
    setDrawerOpen(false)
    setUserAnchor(null)
    await logout()
    navigate('/login', { replace: true })
  }

  const closeDrawer = () => setDrawerOpen(false)

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ gap: 1 }}>
        <IconButton
          color="inherit"
          edge="start"
          onClick={() => setDrawerOpen(true)}
          aria-label={t('nav.openMenu')}
          sx={{ display: { md: 'none' } }}
        >
          <MenuIcon />
        </IconButton>

        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <BrandLink to="/" />
        </Box>

        <Box component="nav" sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
          {links.map((link) => (
            <Button
              key={link.to}
              component={RouterLink}
              to={link.to}
              color="inherit"
              aria-current={pathname === link.to ? 'page' : undefined}
              sx={{ color: 'inherit', textDecoration: pathname === link.to ? 'underline' : 'none', textUnderlineOffset: 6 }}
            >
              {t(link.label)}
            </Button>
          ))}
          <LanguageSelect />
          <ThemeToggle />
          <Button
            color="inherit"
            startIcon={<AccountCircleIcon />}
            onClick={(event) => setUserAnchor(event.currentTarget)}
            aria-label={t('nav.userMenu')}
            aria-haspopup="menu"
            sx={{ color: 'inherit', maxWidth: 220 }}
          >
            <Typography component="span" noWrap>
              {user?.name ?? ''}
            </Typography>
          </Button>
          <Menu anchorEl={userAnchor} open={Boolean(userAnchor)} onClose={() => setUserAnchor(null)}>
            <MenuItem component={RouterLink} to="/profile" onClick={() => setUserAnchor(null)}>
              <ListItemIcon>
                <PersonIcon />
              </ListItemIcon>
              {t('nav.profile')}
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutIcon />
              </ListItemIcon>
              {t('nav.logout')}
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>

      <Drawer open={drawerOpen} onClose={closeDrawer} slotProps={{ paper: { sx: { width: 280, maxWidth: '85vw' } } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1 }}>
          <Typography component="p" variant="subtitle1" noWrap sx={{ fontWeight: 700 }}>
            {user?.name ?? t('app.name')}
          </Typography>
          <IconButton onClick={closeDrawer} aria-label={t('nav.closeMenu')}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />
        <List component="nav">
          {links.map((link) => (
            <ListItemButton
              key={link.to}
              component={RouterLink}
              to={link.to}
              selected={pathname === link.to}
              onClick={closeDrawer}
            >
              <ListItemIcon>{link.icon}</ListItemIcon>
              <ListItemText primary={t(link.label)} />
            </ListItemButton>
          ))}
          <ListItemButton component={RouterLink} to="/profile" selected={pathname === '/profile'} onClick={closeDrawer}>
            <ListItemIcon>
              <PersonIcon />
            </ListItemIcon>
            <ListItemText primary={t('nav.profile')} />
          </ListItemButton>
        </List>
        <Divider />
        <List subheader={<ListSubheader disableSticky>{t('language.label')}</ListSubheader>}>
          {languages.map((lng) => (
            <ListItemButton key={lng} selected={lng === language} onClick={() => setLanguage(lng)} lang={lng}>
              <ListItemIcon>
                <TranslateIcon />
              </ListItemIcon>
              <ListItemText primary={t(`language.${lng}`)} />
            </ListItemButton>
          ))}
        </List>
        <Divider />
        <List>
          <ListItemButton onClick={toggleMode}>
            <ListItemIcon>{mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}</ListItemIcon>
            <ListItemText primary={mode === 'dark' ? t('theme.toLight') : t('theme.toDark')} />
          </ListItemButton>
          <ListItemButton onClick={handleLogout}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary={t('nav.logout')} />
          </ListItemButton>
        </List>
      </Drawer>
    </AppBar>
  )
}
