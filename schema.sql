-- Create tables
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_name TEXT NOT NULL,
  last_message TEXT,
  last_message_time TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sender TEXT NOT NULL CHECK (sender IN ('user', 'bot')),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id)
);

-- Create security logs table
CREATE TABLE IF NOT EXISTS security_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level TEXT NOT NULL CHECK (level IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'SECURITY')),
  message TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  details JSONB,
  ip TEXT,
  user_agent TEXT
);

-- Create function to update conversation's updated_at
CREATE OR REPLACE FUNCTION update_conversation_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE conversations
  SET updated_at = NOW()
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for messages
CREATE TRIGGER update_conversation_timestamp
  AFTER INSERT ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_updated_at();

-- Create function to get dashboard stats
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS TABLE (
  total_conversations BIGINT,
  unique_clients BIGINT,
  last_conversation_time TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_conversations,
    COUNT(DISTINCT client_name)::BIGINT as unique_clients,
    MAX(updated_at) as last_conversation_time
  FROM conversations;
END;
$$ LANGUAGE plpgsql;

-- Create function to initialize security logs table
CREATE OR REPLACE FUNCTION create_security_logs_table()
RETURNS void AS $$
BEGIN
  -- Create table if not exists
  CREATE TABLE IF NOT EXISTS security_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level TEXT NOT NULL CHECK (level IN ('DEBUG', 'INFO', 'WARN', 'ERROR', 'SECURITY')),
    message TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    details JSONB,
    ip TEXT,
    user_agent TEXT
  );

  -- Enable RLS
  ALTER TABLE security_logs ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON security_logs;
  DROP POLICY IF EXISTS "Enable insert for authenticated users" ON security_logs;

  -- Create policies
  CREATE POLICY "Enable read access for authenticated users" ON security_logs
    FOR SELECT TO authenticated
    USING (true);

  CREATE POLICY "Enable insert for authenticated users" ON security_logs
    FOR INSERT TO authenticated
    WITH CHECK (true);

  -- Create indexes if they don't exist
  CREATE INDEX IF NOT EXISTS idx_security_logs_timestamp ON security_logs(timestamp);
  CREATE INDEX IF NOT EXISTS idx_security_logs_level ON security_logs(level);
  CREATE INDEX IF NOT EXISTS idx_security_logs_user_id ON security_logs(user_id);
END;
$$ LANGUAGE plpgsql;

-- Execute the function
SELECT create_security_logs_table();

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON conversations;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON messages;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON insights;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON insights;

-- Create more restrictive policies
CREATE POLICY "Users can only read their own conversations" ON conversations
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can only read messages from their conversations" ON messages
    FOR SELECT TO authenticated
    USING (EXISTS (
        SELECT 1 FROM conversations
        WHERE conversations.id = messages.conversation_id
        AND conversations.user_id = auth.uid()
    ));

CREATE POLICY "Users can only read their own insights" ON insights
    FOR SELECT TO authenticated
    USING (user_id = auth.uid());

CREATE POLICY "Users can only insert their own insights" ON insights
    FOR INSERT TO authenticated
    WITH CHECK (user_id = auth.uid());

-- Add user_id to insights table if not exists
ALTER TABLE insights ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id); 