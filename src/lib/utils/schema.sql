CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(64) NOT NULL,
    role VARCHAR(10) NOT NULL DEFAULT 'student', -- 'inactive', 'student', 'blocked', 'club', 'sga', 'admin'
    expected_graduation_year INT,
    password_hash TEXT,
    last_login TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    password_reset_last_requested_at TIMESTAMPTZ DEFAULT NULL
);

CREATE TABLE IF NOT EXISTS semesters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    starts TIMESTAMPTZ NOT NULL,
    ends TIMESTAMPTZ NOT NULL,
    code VARCHAR(3) NOT NULL, -- E.g. A3 (it's snhu's new semester coding system)
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (starts, ends) -- no two semesters can have the same start and end dates
);

CREATE TABLE IF NOT EXISTS clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) UNIQUE NOT NULL,
    acronym VARCHAR(10) UNIQUE,
    bio VARCHAR(300),
    governing_board BOOLEAN NOT NULL DEFAULT false,
    university_office BOOLEAN NOT NULL DEFAULT false,
    image_filename VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS club_users(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position TEXT NOT NULL,
    user_id UUID REFERENCES users(id) NOT NULL,
    club_id UUID REFERENCES clubs(id) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id) NOT NULL,
    semester_id UUID REFERENCES semesters(id) NOT NULL,
    name VARCHAR(64) NOT NULL,
    location TEXT NOT NULL,
    point_value INT NOT NULL DEFAULT 3,
    image_filename VARCHAR(64) UNIQUE,
    permalink VARCHAR(64) UNIQUE,
    approval_status VARCHAR(16) NOT NULL DEFAULT 'unapproved', -- 'unapproved', 'accepted', 'denied'
    special_requests VARCHAR(1024),
    starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ends_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS wallet_passes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    public_id VARCHAR(10) UNIQUE NOT NULL,
    variant VARCHAR(6) NOT NULL, -- 'apple' or 'google'
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (id, user_id) -- One pass per user (if they get a new one the old one is deleted)
);

CREATE TABLE IF NOT EXISTS scans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_pass_id UUID REFERENCES wallet_passes(id) NOT NULL,
    event_id UUID REFERENCES events(id) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (wallet_pass_id, event_id)
);

CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);