CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- regular students (They won't be able to login to anything)
CREATE TABLE IF NOT EXISTS students (
    student_id VARCHAR(7) PRIMARY KEY,
    email TEXT UNIQUE DEFAULT NULL, -- This and `name` are going to be null by default
    name TEXT DEFAULT NULL, -------------^^^^^^^^^^^^^^^
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Club eboard members and SGA (and probably OSI too)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(7) REFERENCES students(student_id),
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    role VARCHAR(10) NOT NULL DEFAULT 'unapproved', -- 'unapproved', 'club', 'sga', 'admin'
    request_reason TEXT,
    requested_at TIMESTAMPTZ DEFAULT now(),
    password_hash TEXT NOT NULL,
    last_login TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
    name TEXT UNIQUE NOT NULL,
    acronym TEXT UNIQUE,
    governing_board BOOLEAN NOT NULL DEFAULT false,
    logo_filename VARCHAR(64) UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS club_users(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position TEXT NOT NULL,
    user_id UUID REFERENCES users(id),
    club_id UUID REFERENCES clubs(id),
    for_semester UUID REFERENCES semesters(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    club_id UUID REFERENCES clubs(id),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    point_value INT NOT NULL DEFAULT 3,
    starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    ends_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS taps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    semester_id UUID REFERENCES semesters(id),
    student_id VARCHAR(7) REFERENCES students(student_id),
    event_id UUID REFERENCES events(id)
);