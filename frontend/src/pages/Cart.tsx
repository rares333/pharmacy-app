// import React, { useState } from 'react';
// import {
//   Box,
//   Typography,
//   List,
//   ListItem,
//   ListItemText,
//   IconButton,
//   Button,
//   CircularProgress,
//   Alert
// } from '@mui/material';
// import DeleteIcon from '@mui/icons-material/Delete';
// import { useCart }   from '../contexts/CartContext';
// import { useCard }   from '../contexts/CardContext';
// import { sendOrder } from '../services/orderService';

// export default function Cart() {
//   const { items, remove, clear } = useCart();
//   const { cardId }               = useCard();
//   const [loading, setLoading]    = useState(false);
//   const [error, setError]        = useState<string | null>(null);
//   const [success, setSuccess]    = useState<number | null>(null);

//   const total = items.reduce((sum, i) => sum + (i.price_eur ?? 0) * i.quantity, 0);

//   const handleSendOrder = async () => {
//     setError(null);
//     setSuccess(null);

//     if (items.length === 0) {
//       setError('Your cart is empty.');
//       return;
//     }

//     setLoading(true);
//     try {
//       const { orderId } = await sendOrder(
//         items.map(i => ({ id: i.id, quantity: i.quantity })),
//         cardId || undefined
//       );
//       setSuccess(orderId);
//       clear();
//     } catch (e: any) {
//       console.error('Order failed:', e);
//       setError(e.response?.data?.error ?? 'Failed to send order. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Box p={2}>
//       <Typography variant="h5" gutterBottom>My Cart</Typography>

//       {error && (
//         <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
//       )}
//       {success && (
//         <Alert severity="success" sx={{ mb: 2 }}>
//           Order #{success} placed successfully!
//         </Alert>
//       )}

//       {items.length === 0 ? (
//         <Typography>No items in your cart.</Typography>
//       ) : (
//         <>
//           <List>
//             {items.map(item => (
//               <ListItem
//                 key={item.id}
//                 secondaryAction={
//                   <IconButton edge="end" onClick={() => remove(item.id)}>
//                     <DeleteIcon />
//                   </IconButton>
//                 }
//               >
//                 <ListItemText
//                   primary={`${item.name} (${item.quantity}×)`}
//                   secondary={`${item.price_eur?.toFixed(2) ?? '—'} € each`}
//                 />
//               </ListItem>
//             ))}
//           </List>

//           <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
//             <Typography variant="h6">Total: {total.toFixed(2)} €</Typography>
//             <Button
//               variant="contained"
//               color="primary"
//               onClick={handleSendOrder}
//               disabled={loading}
//               startIcon={loading ? <CircularProgress size={20} /> : undefined}
//             >
//               {loading ? 'Sending…' : 'Send Order'}
//             </Button>
//           </Box>
//         </>
//       )}
//     </Box>
//   );
// }


// src/pages/Cart.tsx
import React, { useState } from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Button,
  CircularProgress,
  Alert
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useCart } from '../contexts/CartContext';
import { useCard } from '../contexts/CardContext';
import { useNavigate } from 'react-router-dom';
import { sendOrder } from '../services/orderService';
export default function Cart() {
  const { items, remove, clear } = useCart();
  const { cardId, setCardId, setSkippedCard } = useCard();

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [success, setSuccess] = useState<number | null>(null);
  const navigate = useNavigate();
  const total = items.reduce((sum, i) => sum + (i.price_eur ?? 0) * i.quantity, 0);

  const handleSendOrder = async () => {
    setError(null);
    setSuccess(null);

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    setLoading(true);
    try {
      const { orderId } = await sendOrder(
        items.map(i => ({ id: i.id, quantity: i.quantity })),
        cardId || undefined
      );

      setSuccess(orderId);

      // 1) clear cart
      clear();
      // 2) reset loyalty‐card flow
      setCardId('');
      setSkippedCard(false);
      // 3) navigate back home
      navigate('/');
      navigate(`/ticket/${orderId}`);
    } catch (e: any) {
      console.error('Order failed:', e);
      setError(
        e.response?.data?.error ??
        'Failed to send order. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        My Cart
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Order #{success} placed! Returning to Home…
        </Alert>
      )}

      {items.length === 0 ? (
        <Typography>No items in your cart.</Typography>
      ) : (
        <>
          <List>
            {items.map(item => (
              <ListItem
                key={item.id}
                secondaryAction={
                  <IconButton edge="end" onClick={() => remove(item.id)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={`${item.name} (${item.quantity}×)`}
                  secondary={`${item.price_eur?.toFixed(2) ?? '—'} € each`}
                />
              </ListItem>
            ))}
          </List>

          <Box mt={2} display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Total: {total.toFixed(2)} €
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendOrder}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : undefined}
            >
              {loading ? 'Sending…' : 'Send Order'}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
