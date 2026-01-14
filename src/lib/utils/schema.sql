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
    email VARCHAR(64) UNIQUE NOT NULL,
    name VARCHAR(64),
    role VARCHAR(10) NOT NULL DEFAULT 'unapproved', -- 'inactive', 'unapproved', 'blocked', 'club', 'sga', 'admin'
    pending BOOLEAN NOT NULL DEFAULT FALSE,
    request_reason VARCHAR(256),
    requested_at TIMESTAMPTZ DEFAULT now(),
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
    name TEXT UNIQUE NOT NULL,
    acronym VARCHAR(10) UNIQUE,
    bio VARCHAR(512),
    governing_board BOOLEAN NOT NULL DEFAULT false,
    university_office BOOLEAN NOT NULL DEFAULT false,
    image_filename VARCHAR(64),
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
    semester_id UUID REFERENCES semesters(id),
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
    student_id VARCHAR(7) REFERENCES students(student_id),
    event_id UUID REFERENCES events(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS locations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    location VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
)

CREATE UNIQUE INDEX IF NOT EXISTS idx_taps_student_event ON taps(student_id, event_id);
