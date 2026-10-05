import AccountCircleIcon from '@mui/icons-material/AccountCircle'
import CloseIcon from '@mui/icons-material/Close'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import GroupsIcon from '@mui/icons-material/Groups'
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
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink, useLocation, useMatch, useNavigate } from 'react-router-dom'
import { BANDS_CHANGED_EVENT } from '../api/bands'
import useAuth from '../hooks/useAuth'
import useBands from '../hooks/useBands'
import useLanguage from '../hooks/useLanguage'
import useThemeMode from '../hooks/useThemeMode'
import BrandLink from './BrandLink'
import LanguageSelect from './LanguageSelect'
import ThemeToggle from './ThemeToggle'

const links = [
  { to: '/', label: 'nav.dashboard', icon: <DashboardIcon /> },
  { to: '/guide', label: 'nav.guide', icon: <HelpOutlineIcon /> },
]

// Barra completa da md, cassetto su xs e sm. La band corrente è quella dell'URL (/bands/:bandId)
export default function Navbar() {
  const { t } = useTranslation()
  const { user, logout } = useAuth()
  const { language, setLanguage, languages } = useLanguage()
  const { mode, toggleMode } = useThemeMode()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [userAnchor, setUserAnchor] = useState(null)
  const [bandAnchor, setBandAnchor] = useState(null)
  const { bands, reload: reloadBands } = useBands()
  const bandMatch = useMatch('/bands/:bandId/*')
  const currentBand = bands.find((band) => String(band.id) === bandMatch?.params.bandId)

  // Band create, rinominate, eliminate o lasciate: si rilegge l'elenco
  useEffect(() => {
    window.addEventListener(BANDS_CHANGED_EVENT, reloadBands)
    return () => window.removeEventListener(BANDS_CHANGED_EVENT, reloadBands)
  }, [reloadBands])

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
          <Button
            color="inherit"
            startIcon={<GroupsIcon />}
            endIcon={<ExpandMoreIcon />}
            onClick={(event) => setBandAnchor(event.currentTarget)}
            aria-label={currentBand ? t('nav.currentBand', { name: currentBand.name }) : t('nav.bands')}
            aria-haspopup="menu"
            sx={{ color: 'inherit', maxWidth: { md: 180, lg: 240 } }}
          >
            <Typography component="span" noWrap>
              {currentBand?.name ?? t('nav.bands')}
            </Typography>
          </Button>
          <Menu anchorEl={bandAnchor} open={Boolean(bandAnchor)} onClose={() => setBandAnchor(null)}>
            {bands.length === 0 && <MenuItem disabled>{t('nav.noBands')}</MenuItem>}
            {bands.map((band) => (
              <MenuItem
                key={band.id}
                component={RouterLink}
                to={`/bands/${band.id}`}
                selected={band.id === currentBand?.id}
                onClick={() => setBandAnchor(null)}
              >
                {band.name}
              </MenuItem>
            ))}
          </Menu>
          <LanguageSelect />
          <ThemeToggle />
          <Button
            color="inherit"
            startIcon={<AccountCircleIcon />}
            onClick={(event) => setUserAnchor(event.currentTarget)}
            aria-label={t('nav.userMenu')}
            aria-haspopup="menu"
            sx={{ color: 'inherit', maxWidth: { md: 160, lg: 220 } }}
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
        <List subheader={<ListSubheader disableSticky>{t('nav.bands')}</ListSubheader>}>
          {bands.length === 0 && (
            <ListItemButton disabled>
              <ListItemText primary={t('nav.noBands')} />
            </ListItemButton>
          )}
          {bands.map((band) => (
            <ListItemButton
              key={band.id}
              component={RouterLink}
              to={`/bands/${band.id}`}
              selected={band.id === currentBand?.id}
              aria-current={band.id === currentBand?.id ? 'page' : undefined}
              onClick={closeDrawer}
            >
              <ListItemIcon>
                <GroupsIcon />
              </ListItemIcon>
              <ListItemText primary={band.name} slotProps={{ primary: { noWrap: true } }} />
            </ListItemButton>
          ))}
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
