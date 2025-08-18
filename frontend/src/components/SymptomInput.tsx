// src/components/SymptomInput.tsx
import React, { useState, useMemo, useEffect } from 'react';
import { Autocomplete, TextField, Box } from '@mui/material';
import debounce from 'lodash.debounce';
import { fetchSymptomSuggestions } from '../services/symptomService';

interface Props {
  onSubmit: (symptom: string) => void;
  width?: number | string; // allow customizing width if you like
}

export default function SymptomInput({ onSubmit, width = 400 }: Props) {
  const [input, setInput] = useState('');
  const [options, setOptions] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  // Debounced fetch
  const loadSuggestions = useMemo(
    () =>
      debounce(async (q: string) => {
        if (q.trim().length >= 2) {
          try {
            const sugg = await fetchSymptomSuggestions(q);
            setOptions(sugg);
          } catch {
            setOptions([]);
          }
        } else {
          setOptions([]);
        }
      }, 300),
    []
  );

  useEffect(() => {
    loadSuggestions(input);
  }, [input, loadSuggestions]);

  return (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        const q = input.trim();
        if (q) onSubmit(q);
      }}
      sx={{ width, maxWidth: '100%' }}
    >
      <Autocomplete
        freeSolo
        open={open}
        onOpen={() => setOpen(true)}
        onClose={() => setOpen(false)}
        options={options}
        inputValue={input}
        onInputChange={(_, value) => setInput(value)}
        onChange={(_, value) => {
          if (typeof value === 'string' && value.trim()) {
            onSubmit(value.trim());
          }
        }}
        sx={{ width: '100%' }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Symptom…"
            placeholder="e.g. durere"
            fullWidth
            InputProps={{
              ...params.InputProps,
              type: 'search',
            }}
          />
        )}
      />
    </Box>
  );
}
