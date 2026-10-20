-- ============================================================
-- CampusHub — College Event Registration & Budget Tracker
-- PostgreSQL Database Setup Script
-- ============================================================
-- Run this file using:
--   psql -U postgres -f schema.sql
-- Or paste it into pgAdmin Query Tool
-- ============================================================

-- ============================================================
-- 1. CREATE DATABASE
-- ============================================================
-- Uncomment the lines below if running from psql as superuser:
-- DROP DATABASE IF EXISTS campushub;
-- CREATE DATABASE campushub;
-- \c campushub;

-- ============================================================
-- 2. DROP EXISTING TABLES (if re-running)
-- ============================================================
DROP TABLE IF EXISTS Attendance CASCADE;
DROP TABLE IF EXISTS Registrations CASCADE;
DROP TABLE IF EXISTS Expenses CASCADE;
DROP TABLE IF EXISTS Sponsors CASCADE;
DROP TABLE IF EXISTS Events CASCADE;
DROP TABLE IF EXISTS Venues CASCADE;
DROP TABLE IF EXISTS Organizers CASCADE;
DROP TABLE IF EXISTS Participants CASCADE;

-- ============================================================
-- 3. TABLE: Venues
-- ============================================================
CREATE TABLE Venues (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    capacity    INT NOT NULL CHECK (capacity > 0),
    image_url   TEXT
);

COMMENT ON TABLE Venues IS 'Stores venue/hall information for events';

-- ============================================================
-- 4. TABLE: Events
-- ============================================================
CREATE TABLE Events (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(255) NOT NULL,
    date        DATE NOT NULL,
    venue_id    INT NOT NULL,
    base_budget DECIMAL(12, 2) DEFAULT 0 CHECK (base_budget >= 0),

    CONSTRAINT fk_events_venue
        FOREIGN KEY (venue_id)
        REFERENCES Venues(id)
        ON UPDATE CASCADE
        ON DELETE RESTRICT
);

CREATE INDEX idx_events_venue ON Events(venue_id);
CREATE INDEX idx_events_date ON Events(date);

COMMENT ON TABLE Events IS 'Stores college event details with FK reference to Venues';

-- ============================================================
-- 5. TABLE: Organizers
-- ============================================================
CREATE TABLE Organizers (
    id      SERIAL PRIMARY KEY,
    name    VARCHAR(255) NOT NULL,
    email   VARCHAR(255) NOT NULL UNIQUE,
    role    VARCHAR(100) NOT NULL
);

COMMENT ON TABLE Organizers IS 'Stores event organizer/faculty details';

-- ============================================================
-- 6. TABLE: Participants
-- ============================================================
CREATE TABLE Participants (
    id              SERIAL PRIMARY KEY,
    name            VARCHAR(255) NOT NULL,
    email           VARCHAR(255) NOT NULL,
    roll_number     VARCHAR(50) NOT NULL UNIQUE
);

CREATE INDEX idx_participants_roll ON Participants(roll_number);

COMMENT ON TABLE Participants IS 'Stores student details. roll_number has UNIQUE constraint';

