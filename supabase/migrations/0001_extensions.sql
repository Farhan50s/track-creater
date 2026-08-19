-- 0001_extensions.sql
-- Enable pgcrypto in extensions schema if available

CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";
