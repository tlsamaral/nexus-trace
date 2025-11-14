-- schema.sql: DDL básico para PostgreSQL
CREATE TABLE IF NOT EXISTS customer (
  id BIGSERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  doc VARCHAR(32) UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS account (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customer(id),
  opened_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  status TEXT NOT NULL CHECK (status IN ('active','blocked','closed')),
  risk_score NUMERIC(5,2) DEFAULT 0
);

CREATE TABLE IF NOT EXISTS merchant (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  mcc VARCHAR(4),
  region TEXT
);

CREATE TABLE IF NOT EXISTS device (
  id BIGSERIAL PRIMARY KEY,
  fingerprint_hash TEXT UNIQUE NOT NULL,
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  risk_level TEXT CHECK (risk_level IN ('low','mid','high')) DEFAULT 'low'
);

CREATE TABLE IF NOT EXISTS transaction (
  id BIGSERIAL PRIMARY KEY,
  ts TIMESTAMPTZ NOT NULL,
  src_account_id BIGINT NOT NULL REFERENCES account(id),
  dst_account_id BIGINT NOT NULL REFERENCES account(id),
  merchant_id BIGINT REFERENCES merchant(id),
  amount NUMERIC(14,2) NOT NULL CHECK (amount >= 0),
  channel TEXT NOT NULL CHECK (channel IN ('pix','ted','boleto','card','atm','web','mobile')),
  device_id BIGINT REFERENCES device(id),
  location TEXT,
  meta JSONB
);

CREATE TABLE IF NOT EXISTS relationship (
  a_id BIGINT NOT NULL REFERENCES account(id),
  b_id BIGINT NOT NULL REFERENCES account(id),
  type TEXT NOT NULL CHECK (type IN ('shared_phone','shared_email','shared_address','shared_ip','shared_device')),
  evidence TEXT,
  first_seen_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (a_id,b_id,type)
);

CREATE TABLE IF NOT EXISTS label (
  entity_type TEXT NOT NULL CHECK (entity_type IN ('account','device','merchant','transaction')),
  entity_id BIGINT NOT NULL,
  label TEXT NOT NULL CHECK (label IN ('fraud','legit','suspect')),
  source TEXT,
  labeled_at TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_tx_src_time ON transaction (src_account_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_tx_dst_time ON transaction (dst_account_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_tx_amount ON transaction (amount);
CREATE INDEX IF NOT EXISTS idx_tx_meta_gin ON transaction USING GIN (meta);
CREATE INDEX IF NOT EXISTS idx_tx_device_time ON transaction (device_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_rel_type ON relationship (type);
