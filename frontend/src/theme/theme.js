import { red } from '@mui/material/colors'
import { alpha, createTheme, darken, lighten } from '@mui/material/styles'

// Palette del progetto: gli unici colori dell'interfaccia (più tonalità derivate, il bianco neutro e il rosso di errore di MUI)
export const palette = {
  mint: '#BCD8C1',
  sage: '#D6DBB2',
  flax: '#E3D985',
  orange: '#E57A44',
  plum: '#422040',
  white: '#FFFFFF',
}

const fontFamily = '"Atkinson Hyperlegible", system-ui, sans-serif'

// Transizioni brevi e leggere, uguali in tutta l'app
const ease = 'cubic-bezier(0.4, 0, 0.2, 1)'
const smooth = (...props) => props.map((prop) => `${prop} 200ms ${ease}`).join(', ')

// Comparsa morbida dei contenuti (cambio di pagina o di tab): sx={fadeIn}
export const fadeIn = { animation: `fadeIn 250ms ${ease} both` }

export function createAppTheme(mode) {
  const dark = mode === 'dark'

  return createTheme({
    palette: {
      mode,
      primary: dark
        ? { main: palette.orange, contrastText: palette.plum }
        : { main: palette.plum, contrastText: palette.flax },
      secondary: dark
        ? { main: palette.flax, contrastText: palette.plum }
        : { main: palette.orange, contrastText: palette.plum },
      background: dark
        ? { default: darken(palette.plum, 0.3), paper: palette.plum }
        : { default: lighten(palette.sage, 0.6), paper: palette.white },
      text: dark
        ? { primary: palette.sage, secondary: alpha(palette.sage, 0.8) }
        : { primary: palette.plum, secondary: alpha(palette.plum, 0.75) },
      // Rosso di MUI in una tonalità che resta leggibile (4.5:1) sugli sfondi della palette
      error: { main: dark ? red[300] : red[800] },
      // Separatori interni appena visibili (le superfici non hanno bordi)
      divider: dark ? alpha(palette.sage, 0.15) : alpha(palette.plum, 0.12),
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
        styleOverrides: {
          body: { overflowX: 'hidden', transition: smooth('background-color', 'color') },
          '@keyframes fadeIn': {
            from: { opacity: 0, transform: 'translateY(4px)' },
            to: { opacity: 1, transform: 'none' },
          },
          // Chi chiede meno movimento nel sistema non vede animazioni
          '@media (prefers-reduced-motion: reduce)': {
            '*, *::before, *::after': {
              animationDuration: '0.01ms !important',
              transitionDuration: '0.01ms !important',
            },
          },
        },
      },
      // Target tattili di almeno 44 px
      MuiButton: {
        styleOverrides: {
          root: { minHeight: 44, transition: smooth('background-color', 'border-color', 'color', 'box-shadow') },
        },
      },
      MuiIconButton: {
        styleOverrides: { root: { minWidth: 44, minHeight: 44, transition: smooth('background-color', 'color') } },
      },
      MuiListItemButton: {
        styleOverrides: { root: { minHeight: 44, transition: smooth('background-color') } },
      },
      MuiMenuItem: {
        styleOverrides: { root: { minHeight: 44, transition: smooth('background-color') } },
      },
      MuiChip: {
        styleOverrides: { root: { transition: smooth('background-color', 'border-color', 'color') } },
      },
      MuiLink: {
        defaultProps: { color: 'primary', underline: 'always' },
        styleOverrides: { root: { transition: smooth('color', 'text-decoration-color') } },
      },
      MuiTextField: {
        defaultProps: { fullWidth: true },
      },
      MuiOutlinedInput: {
        styleOverrides: { notchedOutline: { transition: smooth('border-color') } },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: palette.plum,
            color: palette.flax,
            backgroundImage: 'none',
            transition: smooth('background-color', 'color'),
          },
        },
      },
      // Superfici senza bordo: si distinguono dallo sfondo per il colore
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            transition: smooth('background-color', 'box-shadow'),
            variants: [{ props: { variant: 'outlined' }, style: { border: 'none' } }],
          },
        },
      },
      // Card cliccabili: si sollevano appena al passaggio del mouse
      MuiCard: {
        styleOverrides: {
          root: {
            transition: smooth('background-color', 'box-shadow', 'transform'),
            '&:has(.MuiCardActionArea-root):hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0 6px 16px ${alpha(darken(palette.plum, 0.5), dark ? 0.5 : 0.18)}`,
            },
          },
        },
      },
      MuiTab: {
        styleOverrides: { root: { transition: smooth('color', 'background-color') } },
      },
      // Stelle dell'energia con i colori della palette (piene contro solo contorno)
      MuiRating: {
        styleOverrides: {
          iconFilled: { color: dark ? palette.flax : palette.plum },
          iconEmpty: { color: dark ? alpha(palette.sage, 0.5) : alpha(palette.plum, 0.4) },
        },
      },
      MuiAccordion: {
        styleOverrides: { root: { '&::before': { display: 'none' } } },
      },
    },
  })
}