-- ============================================================
-- 7. TABLE: Registrations (Composite Primary Key)
-- ============================================================
CREATE TABLE Registrations (
    event_id            INT NOT NULL,
    participant_id      INT NOT NULL,
    registration_date   DATE DEFAULT CURRENT_DATE,

    -- Composite Primary Key: prevents duplicate registrations
    CONSTRAINT pk_registrations
        PRIMARY KEY (event_id, participant_id),

    CONSTRAINT fk_registrations_event
        FOREIGN KEY (event_id)
        REFERENCES Events(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_registrations_participant
        FOREIGN KEY (participant_id)
        REFERENCES Participants(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_registrations_event ON Registrations(event_id);
CREATE INDEX idx_registrations_participant ON Registrations(participant_id);

COMMENT ON TABLE Registrations IS 'Junction table with Composite PK (event_id, participant_id) to prevent duplicate registrations';

-- ============================================================
-- 8. TABLE: Attendance
-- ============================================================
CREATE TABLE Attendance (
    event_id        INT NOT NULL,
    participant_id  INT NOT NULL,
    check_in_time   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT pk_attendance
        PRIMARY KEY (event_id, participant_id),

    CONSTRAINT fk_attendance_event
        FOREIGN KEY (event_id)
        REFERENCES Events(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_attendance_participant
        FOREIGN KEY (participant_id)
        REFERENCES Participants(id)
        ON DELETE CASCADE
);

COMMENT ON TABLE Attendance IS 'Tracks check-in for registered participants';

-- ============================================================
-- 9. TABLE: Sponsors
-- ============================================================
CREATE TABLE Sponsors (
    id                  SERIAL PRIMARY KEY,
    event_id            INT NOT NULL,
    sponsor_name        VARCHAR(255) NOT NULL,
    amount_contributed  DECIMAL(12, 2) NOT NULL CHECK (amount_contributed > 0),

    CONSTRAINT fk_sponsors_event
        FOREIGN KEY (event_id)
        REFERENCES Events(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_sponsors_event ON Sponsors(event_id);

COMMENT ON TABLE Sponsors IS 'Stores sponsorship income per event';

-- ============================================================
-- 10. TABLE: Expenses
-- ============================================================
CREATE TABLE Expenses (
    id          SERIAL PRIMARY KEY,
    event_id    INT NOT NULL,
    budget_head VARCHAR(100) NOT NULL,
    amount      DECIMAL(12, 2) NOT NULL CHECK (amount > 0),
    description TEXT,

    CONSTRAINT fk_expenses_event
        FOREIGN KEY (event_id)
        REFERENCES Events(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_expenses_event ON Expenses(event_id);
CREATE INDEX idx_expenses_budget_head ON Expenses(budget_head);

COMMENT ON TABLE Expenses IS 'Stores expenses categorized by budget_head per event';


-- ============================================================
-- 11. INSERT SAMPLE DATA
-- ============================================================

-- Venues (5 records)
INSERT INTO Venues (name, capacity, image_url) VALUES
    ('Sankalp Ground',    1500, '/venues/sankalp_ground.jpg'),
    ('Galaxy Auditorium', 200,  '/venues/galaxy_auditorium.jpg'),
    ('Indoor Stadium',    600,  '/venues/indoor_stadium.jpg'),
    ('Cineplix',          300,  '/venues/cineplix.jpg'),
    ('Octagon Library',   250,  '/venues/octagon_library.jpg');

-- Events (3 records)
INSERT INTO Events (name, date, venue_id, base_budget) VALUES
    ('Sankalp 2026',      '2026-11-26', 1, 3000000.00),
    ('Cultural Night',    '2026-11-20', 2, 30000.00),
    ('HactoberFest 2026', '2026-12-05', 3, 40000.00);

-- Organizers (5 records)
INSERT INTO Organizers (name, email, role) VALUES
    ('Rahul Sarkar',      'rahul.sarkar@college.edu',      'Faculty Coordinator'),
    ('Subasish Rauta',    'subasish.rauta@college.edu',    'President'),
    ('Asutosh Mahapatra', 'asutosh.mahapatra@college.edu', 'Treasurer'),
    ('Dipten Sharma',      'dipten.sharma@college.edu',      'Event Head'),
    ('S Nitesh Kumar',       'nitesh.kumar@college.edu',       'Logistics Lead');

-- Participants (65 records - Official 2026 Roster)
INSERT INTO Participants (name, email, roll_number) VALUES
    ('Aditya Gouda', 'aditya.gouda@student.edu', '202556171'),
    ('Mayank Kumar', 'mayank.kumar@student.edu', '202556177'),
    ('N Bhagyalaxmi Reddy', 'n.bhagyalaxmi.reddy@student.edu', '202557179'),
    ('Shreyasha Mishra', 'shreyasha.mishra@student.edu', '202556180'),
    ('Sreeyanshu Dash', 'sreeyanshu.dash@student.edu', '202556183'),
    ('Hansika Kotni', 'hansika.kotni@student.edu', '202557184'),
    ('Subhankar Padhy', 'subhankar.padhy@student.edu', '202556187'),
    ('Siddharth Sahoo', 'siddharth.sahoo@student.edu', '202556189'),
    ('Prince Kumar', 'prince.kumar@student.edu', '202556190'),
    ('Om Kumar Nayak', 'om.kumar.nayak@student.edu', '202556191'),
    ('Manisha Panigrahi', 'manisha.panigrahi@student.edu', '202557193'),
    ('Suvam Sahoo', 'suvam.sahoo@student.edu', '202556194'),
    ('Sparsh Chauhan', 'sparsh.chauhan@student.edu', '202556195'),
    ('Nandhika Jyothi Swaroop Reddy', 'nandhika.jyothi.swaroop.reddy@student.edu', '202556203'),
    ('Hari Shankar Sahu', 'hari.shankar.sahu@student.edu', '202556206'),
    ('K Harish Kumar', 'k.harish.kumar@student.edu', '202556207'),
    ('Diptee Ranjan Nahak', 'diptee.ranjan.nahak@student.edu', '202556209'),
    ('Ashirbad Panda', 'ashirbad.panda@student.edu', '202556211'),
    ('Shaharsh', 'shaharsh@student.edu', '202556214'),
    ('Smrutisudha Sahu', 'smrutisudha.sahu@student.edu', '202557215'),
    ('Aryan Kumar Sahu', 'aryan.kumar.sahu@student.edu', '202556219'),
    ('Sonam Patro', 'sonam.patro@student.edu', '202557223'),
    ('B. Sridhar Achary', 'b.sridhar.achary@student.edu', '202556225'),
    ('A Rajasekhar Patra', 'a.rajasekhar.patra@student.edu', '202556227'),
    ('Prathamesh Purohit', 'prathamesh.purohit@student.edu', '202556231'),
    ('Pranab Gouda', 'pranab.gouda@student.edu', '202556235'),
    ('Rudra Prasad Panigrahi', 'rudra.prasad.panigrahi@student.edu', '202556236'),
    ('Ayush Mahapatra', 'ayush.mahapatra@student.edu', '202556241'),
    ('Pratyus Nayak', 'pratyus.nayak@student.edu', '202556243'),
    ('Chokkala Yaswanth', 'chokkala.yaswanth@student.edu', '202556247'),
    ('Omkar Swain', 'omkar.swain@student.edu', '202556248'),
    ('Yuvraj Azad', 'yuvraj.azad@student.edu', '202556249'),
    ('Priyansha Pradhan', 'priyansha.pradhan@student.edu', '202557250'),
    ('Asutosh Mishra', 'asutosh.mishra@student.edu', '202556259'),
    ('Rudra Prasad Sahu', 'rudra.prasad.sahu@student.edu', '202556260'),
    ('Kunal Panda', 'kunal.panda@student.edu', '202556261'),
    ('Samir Kumar Pradhan', 'samir.kumar.pradhan@student.edu', '202556263'),
    ('J Kartik Achary', 'j.kartik.achary@student.edu', '202556265'),
    ('Soumyaranjan Susant Mohapatra', 'soumyaranjan.susant.mohapatra@student.edu', '202556267'),
    ('G Charan Kumar', 'g.charan.kumar@student.edu', '202556271'),
    ('Akash Panigrahy', 'akash.panigrahy@student.edu', '202556272'),
    ('Subasish Rauta', 'subasish.rauta@student.edu', '202556275'),
    ('Achintya Prasad Mishra', 'achintya.prasad.mishra@student.edu', '202556276'),
    ('Neyyila Puspak', 'neyyila.puspak@student.edu', '202556278'),
    ('Bijan Kumar Pattanayak', 'bijan.kumar.pattanayak@student.edu', '202556282'),
    ('Bishnu Kumar Sahu', 'bishnu.kumar.sahu@student.edu', '202556284'),
    ('Madhusmita Panigrahy', 'madhusmita.panigrahy@student.edu', '202557285'),
    ('Ullasi Abhinash Reddy', 'ullasi.abhinash.reddy@student.edu', '202556286'),
    ('Swadhina Sahu', 'swadhina.sahu@student.edu', '202556288'),
    ('Shahid Hussain', 'shahid.hussain@student.edu', '202556289'),
    ('M Mathur Kesav', 'm.mathur.kesav@student.edu', '202556290'),
    ('Rudra Prasad Parida', 'rudra.prasad.parida@student.edu', '202556292'),
    ('Asutosh Mahapatra', 'asutosh.mahapatra@student.edu', '202556293'),
    ('Souransita Padhy', 'souransita.padhy@student.edu', '202557294'),
    ('Dipten Sharma', 'dipten.sharma@student.edu', '202556295'),
    ('S Nitesh Kumar', 's.nitesh.kumar@student.edu', '202556296'),
    ('Deepak Kumar Nayak', 'deepak.kumar.nayak@student.edu', '202556297'),
    ('Ganeswar Bisoyi', 'ganeswar.bisoyi@student.edu', '202556298'),
    ('Subham Kumar Gouda', 'subham.kumar.gouda@student.edu', '202556301'),
    ('Sickon Behera', 'sickon.behera@student.edu', '202556304'),
    ('Ayushman Swain', 'ayushman.swain@student.edu', '202556307'),
    ('Arpita Padhy', 'arpita.padhy@student.edu', '202557313'),
    ('Debasis Nahak', 'debasis.nahak@student.edu', '202556316'),
    ('N Tetendra Reddy', 'n.tetendra.reddy@student.edu', '202556319'),
    ('K Madhu Mohan Rao', 'k.madhu.mohan.rao@student.edu', '202556320');

-- Registrations (110 records)
INSERT INTO Registrations (event_id, participant_id, registration_date) VALUES
    (1, 1, '2026-10-18'),
    (1, 2, '2026-10-18'),
    (1, 3, '2026-10-18'),
    (1, 4, '2026-10-18'),
    (1, 5, '2026-10-18'),
    (1, 6, '2026-10-18'),
    (1, 7, '2026-10-18'),
    (1, 8, '2026-10-18'),
    (1, 9, '2026-10-18'),
    (1, 10, '2026-10-18'),
    (1, 11, '2026-10-18'),
    (1, 12, '2026-10-18'),
    (1, 13, '2026-10-18'),
    (1, 14, '2026-10-18'),
    (1, 15, '2026-10-18'),
    (1, 16, '2026-10-18'),
    (1, 17, '2026-10-18'),
    (1, 18, '2026-10-18'),
    (1, 19, '2026-10-18'),
    (1, 20, '2026-10-18'),
    (1, 21, '2026-10-18'),
    (1, 22, '2026-10-18'),
    (1, 23, '2026-10-18'),
    (1, 24, '2026-10-18'),
    (1, 25, '2026-10-18'),
    (1, 26, '2026-10-18'),
    (1, 27, '2026-10-18'),
    (1, 28, '2026-10-18'),
    (1, 29, '2026-10-18'),
    (1, 30, '2026-10-18'),
    (1, 31, '2026-10-18'),
    (1, 32, '2026-10-18'),
    (1, 33, '2026-10-18'),
    (1, 34, '2026-10-18'),
    (1, 35, '2026-10-18'),
    (1, 36, '2026-10-18'),
    (1, 37, '2026-10-18'),
    (1, 38, '2026-10-18'),
    (1, 39, '2026-10-18'),
    (1, 40, '2026-10-18'),
    (1, 41, '2026-10-18'),
    (1, 42, '2026-10-18'),
    (1, 43, '2026-10-18'),
    (1, 44, '2026-10-18'),
    (1, 45, '2026-10-18'),
    (1, 46, '2026-10-18'),
    (1, 47, '2026-10-18'),
    (1, 48, '2026-10-18'),
    (1, 49, '2026-10-18'),
    (1, 50, '2026-10-18'),
    (1, 51, '2026-10-18'),
    (1, 52, '2026-10-18'),
    (1, 53, '2026-10-18'),
    (1, 54, '2026-10-18'),
    (1, 55, '2026-10-18'),
    (1, 56, '2026-10-18'),
    (1, 57, '2026-10-18'),
    (1, 58, '2026-10-18'),
    (1, 59, '2026-10-18'),
    (1, 60, '2026-10-18'),
    (1, 61, '2026-10-18'),
    (1, 62, '2026-10-18'),
    (1, 63, '2026-10-18'),
    (1, 64, '2026-10-18'),
    (1, 65, '2026-10-18'),
    (2, 1, '2026-10-17'),
    (2, 2, '2026-10-17'),
    (2, 3, '2026-10-17'),
    (2, 4, '2026-10-17'),
    (2, 5, '2026-10-17'),
    (2, 6, '2026-10-17'),
    (2, 7, '2026-10-17'),
    (2, 8, '2026-10-17'),
    (2, 9, '2026-10-17'),
    (2, 10, '2026-10-17'),
    (2, 11, '2026-10-17'),
    (2, 12, '2026-10-17'),
    (2, 13, '2026-10-17'),
    (2, 14, '2026-10-17'),
    (2, 15, '2026-10-17'),
    (2, 16, '2026-10-17'),
    (2, 17, '2026-10-17'),
    (2, 18, '2026-10-17'),
    (2, 19, '2026-10-17'),
    (2, 20, '2026-10-17'),
    (2, 21, '2026-10-17'),
    (2, 22, '2026-10-17'),
    (2, 23, '2026-10-17'),
    (2, 24, '2026-10-17'),
    (2, 25, '2026-10-17'),
    (3, 21, '2026-10-17'),
    (3, 22, '2026-10-17'),
    (3, 23, '2026-10-17'),
    (3, 24, '2026-10-17'),
    (3, 25, '2026-10-17'),
    (3, 26, '2026-10-17'),
    (3, 27, '2026-10-17'),
    (3, 28, '2026-10-17'),
    (3, 29, '2026-10-17'),
    (3, 30, '2026-10-17'),
    (3, 31, '2026-10-17'),
    (3, 32, '2026-10-17'),
    (3, 33, '2026-10-17'),
    (3, 34, '2026-10-17'),
    (3, 35, '2026-10-17'),
    (3, 36, '2026-10-17'),
    (3, 37, '2026-10-17'),
    (3, 38, '2026-10-17'),
    (3, 39, '2026-10-17'),
    (3, 40, '2026-10-17');

-- Attendance (58 records)
INSERT INTO Attendance (event_id, participant_id, check_in_time) VALUES
    (1, 1, '2026-10-19 03:30:00'),
    (1, 2, '2026-10-19 04:37:00'),
    (1, 3, '2026-10-19 05:44:00'),
    (1, 4, '2026-10-19 06:51:00'),
    (1, 5, '2026-10-19 07:58:00'),
    (1, 6, '2026-10-19 09:05:00'),
    (1, 7, '2026-10-19 04:12:00'),
    (1, 8, '2026-10-19 05:19:00'),
    (1, 9, '2026-10-19 06:26:00'),
    (1, 10, '2026-10-19 06:33:00'),
    (1, 11, '2026-10-19 07:40:00'),
    (1, 12, '2026-10-19 08:47:00'),
    (1, 13, '2026-10-19 03:54:00'),
    (1, 14, '2026-10-19 05:01:00'),
    (1, 15, '2026-10-19 06:08:00'),
    (1, 16, '2026-10-19 07:15:00'),
    (1, 17, '2026-10-19 08:22:00'),
    (1, 18, '2026-10-19 09:29:00'),
    (1, 19, '2026-10-19 03:36:00'),
    (1, 20, '2026-10-19 04:43:00'),
    (1, 21, '2026-10-19 05:50:00'),
    (1, 22, '2026-10-19 06:57:00'),
    (1, 23, '2026-10-19 08:04:00'),
    (1, 24, '2026-10-19 09:11:00'),
    (1, 25, '2026-10-19 04:18:00'),
    (1, 26, '2026-10-19 05:25:00'),
    (1, 27, '2026-10-19 05:32:00'),
    (1, 28, '2026-10-19 06:39:00'),
    (1, 29, '2026-10-19 07:46:00'),
    (1, 30, '2026-10-19 08:53:00'),
    (1, 31, '2026-10-19 04:00:00'),
    (1, 32, '2026-10-19 05:07:00'),
    (1, 33, '2026-10-19 06:14:00'),
    (1, 34, '2026-10-19 07:21:00'),
    (1, 35, '2026-10-19 08:28:00'),
    (1, 36, '2026-10-19 08:35:00'),
    (1, 37, '2026-10-19 03:42:00'),
    (1, 38, '2026-10-19 04:49:00'),
    (1, 39, '2026-10-19 05:56:00'),
    (1, 40, '2026-10-19 07:03:00'),
    (1, 41, '2026-10-19 08:10:00'),
    (1, 42, '2026-10-19 09:17:00'),
    (2, 1, '2026-10-18 12:30:00'),
    (2, 2, '2026-10-18 12:33:00'),
    (2, 3, '2026-10-18 12:36:00'),
    (2, 4, '2026-10-18 12:39:00'),
    (2, 5, '2026-10-18 12:42:00'),
    (2, 6, '2026-10-18 12:45:00'),
    (2, 7, '2026-10-18 12:48:00'),
    (2, 8, '2026-10-18 12:51:00'),
    (2, 9, '2026-10-18 12:54:00'),
    (2, 10, '2026-10-18 12:57:00'),
    (2, 11, '2026-10-18 13:00:00'),
    (2, 12, '2026-10-18 13:03:00'),
    (2, 13, '2026-10-18 13:06:00'),
    (2, 14, '2026-10-18 13:09:00'),
    (2, 15, '2026-10-18 13:12:00'),
    (2, 16, '2026-10-18 13:15:00');

-- Sponsors (5 records)
INSERT INTO Sponsors (event_id, sponsor_name, amount_contributed) VALUES
    (1, 'TCS',       25000.00),
    (1, 'Infosys',   15000.00),
    (2, 'Coca-Cola', 10000.00),
    (2, 'Red Bull',   8000.00),
    (3, 'Google',    50000.00);

-- Expenses (9 records)
INSERT INTO Expenses (event_id, budget_head, amount, description) VALUES
    (1, 'Marketing',  8000.00,  'Social media ads and posters'),
    (1, 'Food',       12000.00, 'Catering for 200 attendees'),
    (1, 'Logistics',  5000.00,  'Stage setup and sound system'),
    (1, 'Prizes',     15000.00, 'Winner and runner-up prizes'),
    (2, 'Food',       8000.00,  'Snacks and beverages'),
    (2, 'Decoration', 6000.00,  'Stage decoration and lights'),
    (2, 'Marketing',  3000.00,  'Event banners and flyers'),
    (3, 'Food',       10000.00, 'Meals for 48-hour hackathon'),
    (3, 'Logistics',  7000.00,  'Wi-Fi setup and power strips');


-- ============================================================
-- 12. VIEWS FOR REPORTS (SQL Analytics)
-- ============================================================

-- VIEW 1: Attendance Report (JOINs + GROUP BY)
CREATE OR REPLACE VIEW vw_attendance_report AS
SELECT
    e.id AS event_id,
    e.name AS event_name,
    e.date AS event_date,
    v.name AS venue_name,
    v.capacity AS venue_capacity,
    COUNT(DISTINCT r.participant_id) AS total_registrations,
    COUNT(DISTINCT a.participant_id) AS total_attendance,
    ROUND(
        COUNT(DISTINCT a.participant_id) * 100.0 /
        NULLIF(COUNT(DISTINCT r.participant_id), 0),
        1
    ) AS attendance_pct,
    ROUND(
        COUNT(DISTINCT r.participant_id) * 100.0 /
        NULLIF(v.capacity, 0),
        1
    ) AS venue_fill_pct
FROM Events e
JOIN Venues v ON e.venue_id = v.id
LEFT JOIN Registrations r ON e.id = r.event_id
LEFT JOIN Attendance a ON e.id = a.event_id
GROUP BY e.id, e.name, e.date, v.name, v.capacity
ORDER BY e.date;

COMMENT ON VIEW vw_attendance_report IS 'Report: Event attendance with venue capacity utilization';


-- VIEW 2: Financial Summary (Aggregates + Math)
CREATE OR REPLACE VIEW vw_financial_summary AS
SELECT
    e.id AS event_id,
    e.name AS event_name,
    e.base_budget,
    COALESCE(s_totals.total_sponsorship, 0) AS total_sponsorship,
    (e.base_budget + COALESCE(s_totals.total_sponsorship, 0)) AS total_budget,
    COALESCE(ex_totals.total_expenses, 0) AS total_expenses,
    (e.base_budget + COALESCE(s_totals.total_sponsorship, 0)
        - COALESCE(ex_totals.total_expenses, 0)) AS remaining_budget
FROM Events e
LEFT JOIN (
    SELECT event_id, SUM(amount_contributed) AS total_sponsorship
    FROM Sponsors
    GROUP BY event_id
) s_totals ON e.id = s_totals.event_id
LEFT JOIN (
    SELECT event_id, SUM(amount) AS total_expenses
    FROM Expenses
    GROUP BY event_id
) ex_totals ON e.id = ex_totals.event_id
ORDER BY e.name;

COMMENT ON VIEW vw_financial_summary IS 'Report: Per-event budget breakdown (base + sponsors - expenses)';


-- VIEW 3: Expense by Category (GROUP BY budget_head)
CREATE OR REPLACE VIEW vw_expense_by_category AS
SELECT
    budget_head,
    SUM(amount) AS total_amount,
    COUNT(*) AS transaction_count,
    ROUND(
        SUM(amount) * 100.0 /
        NULLIF((SELECT SUM(amount) FROM Expenses), 0),
        1
    ) AS percentage_of_total
FROM Expenses
GROUP BY budget_head
ORDER BY total_amount DESC;

COMMENT ON VIEW vw_expense_by_category IS 'Report: Total spending grouped by budget_head category';


-- VIEW 4: Registered Participants per Event (detailed JOIN)
CREATE OR REPLACE VIEW vw_event_participants AS
SELECT
    e.id AS event_id,
    e.name AS event_name,
    p.id AS participant_id,
    p.name AS participant_name,
    p.email AS participant_email,
    p.roll_number,
    r.registration_date,
    CASE WHEN a.check_in_time IS NOT NULL THEN TRUE ELSE FALSE END AS checked_in,
    a.check_in_time
FROM Events e
JOIN Registrations r ON e.id = r.event_id
JOIN Participants p ON r.participant_id = p.id
LEFT JOIN Attendance a ON a.event_id = r.event_id AND a.participant_id = r.participant_id
ORDER BY e.name, p.name;

COMMENT ON VIEW vw_event_participants IS 'Detailed view: all participants per event with check-in status';


-- ============================================================
-- 13. USEFUL QUERIES (for reference/grading)
-- ============================================================

-- Query: Test composite PK violation (should fail)
-- INSERT INTO Registrations (event_id, participant_id) VALUES (1, 1);
-- ERROR: duplicate key value violates unique constraint "pk_registrations"

-- Query: Test UNIQUE constraint on roll_number (should fail)
-- INSERT INTO Participants (name, email, roll_number) VALUES ('Test', 'test@test.com', 'CS2024001');
-- ERROR: duplicate key value violates unique constraint "participants_roll_number_key"

-- Query: Test FK constraint (should fail)
-- INSERT INTO Events (name, date, venue_id, base_budget) VALUES ('Test', '2026-01-01', 999, 0);
-- ERROR: insert or update on table "events" violates foreign key constraint "fk_events_venue"

-- Query: Dashboard stats
-- SELECT
--     (SELECT COUNT(*) FROM Events) AS total_events,
--     (SELECT COUNT(DISTINCT participant_id) FROM Registrations) AS unique_participants,
--     (SELECT COALESCE(SUM(amount_contributed), 0) FROM Sponsors) AS total_sponsorship,
--     (SELECT COALESCE(SUM(amount), 0) FROM Expenses) AS total_expenses;

-- Query: Run the views
-- SELECT * FROM vw_attendance_report;
-- SELECT * FROM vw_financial_summary;
-- SELECT * FROM vw_expense_by_category;
-- SELECT * FROM vw_event_participants;


-- ============================================================
-- DONE! Database schema created with all tables, constraints,
-- sample data, and report views.
-- ============================================================
