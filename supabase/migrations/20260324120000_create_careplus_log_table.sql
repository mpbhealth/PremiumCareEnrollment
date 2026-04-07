/*
  # careplus_log — enrollment-api-careplus request/response audit

  - created_at: when the request was processed
  - log: JSON text (outcome, HTTP status, external API snippet, errors — no masking)
  - request_payload: full incoming body after decrypt (PII in clear for ops debugging)
  - payload_size_bytes: byte length of request_payload UTF-8 (for sampling / limits)
*/

CREATE TABLE IF NOT EXISTS careplus_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  log text NOT NULL DEFAULT '{}',
  request_payload text,
  payload_size_bytes integer
);

ALTER TABLE careplus_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role insert careplus_log"
  ON careplus_log
  FOR INSERT
  TO service_role
  WITH CHECK (true);

CREATE POLICY "service_role select careplus_log"
  ON careplus_log
  FOR SELECT
  TO service_role
  USING (true);

CREATE INDEX IF NOT EXISTS idx_careplus_log_created_at
  ON careplus_log (created_at DESC);

COMMENT ON TABLE careplus_log IS 'Care+ enrollment API audit: full request payload (clear) and response metadata';
