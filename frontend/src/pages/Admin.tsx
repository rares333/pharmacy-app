// src/pages/Admin.tsx
import React, { useEffect, useState } from 'react'
import { Box, Typography, Table, TableHead, TableRow, TableCell, TableBody, CircularProgress, Alert } from '@mui/material'
import axios from 'axios'

interface OrderView {
  order_id: number
  card_id: string | null
  created_at: string
  product_ids: number[]
  quantities: number[]
}

export default function Admin() {
  const [data, setData]       = useState<OrderView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string|null>(null)

  useEffect(() => {
    axios.get<OrderView[]>('/api/admin/orders')
      .then(r => setData(r.data))
      .catch(e => {
        console.error(e)
        setError('Could not load orders')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <CircularProgress />
  if (error)   return <Alert severity="error">{error}</Alert>

  return (
    <Box p={2}>
      <Typography variant="h4" gutterBottom>Admin — All Orders</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Order ID</TableCell>
            <TableCell>Card ID</TableCell>
            <TableCell>Created At</TableCell>
            <TableCell>Products</TableCell>
            <TableCell>Quantities</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(o => (
            <TableRow key={o.order_id}>
              <TableCell>{o.order_id}</TableCell>
              <TableCell>{o.card_id ?? '—'}</TableCell>
              <TableCell>{new Date(o.created_at).toLocaleString()}</TableCell>
              <TableCell>{o.product_ids.join(', ')}</TableCell>
              <TableCell>{o.quantities.join(', ')}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  )
}
