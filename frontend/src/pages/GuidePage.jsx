import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Link,
  List,
  ListItem,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import PageShell from '../components/PageShell'

// Pagina statica, senza chiamate all'API: testi in locales/*.json (guide.sections)
export default function GuidePage() {
  const { t } = useTranslation()
  const sections = t('guide.sections', { returnObjects: true })
  const [expanded, setExpanded] = useState(() => new Set([sections[0]?.id]))

  const toggle = (id) => {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  // Dall'indice: apre la sezione e ci scorre sopra
  const goTo = (event, id) => {
    event.preventDefault()
    setExpanded((current) => new Set(current).add(id))
    document.getElementById(`guide-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <PageShell>
      <Stack spacing={3}>
        <Box>
          <Typography variant="h1" gutterBottom>
            {t('guide.title')}
          </Typography>
          <Typography color="text.secondary">{t('guide.intro')}</Typography>
        </Box>

        <Paper variant="outlined" component="nav" aria-labelledby="guide-index" sx={{ p: 2 }}>
          <Typography id="guide-index" variant="h2" sx={{ fontSize: '1.1rem', mb: 1 }}>
            {t('guide.index')}
          </Typography>
          <List dense disablePadding component="ol" sx={{ pl: 2.5, listStyle: 'decimal' }}>
            {sections.map((section) => (
              <ListItem key={section.id} disablePadding sx={{ display: 'list-item' }}>
                <Link
                  href={`#guide-${section.id}`}
                  onClick={(event) => goTo(event, section.id)}
                  sx={{ display: 'inline-block', py: 1.25 }}
                >
                  {section.title}
                </Link>
              </ListItem>
            ))}
          </List>
        </Paper>

        <Box>
          {sections.map((section) => (
            <Accordion
              key={section.id}
              id={`guide-${section.id}`}
              expanded={expanded.has(section.id)}
              onChange={() => toggle(section.id)}
              disableGutters
              sx={{ scrollMarginTop: 80 }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`guide-${section.id}-content`}
                id={`guide-${section.id}-header`}
              >
                <Typography component="h2" variant="h3">
                  {section.title}
                </Typography>
              </AccordionSummary>
              <AccordionDetails id={`guide-${section.id}-content`}>
                <Stack spacing={1.5}>
                  {section.paragraphs.map((paragraph) => (
                    <Typography key={paragraph}>{paragraph}</Typography>
                  ))}
                </Stack>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Stack>
    </PageShell>
  )
}
