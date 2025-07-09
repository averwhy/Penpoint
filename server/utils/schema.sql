CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- regular students (They won't be able to login to anything)
CREATE TABLE students (
    student_id VARCHAR(7) PRIMARY KEY,
    email TEXT UNIQUE DEFAULT NULL, -- This and `name` are going to be null by default
    name TEXT DEFAULT NULL, -------------^^^^^^^^^^^^^^^
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Club eboard members and SGA 
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id VARCHAR(7) REFERENCES students(student_id), -- Should/Will match students table
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    refresh_token TEXT,
    last_login TIMESTAMPTZ NOT NULL DEFAULT now(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE admins (
    id UUID PRIMARY KEY REFERENCES users(id),
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE semesters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    starts TIMESTAMPTZ NOT NULL,
    ends TIMESTAMPTZ NOT NULL,
    code VARCHAR(3) NOT NULL -- E.g. A3 (it's snhu's new semester coding system, used to be like FADAY23)
);

CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    acronym TEXT UNIQUE NOT NULL,
    governing_board BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE club_users(
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    position TEXT NOT NULL,
    user_id UUID REFERENCES users(id),
    club_id UUID REFERENCES clubs(id),
    for_semester UUID REFERENCES semesters(id)
);

CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    location TEXT NOT NULL
    
);

CREATE TABLE taps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    semester_id UUID REFERENCES semesters(id),
    student_id VARCHAR(7) REFERENCES students(student_id),
    event_id UUID REFERENCES events(id)
);