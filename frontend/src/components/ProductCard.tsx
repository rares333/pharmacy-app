import React from 'react';
import { Card, CardContent, CardMedia, Typography, Button } from '@mui/material';
import { Product } from '../services/productService';

interface Props { product: Product; }

export default function ProductCard({ product }: Props) {
  return (
    <Card sx={{ maxWidth: 200, m: 1 }}>
      {product.image_url && (
        <CardMedia
          component="img"
          height="140"
          image={product.image_url}
          alt={product.name}
        />
      )}
      <CardContent>
        <Typography variant="h6" gutterBottom>
          {product.name}
        </Typography>
        <Typography variant="body2">
          {product.brand}
        </Typography>
        <Typography variant="body2">
          {product.dosage_form}
        </Typography>
        <Typography variant="subtitle1" sx={{ mt: 1 }}>
          {product.price_eur != null ? `${product.price_eur.toFixed(2)} €` : '—'}
        </Typography>
        <Button size="small" sx={{ mt: 1 }} variant="contained" fullWidth>
          Add to cart
        </Button>
      </CardContent>
    </Card>
  );
}
