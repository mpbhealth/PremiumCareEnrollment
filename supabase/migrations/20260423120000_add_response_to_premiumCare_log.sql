/*
  # premiumCare_log — store external enrollment API JSON response

  `response` holds the JSON body returned from 1administration (SUCCESS, MESSAGES, MEMBER, etc.).
  Outbound audit remains in `request_payload` and summary metadata in `log`.
*/

ALTER TABLE public."premiumCare_log"
  ADD COLUMN IF NOT EXISTS response text;

COMMENT ON COLUMN public."premiumCare_log".response IS
  'JSON string of external enrollment API response (SUCCESS, MESSAGES, MEMBER.ID, etc.)';
