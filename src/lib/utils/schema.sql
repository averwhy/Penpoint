CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- regular students (They won't be able to login to anything)
CREATE TABLE IF NOT EXISTS students (
    student_id VARCHAR(7) PRIMARY KEY,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Club eboard members and SGA (and probably OSI too)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(7) REFERENCES students(student_id) NOT NULL,
    email VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(64) NOT NULL,
    role VARCHAR(10) NOT NULL DEFAULT 'unapproved', -- 'inactive', 'unapproved', 'blocked', 'club', 'sga', 'admin'
    pending BOOLEAN NOT NULL DEFAULT FALSE,
    request_reason VARCHAR(1000),
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
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
    for_semester UUID REFERENCES semesters(id) NOT NULL,
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

CREATE TABLE IF NOT EXISTS taps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(7) REFERENCES students(student_id) NOT NULL,
    event_id UUID REFERENCES events(id) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (student_id, event_id)
);

CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);