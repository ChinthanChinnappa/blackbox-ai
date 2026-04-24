-- Black AI Investigation Platform Schema

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'investigator' CHECK (role IN ('admin', 'investigator', 'viewer')),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Investigations table
CREATE TABLE investigations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
  risk_level VARCHAR(20) DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  assigned_to UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Logs table (AI prompt/response logs)
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  investigation_id UUID REFERENCES investigations(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  response TEXT,
  -- EDGE CASE: tag can be null if not yet reviewed
  tag VARCHAR(20) CHECK (tag IN ('safe', 'suspicious', 'critical')),
  anomaly_score FLOAT DEFAULT 0.0,
  flagged_patterns JSONB DEFAULT '[]',
  source_ip VARCHAR(45),
  user_agent TEXT,
  session_id VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Datasets table
CREATE TABLE datasets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  file_type VARCHAR(10) CHECK (file_type IN ('csv', 'json')),
  file_size INTEGER,
  risk_score FLOAT DEFAULT 0.0,
  scan_status VARCHAR(20) DEFAULT 'pending' CHECK (scan_status IN ('pending', 'scanning', 'complete', 'failed')),
  findings JSONB DEFAULT '[]',
  uploaded_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Activity sessions table
CREATE TABLE activity_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  session_token VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  request_count INTEGER DEFAULT 0,
  -- EDGE CASE: anomaly_flags stores raw flags, may contain duplicates
  anomaly_flags JSONB DEFAULT '[]',
  is_flagged BOOLEAN DEFAULT false,
  started_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_logs_investigation ON logs(investigation_id);
CREATE INDEX idx_logs_tag ON logs(tag);
CREATE INDEX idx_logs_created ON logs(created_at DESC);
CREATE INDEX idx_sessions_user ON activity_sessions(user_id);
CREATE INDEX idx_sessions_flagged ON activity_sessions(is_flagged);
