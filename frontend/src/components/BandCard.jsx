import GroupIcon from '@mui/icons-material/Group'
import { Box, Card, CardActionArea, CardContent, Chip, Stack, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { Link as RouterLink } from 'react-router-dom'

// Card della band nella Dashboard: nome, genere, membri e strumenti dell'utente
export default function BandCard({ band }) {
  const { t } = useTranslation()

  return (
    <Card variant="outlined">
      <CardActionArea component={RouterLink} to={`/bands/${band.id}`}>
        <CardContent>
          <Stack direction="row" spacing={1} sx={{ alignItems: 'baseline', justifyContent: 'space-between' }}>
            <Typography variant="h3" component="h3" sx={{ wordBreak: 'break-word' }}>
              {band.name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary', flexShrink: 0 }}>
              <GroupIcon fontSize="small" aria-hidden />
              <Typography variant="body2">{t('bands.membersCount', { count: band.members_count })}</Typography>
            </Box>
          </Stack>
          {band.genre && (
            <Typography variant="body2" color="text.secondary">
              {band.genre}
            </Typography>
          )}
          <Typography variant="body2" sx={{ mt: 1.5, mb: 0.5 }}>
            {t('bands.myInstruments')}
          </Typography>
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.5 }}>
            {band.my_instruments.map((instrument) => (
              <Chip key={instrument} label={instrument} size="small" />
            ))}
          </Stack>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}
