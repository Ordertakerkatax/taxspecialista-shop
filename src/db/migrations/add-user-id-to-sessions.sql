ALTER TABLE consultation_sessions ADD COLUMN user_id TEXT;
CREATE INDEX idx_sessions_user_id ON consultation_sessions (user_id);
