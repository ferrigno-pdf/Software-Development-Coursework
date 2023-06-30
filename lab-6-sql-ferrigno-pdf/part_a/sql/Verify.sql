\i app/actors.sql;

select count(*) from actors;

/* 
count 
-- -
    20
(1 row)
*/

\i app/genres.sql;

select count(*) from genres;

/* 
count 
-- -
    8
(1 row)
*/

\i app/movies_to_actors.sql;
select count(*) from movies_to_actors;
/*
 count 
-------
    62
(1 row)
*/

\i app/movies_to_genres.sql;
select count(*) from movies_to_genres;

/*
 count 
-------
    26
(1 row)
*/

\i app/platforms.sql;
select count(*) from platforms;

/*
 count 
-------
    7
(1 row)
*/

\i app/movies.sql;
select count(*) from movies;

/*
 count 
-------
    26
(1 row)
*/