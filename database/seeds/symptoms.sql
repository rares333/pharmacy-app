INSERT INTO symptom (code, name_ro, name_en) VALUES
  ('durere',        'Durere',        'Pain'),
  ('cefalee',       'Dureri de cap','Headache'),
  ('tuse',          'Tuse',          'Cough'),
  ('raceala',       'Răceală',       'Cold'),
  ('indigestie',    'Indigestie',    'Indigestion')
ON CONFLICT (code) DO NOTHING;
