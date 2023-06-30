CREATE TABLE IF NOT EXISTS movies (
    movie_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    duration INTEGER NOT NULL,
    year_of_release INTEGER NOT NULL,
    gross_revenue INTEGER,
    country VARCHAR(50),
    language VARCHAR(50),
    IMBD_rating FLOAT,
    platform_id INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS actors (
    actor_id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    agency VARCHAR(50),
    active_since INTEGER,
    location VARCHAR(30)
);

CREATE TABLE IF NOT EXISTS platforms (
    platform_id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL,
    viewership_cost INTEGER
);

CREATE TABLE IF NOT EXISTS genres (
    genre_id SERIAL PRIMARY KEY,
    name VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS movies_to_actors (
    movie_id INTEGER,
    actor_id INTEGER
);

CREATE TABLE IF NOT EXISTS movies_to_genres (
    genre_id INTEGER,
    movie_id INTEGER
);
