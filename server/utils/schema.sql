CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
-- Club eboard members and SGA
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
    student_id VARCHAR(7) NOT NULL;
    email TEXT NOT NULL;
    name TEXT NOT NULL;
    password_hash TEXT NOT NULL;
    is_active BOOLEAN NOT NULL DEFAULT true;
    is_verified BOOLEAN NOT NULL DEFAULT false;
    refresh_token TEXT NOT NULL;
    last_login TIMESTAMPTZ NOT NULL DEFAULT now();
    created_at TIMESTAMPTZ NOT NULL DEFAULT now();
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
);

CREATE TABLE students (
    student_id VARCHAR(7) PRIMARY KEY;
    email TEXT;
    name TEXT;
    created_at TIMESTAMPTZ NOT NULL DEFAULT now();
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
)

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
    name TEXT NOT NULL;
    location TEXT NOT NULL;
    
)

CREATE TABLE taps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4();
    event_id
)