import { alpha, createTheme } from '@mui/material/styles'

// Palette del progetto: gli unici colori dell'interfaccia (più il rosso di errore di MUI)
export const palette = {
  night: '#0D1B2A',
  ink: '#1B263B',
  steel: '#415A77',
  dust: '#778DA9',
  white: '#FFFFFF',
}

const fontFamily = '"Atkinson Hyperlegible", system-ui, sans-serif'

export function createAppTheme(mode) {
  const dark = mode === 'dark'

  return createTheme({
    palette: {
      mode,
      primary: dark
        ? { main: palette.dust, contrastText: palette.night }
        : { main: palette.steel, contrastText: palette.white },
      secondary: { main: palette.steel, contrastText: palette.white },
      background: dark
        ? { default: palette.night, paper: palette.ink }
        : { default: palette.white, paper: palette.white },
      text: dark
        ? { primary: palette.white, secondary: alpha(palette.white, 0.8) }
        : { primary: palette.night, secondary: palette.steel },
      divider: dark ? palette.steel : alpha(palette.dust, 0.5),
    },
    typography: {
      fontFamily,
      button: { textTransform: 'none', fontWeight: 700 },
      h1: { fontSize: '2rem', fontWeight: 700 },
      h2: { fontSize: '1.6rem', fontWeight: 700 },
      h3: { fontSize: '1.3rem', fontWeight: 700 },
    },
    shape: { borderRadius: 8 },
    components: {
      MuiCssBaseline: {
        styleOverrides: { body: { overflowX: 'hidden' } },
      },
      // Target tattili di almeno 44 px
      MuiButton: {
        styleOverrides: {
          root: { minHeight: 44 },
          // #778DA9 come testo sulle superfici scure non raggiunge 4.5:1: i pulsanti di testo restano bianchi
          text: dark ? { color: palette.white } : {},
          outlined: dark ? { color: palette.white, borderColor: palette.dust } : {},
        },
      },
      MuiIconButton: {
        styleOverrides: { root: { minWidth: 44, minHeight: 44 } },
      },
      MuiListItemButton: {
        styleOverrides: { root: { minHeight: 44 } },
      },
      MuiMenuItem: {
        styleOverrides: { root: { minHeight: 44 } },
      },
      MuiLink: {
        defaultProps: { color: dark ? 'inherit' : 'primary', underline: 'always' },
      },
      MuiTextField: {
        defaultProps: { fullWidth: true },
      },
      MuiAppBar: {
        styleOverrides: {
          root: { backgroundColor: palette.ink, color: palette.white, backgroundImage: 'none' },
        },
      },
      MuiPaper: {
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiAccordion: {
        styleOverrides: {
          root: dark ? {} : { border: `1px solid ${alpha(palette.dust, 0.5)}` },
        },
      },
    },
  })
}
