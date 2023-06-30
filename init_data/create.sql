DROP TABLE IF EXISTS users CASCADE;
SELECT pg_sleep(1);
CREATE TABLE users (
    username VARCHAR(50) PRIMARY KEY,
    password CHAR(60) NOT NULL
);