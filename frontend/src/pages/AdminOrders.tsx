import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert
} from '@mui/material';
import { fetchOrderSummaries, OrderSummary } from '../services/adminService';

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string|null>(null);

  useEffect(() => {
    fetchOrderSummaries()
      .then(data => setOrders(data))
      .catch(e => {
        console.error(e);
        setError('Failed to load orders');
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Box textAlign="center"><CircularProgress /></Box>;
  if (error)   return <Alert severity="error">{error}</Alert>;

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>All Orders</Typography>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Order ID</TableCell>
            <TableCell>Card ID</TableCell>
            <TableCell>Date Placed</TableCell>
            <TableCell>Product IDs</TableCell>
            <TableCell>Qtys</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {orders.map(o => (
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
  );
}
