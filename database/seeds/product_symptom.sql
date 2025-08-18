-- Pain relievers
INSERT INTO product_symptom (symptom_id, product_id)
  SELECT s.id, p.id
    FROM symptom s
    JOIN product p ON p.atc_code LIKE 'M01A%'    -- NSAIDs
   WHERE s.code = 'durere'
ON CONFLICT DO NOTHING;

-- Headache (acetaminophen, NSAIDs)
INSERT INTO product_symptom (symptom_id, product_id)
  SELECT s.id, p.id
    FROM symptom s
    JOIN product p ON p.active_ingredient ILIKE '%PARACETAMOL%' OR p.atc_code LIKE 'N02B%'
   WHERE s.code = 'cefalee'
ON CONFLICT DO NOTHING;
