-- For this test data, we won't be creating any users (accounts)

-- This is assuming that this test data is put it during semester A3 (Sept 2025-Dec 2025)
INSERT INTO semesters(id, starts, ends, code) VALUES ('76027209-00c4-4069-87ad-dc98641a8ef6', '2025-7-1T00:00:00.000Z', '2025-12-20T00:00:00.000Z', 'A3');
INSERT INTO semesters(id, starts, ends, code) VALUES ('a7da93ce-a3bc-46da-ace2-9798be34b26e', '2026-1-5T00:00:00.000Z', '2025-4-25T00:00:00.000Z', 'A1');

INSERT INTO students(student_id, name) VALUES ('1111111', 'Joe');
INSERT INTO students(student_id, name) VALUES ('2222222', 'Mary');
INSERT INTO students(student_id, name) VALUES ('3333333', 'Steven');
INSERT INTO students(student_id, name) VALUES ('4444444', 'Paul');
INSERT INTO students(student_id, name) VALUES ('5555555', 'Sarah');
INSERT INTO students(student_id, name) VALUES ('6666666', 'Colin');
INSERT INTO students(student_id, name) VALUES ('7777777', 'Debbie');
INSERT INTO students(student_id, name) VALUES ('8888888', 'Nick');
INSERT INTO students(student_id, name) VALUES ('9999999', 'Lisa');

INSERT INTO clubs(id, name, acronym, governing_board) VALUES ('5f92e1a1-5be4-4cc3-8c96-0ff12dbf6e5a', 'Student Government Association', 'SGA', true);
INSERT INTO clubs(id, name, acronym, governing_board) VALUES ('7ae20177-358d-43bc-8666-999973fe7424', 'Penmen Press', '', false);
INSERT INTO clubs(id, name, acronym, governing_board) VALUES ('c518dacc-3bbe-4c52-bebe-9bdb409cd01c', 'Coordinators of Activies, Programs and Events', 'CAPE', true);

-- 2 SGA events
INSERT INTO events(club_id, name, location, starts_at, ends_at) VALUES ('5f92e1a1-5be4-4cc3-8c96-0ff12dbf6e5a', 'Campus Conversations', 'Green Space', '2025-11-5T12:00:00.000Z', '2025-11-5T15:00:00.000Z');
INSERT INTO events(club_id, name, location, starts_at, ends_at) VALUES ('5f92e1a1-5be4-4cc3-8c96-0ff12dbf6e5a', 'Celebration of Light', 'Green Space', '2025-12-10T16:30:00.000Z', '2025-12-10T19:00:00.000Z');

-- 2 Penmen Press events
INSERT INTO events(club_id, name, location, starts_at, ends_at) VALUES ('7ae20177-358d-43bc-8666-999973fe7424', 'Trivia with Press', 'Last Chapter Pub', '2025-11-7T12:00:00.000Z', '2025-11-7T15:00:00.000Z');
INSERT INTO events(club_id, name, location, starts_at, ends_at) VALUES ('7ae20177-358d-43bc-8666-999973fe7424', 'SNHU Book Fair', 'Wolak Library Learning Commons', '2025-12-10T12:00:00.000Z', '2025-12-12T14:00:00.000Z');

-- 2 CAPE events
INSERT INTO events(club_id, name, location, starts_at, ends_at) VALUES ('c518dacc-3bbe-4c52-bebe-9bdb409cd01c', 'Big Money Bingo', 'Upper Dining Hall', '2025-11-12T19:00:00.000Z', '2025-11-12T21:00:00.000Z');
INSERT INTO events(club_id, name, location, starts_at, ends_at) VALUES ('c518dacc-3bbe-4c52-bebe-9bdb409cd01c', 'Stuff A Plush', 'Commuter Lounge', '2025-12-17T10:00:00.000Z', '2025-12-17T13:00:00.000Z');

-- 2 Past events
INSERT INTO events(id, club_id, semester_id, name, location, starts_at, ends_at) VALUES ('5bbe52e8-1759-4b5c-b118-a78e06ed8948', 'c518dacc-3bbe-4c52-bebe-9bdb409cd01c', '76027209-00c4-4069-87ad-dc98641a8ef6', 'Late Night Breakfast', 'Dining Hall', '2025-10-7T18:00:00.000Z', '2025-10-7T21:00:00.000Z');
INSERT INTO events(club_id, semester_id, name, location, starts_at, ends_at) VALUES ('7ae20177-358d-43bc-8666-999973fe7424', '76027209-00c4-4069-87ad-dc98641a8ef6', 'Stuff A Plush', 'Commuter Lounge', '2025-9-14T10:00:00.000Z', '2025-9-14T13:00:00.000Z');

-- Taps
INSERT INTO taps(student_id, event_id) VALUES ('1111111', '5bbe52e8-1759-4b5c-b118-a78e06ed8948');
INSERT INTO taps(student_id, event_id) VALUES ('2222222', '5bbe52e8-1759-4b5c-b118-a78e06ed8948');
INSERT INTO taps(student_id, event_id) VALUES ('3333333', '5bbe52e8-1759-4b5c-b118-a78e06ed8948');
INSERT INTO taps(student_id, event_id) VALUES ('4444444', '5bbe52e8-1759-4b5c-b118-a78e06ed8948');