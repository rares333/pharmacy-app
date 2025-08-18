import React, { useState } from 'react';
import { Box, TextField, Button } from '@mui/material';

interface Props {
  onScan: (cardId: string) => void;
}

export default function LoyaltyInput({ onScan }: Props) {
  const [cardId, setCardId] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (cardId.trim()) onScan(cardId.trim());
  };

  return (
    <Box
      component="form"
      onSubmit={submit}
      sx={{
        display: 'flex',
        gap: 1,
        justifyContent: 'center',
        mb: 2
      }}
    >
      <TextField
        label="Loyalty Card #"
        value={cardId}
        onChange={e => setCardId(e.target.value)}
        size="small"
      />
      <Button type="submit" variant="outlined">
        Scan
      </Button>
    </Box>
  );
}
