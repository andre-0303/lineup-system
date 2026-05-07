CREATE OR REPLACE FUNCTION check_speaker_conflict(
  p_speaker_id UUID,
  p_start_time TIMESTAMPTZ,
  p_end_time TIMESTAMPTZ,
  p_event_id UUID,
  p_exclude_session_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM sessions s
    JOIN session_speakers ss ON s.id = ss.session_id
    WHERE ss.speaker_id = p_speaker_id
      AND s.event_id = p_event_id
      AND s.id != COALESCE(p_exclude_session_id, '00000000-0000-0000-0000-000000000000'::UUID)
      AND (p_start_time, p_end_time) OVERLAPS (s.start_time, s.end_time)
  );
END;
$$ LANGUAGE plpgsql;