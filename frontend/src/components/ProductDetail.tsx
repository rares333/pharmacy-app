// src/components/ProductDetail.tsx
import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Slide,
  SlideProps,
  Box
} from '@mui/material';
import { useCart } from '../contexts/CartContext';
import { ProductRecommendation } from '../services/symptomService';

const Transition = React.forwardRef(function Transition(
  props: SlideProps & { children: React.ReactElement },
  ref: React.Ref<unknown>,
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface ProductDetailProps {
  open: boolean;
  product: ProductRecommendation | null;
  onClose: () => void;
}

export default function ProductDetail({ open, product, onClose }: ProductDetailProps) {
  const { add } = useCart();

  if (!product) return null;

  const handleAdd = () => {
    if (product.in_stock) {
      add(product);
      onClose();
    }
  };

  return (
    <Dialog
      fullWidth
      maxWidth="sm"
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
    >
      <DialogTitle>{product.name}</DialogTitle>
      <DialogContent dividers>
        <Box mb={2} textAlign="center">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              style={{ maxWidth: '100%', maxHeight: 200 }}
            />
          ) : (
            <Box sx={{ width: '100%', height: 200, bgcolor: 'grey.200' }} />
          )}
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          Brand: {product.brand}
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Price:{' '}
          {product.price_eur != null
            ? `${product.price_eur.toFixed(2)} €`
            : '—'}
        </Typography>
        <Typography
          variant="subtitle1"
          gutterBottom
          color={product.in_stock ? 'success.main' : 'error.main'}
        >
          {product.in_stock ? 'In stock' : 'Out of stock'}
        </Typography>

        <Typography variant="body2" color="textSecondary" paragraph>
          <strong>Indications:</strong>{' '}
          {product.indications || '—'}
        </Typography>

        <Typography variant="body2" color="textSecondary" paragraph>
          <strong>Dosage:</strong>{' '}
          {product.dosage_form || '—'}
        </Typography>

        <Typography variant="body2" color="textSecondary">
          <strong>Side effects:</strong> Nausea, dizziness, allergic reactions…
        </Typography>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleAdd}
          disabled={!product.in_stock}
        >
          Add to cart
        </Button>
      </DialogActions>
    </Dialog>
  );
}
