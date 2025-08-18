import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Button, Typography, Paper } from '@mui/material';

export default function Ticket() {
  const { orderId } = useParams<{ orderId: string }>();
  const nav = useNavigate();

  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      sx={{ mt: 8 }}
    >
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center', minWidth: 300 }}>
        <Typography variant="h5" gutterBottom>
          Your Pharmacy Ticket
        </Typography>
        <Typography variant="h2" color="primary" gutterBottom>
          #{orderId}
        </Typography>
        <Typography>
          Please take a seat and wait. We'll call you when your order is ready.
        </Typography>
      </Paper>

      <Button
        variant="outlined"
        sx={{ mt: 4 }}
        onClick={() => nav('/')}
      >
        Back to Home
      </Button>
    </Box>
  );
}
