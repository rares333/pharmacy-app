
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Typography,
  TextField,
  Container,
  Card,
  CardContent,
  CardActions,
  CardHeader
} from '@mui/material';
import { useCard } from '../contexts/CardContext';
import SymptomInput from '../components/SymptomInput';

export default function Home() {
  const { cardId, setCardId, skippedCard, setSkippedCard } = useCard();
  const [cardInput, setCardInput] = useState('');
  const nav = useNavigate();

  // 1) Handle loyalty‐card entry
  const handleCardSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = cardInput.trim();
    if (trimmed) setCardId(trimmed);
  };

  // 2) Skip card flow
  const handleSkip = () => {
    setSkippedCard(true);
  };

  // 3) Navigate when symptom is chosen
  const handleSymptomSubmit = (symptom: string) => {
    nav(`/recommendations?symptom=${encodeURIComponent(symptom)}`);
  };

  // 4) First: prompt for card unless already scanned or skipped
  if (!cardId && !skippedCard) {
    return (
      <Container maxWidth="sm" sx={{ mt: 8 }}>
        <Card elevation={3}>
          <CardHeader title="Enter Loyalty Card (optional)" />
          <CardContent>
            <Typography variant="body2" color="textSecondary">
              Providing your card allows you to see past searches.
            </Typography>
            <Box
              component="form"
              onSubmit={handleCardSubmit}
              sx={{ display: 'flex', gap: 2, mt: 2 }}
            >
              <TextField
                label="Card ID"
                variant="outlined"
                fullWidth
                value={cardInput}
                onChange={(e) => setCardInput(e.target.value)}
              />
              <Button type="submit" variant="contained">
                Enter
              </Button>
            </Box>
          </CardContent>
          <CardActions sx={{ justifyContent: 'flex-end' }}>
            <Button onClick={handleSkip} color="inherit">
              Skip
            </Button>
          </CardActions>
        </Card>
      </Container>
    );
  }

  // 5) Then: show the symptom autosuggest input
  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Card elevation={3}>
        <CardHeader title="Find Medicines by Symptom" />
        <CardContent>
          {cardId && (
            <Typography variant="subtitle2" gutterBottom>
              Using card: <strong>{cardId}</strong>
            </Typography>
          )}
          <SymptomInput onSubmit={handleSymptomSubmit} />
        </CardContent>
      </Card>
    </Container>
  );
}
