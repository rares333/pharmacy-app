-- database/schema.sql

-- Products table
CREATE TABLE IF NOT EXISTS product (
  id             SERIAL PRIMARY KEY,
  atc_code       VARCHAR(7)    NOT NULL,
  name           TEXT          NOT NULL,
  brand          TEXT          NOT NULL,
  dosage_form    TEXT,
  pack_size      TEXT,
  is_otc         BOOLEAN       NOT NULL DEFAULT TRUE,
  price_eur      NUMERIC(8,2),
  stock_level    INT,
  image_url      TEXT
);

-- Symptoms table
CREATE TABLE IF NOT EXISTS symptom (
  id             SERIAL PRIMARY KEY,
  snomed_code    VARCHAR(20)   UNIQUE NOT NULL,
  name           TEXT          NOT NULL
);

-- Junction table mapping products to symptoms
CREATE TABLE IF NOT EXISTS product_symptom_map (
  product_id     INT REFERENCES product(id),
  symptom_id     INT REFERENCES symptom(id),
  priority       INT           DEFAULT 0,
  PRIMARY KEY (product_id, symptom_id)
);

-- Sales events for inventory tracking
CREATE TABLE IF NOT EXISTS sale_event (
  id             SERIAL PRIMARY KEY,
  product_id     INT REFERENCES product(id),
  quantity       INT           NOT NULL,
  sold_at        TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  loyalty_id     VARCHAR(50)
);


CREATE TABLE IF NOT EXISTS symptom (
  id        SERIAL   PRIMARY KEY,
  code      TEXT     UNIQUE NOT NULL,    -- e.g. SNOMED CT code or a simple slug
  name_ro   TEXT     NOT NULL,            -- Romanian label
  name_en   TEXT
);

CREATE TABLE IF NOT EXISTS product_symptom (
  symptom_id INT  REFERENCES symptom(id)  ON DELETE CASCADE,
  product_id INT  REFERENCES product(id)  ON DELETE CASCADE,
  PRIMARY KEY (symptom_id, product_id)
);