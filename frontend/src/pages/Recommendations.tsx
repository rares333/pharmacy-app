import React, { useEffect, useState, useMemo } from 'react'
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Button,
  Alert,
  Skeleton,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import { useLocation, useNavigate } from 'react-router-dom'
import { fetchRecommendations, ProductRecommendation } from '../services/symptomService'
import { useCard } from '../contexts/CardContext'
import ProductDetail from '../components/ProductDetail'
import { useCart } from '../contexts/CartContext'

export default function Recommendations() {
  const { cardId } = useCard()
  const nav = useNavigate()
  const { add } = useCart()
  const { search } = useLocation()
  const symptom = new URLSearchParams(search).get('symptom') || ''

  const [results, setResults] = useState<ProductRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [selected, setSelected] = useState<ProductRecommendation | null>(null)
  const handleClose = () => setSelected(null)

  const [otcFilter, setOtcFilter] = useState<'all' | 'otc' | 'prescription'>('all')
  const [brandFilter, setBrandFilter] = useState('all')
  const [dosageFilter, setDosageFilter] = useState('all')

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchRecommendations(symptom, cardId || undefined)
      .then(data => setResults(data))
      .catch(() => setError('Failed to load recommendations. Please try again.'))
      .finally(() => setLoading(false))
  }, [symptom, cardId])

  const brands = useMemo(() => ['all', ...Array.from(new Set(results.map(r => r.brand)))], [results])
  const dosages = useMemo(() => ['all', ...Array.from(new Set(results.map(r => r.dosage)))], [results])

  const displayed = useMemo(() => {
    return results
      .filter(p => {
        if (otcFilter === 'otc') return p.is_otc
        if (otcFilter === 'prescription') return !p.is_otc
        return true
      })
      .filter(p => brandFilter === 'all' || p.brand === brandFilter)
      .filter(p => dosageFilter === 'all' || p.dosage === dosageFilter)
      .sort((a, b) => {
        if (a.in_stock !== b.in_stock) return a.in_stock ? -1 : 1
        return (b.price_eur || 0) - (a.price_eur || 0)
      })
  }, [results, otcFilter, brandFilter, dosageFilter])

  return (
    <Box>
      <Button onClick={() => nav(-1)} sx={{ mb: 2 }}>
        ← Back
      </Button>

      <Typography variant="h5" gutterBottom>
        Recommendations for “{symptom}”
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      {!loading && !error && (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
          <ToggleButtonGroup
            value={otcFilter}
            exclusive
            onChange={(_, v) => v && setOtcFilter(v)}
          >
            <ToggleButton value="all">All</ToggleButton>
            <ToggleButton value="otc">OTC</ToggleButton>
            <ToggleButton value="prescription">Prescription</ToggleButton>
          </ToggleButtonGroup>

          <FormControl size="small">
            <InputLabel>Brand</InputLabel>
            <Select
              value={brandFilter}
              label="Brand"
              onChange={e => setBrandFilter(e.target.value)}
            >
              {brands.map(b => <MenuItem key={b} value={b}>{b === 'all' ? 'All Brands' : b}</MenuItem>)}
            </Select>
          </FormControl>

          <FormControl size="small">
            <InputLabel>Dosage</InputLabel>
            <Select
              value={dosageFilter}
              label="Dosage"
              onChange={e => setDosageFilter(e.target.value)}
            >
              {dosages.map(d => <MenuItem key={d} value={d}>{d === 'all' ? 'All Sizes' : d}</MenuItem>)}
            </Select>
          </FormControl>
        </Box>
      )}

      {loading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 8 }).map((_, idx) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={idx}>
              <Card>
                <Skeleton variant="rectangular" height={140} />
                <CardContent>
                  <Skeleton width="60%" />
                  <Skeleton width="40%" />
                  <Skeleton width="80%" />
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : displayed.length > 0 ? (
        <Grid container spacing={2}>
          {displayed.map(prod => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={prod.id}>
              <Card>
                {prod.image_url
                  ? <CardMedia component="img" height="140" image={prod.image_url} alt={prod.name} />
                  : <Skeleton variant="rectangular" height={140} />}
                <CardContent>
                  <Typography variant="h6">{prod.name}</Typography>
                  <Typography variant="body2" color="textSecondary">{prod.brand}</Typography>
                  <Typography variant="subtitle1">
                    {prod.price_eur != null ? `${prod.price_eur.toFixed(2)} €` : '— €'}
                  </Typography>
                  <Typography variant="caption" color={prod.in_stock ? 'success.main' : 'error.main'}>
                    {prod.in_stock ? 'In stock' : 'Out of stock'}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
                  <Button size="small" onClick={() => setSelected(prod)}>View Details</Button>
                  <Button size="small" onClick={() => add(prod)} disabled={!prod.in_stock}>
                    {prod.in_stock ? 'Add to cart' : 'Notify me'}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography mt={4} color="textSecondary">
          No products found for “{symptom}.”
        </Typography>
      )}

      <ProductDetail open={Boolean(selected)} product={selected} onClose={handleClose} />
    </Box>
  )
}
