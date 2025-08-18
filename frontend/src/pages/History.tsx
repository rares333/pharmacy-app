// src/pages/History.tsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from '@mui/material';
import { useCard } from '../contexts/CardContext';

interface HistoryEntry {
  symptom: string;
  cardId?: string;
  at: string;
}

export default function History() {
  const { cardId, skippedCard } = useCard();
  const [entries, setEntries] = useState<HistoryEntry[]>([]);
  const nav = useNavigate();

  // reload from localStorage whenever card context changes
  useEffect(() => {
    const raw = localStorage.getItem('pharmacy_tablet_history');
    const all: HistoryEntry[] = raw ? JSON.parse(raw) : [];

    let filtered: HistoryEntry[] = [];
    if (cardId) {
      filtered = all.filter((e) => e.cardId === cardId);
    } else if (skippedCard) {
      filtered = all;
    }
    setEntries(filtered);
  }, [cardId, skippedCard]);

  return (
    <Box p={2}>
      <Typography variant="h5" gutterBottom>
        {cardId
          ? `History for Card ${cardId}`
          : skippedCard
            ? 'All Searches History'
            : 'Your Search History'}
      </Typography>

      {!cardId && !skippedCard && (
        <Typography color="textSecondary">
          Please scan or skip your loyalty card on the Home page to view history.
        </Typography>
      )}

      {(cardId || skippedCard) && entries.length === 0 && (
        <Typography color="textSecondary">
          No searches found yet.
        </Typography>
      )}

      {entries.length > 0 && (
        <List>
          {entries.map((e, idx) => (
            <ListItem key={idx} disablePadding divider>
              <ListItemButton
                onClick={() =>
                  nav(`/recommendations?symptom=${encodeURIComponent(e.symptom)}`)
                }
              >
                <ListItemText
                  primary={e.symptom}
                  secondary={new Date(e.at).toLocaleString()}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}
