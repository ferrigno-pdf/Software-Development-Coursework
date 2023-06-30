-- Query 1

SELECT * FROM movies ORDER BY IMBD_rating DESC LIMIT 1;
/*
  7 | Secret Honor |        4 |            1996 |        690973 | Poland  | Lithuanian |         10 |           1
*/

-- Query 2
SELECT movies.name
FROM movies
JOIN movies_to_actors ON movies.movie_id = movies_to_actors.movie_id
JOIN actors ON movies_to_actors.actor_id = actors.actor_id
WHERE actors.name = 'Leonardo di Caprio';

/*
   name                   
-----------------------------------------
 Midsummer Night's Sex Comedy, A
 Secret Honor
 Ballad of a Soldier (Ballada o soldate)
 Satan's Tango (Sátántangó)
 Miracle
 Smoke Signals
 Shutter Island
(7 rows)
*/

-- Query 3
SELECT * FROM movies ORDER BY year_of_release ASC LIMIT 3;

/*
 movie_id |                 name                  | duration | year_of_release | gross_revenue | country |         language          | imbd_rat
ing | platform_id 
----------+---------------------------------------+----------+-----------------+---------------+---------+---------------------------+---------
----+-------------
       21 | Mammy                                 |        1 |            1988 |        938708 | Peru    | New Zealand Sign Language |         
2.9 |           7
       11 | Angus                                 |        3 |            1991 |        439725 | China   | Estonian                  |         
8.5 |           7
        9 | Miguel and William (Miguel y William) |        2 |            1992 |        286501 | Poland  | Quechua                   |         
3.9 |           3
(3 rows)
*/

-- Query 4

SELECT * FROM movies WHERE platform_id = (
    SELECT platform_id FROM platforms WHERE name = 'Hulu'
);

/*
movie_id |                             name                              | duration | year_of_release | gross_revenue |  country  |  language  | imbd_rating | platform_id 
----------+---------------------------------------------------------------+----------+-----------------+---------------+-----------+------------+-------------+-------------
        1 | Shadow Riders, The                                            |        1 |            2002 |        614488 | Croatia   | Italian    |         9.3 |           6
        2 | Saban, Son of Saban                                           |        3 |            2000 |        497138 | Portugal  | Indonesian |         9.8 |           6
        4 | Smoke Signals                                                 |        2 |            2002 |        514212 | Japan     | Yiddish    |         3.9 |           6
        6 | American History X                                            |        3 |            1994 |        558888 | Armenia   | Bengali    |           9 |           6
       16 | Cabinet of Dr. Caligari, The (Cabinet des Dr. Caligari., Das) |        2 |            2010 |        562512 | Portugal  | Gujarati   |         7.7 |           6
       25 | Dawn Rider, The                                               |        3 |            1993 |        696567 | Indonesia | Bislama    |         6.1 |           6
(6 rows)
*/

-- Query 5

SELECT * 
FROM actors 
WHERE actor_id = (
  SELECT actor_id 
  FROM movies_to_actors 
  GROUP BY actor_id 
  ORDER BY COUNT(*) DESC LIMIT 1
);

/*
 actor_id |        name        |          agency           | active_since |    location    
----------+--------------------+---------------------------+--------------+----------------
       17 | Leonardo di Caprio | Bruen, Medhurst and Doyle |         2004 | South Carolina
(1 row)
*/

-- Query 6

CREATE VIEW mo_actors AS
SELECT actors.*
FROM actors
JOIN movies_to_actors ON actors.actor_id = movies_to_actors.actor_id
JOIN movies ON movies_to_actors.movie_id = movies.movie_id
WHERE actors.location = 'Missouri';

CREATE VIEW romcom AS
SELECT movies.*
FROM movies
JOIN movies_to_genres ON movies.movie_id = movies_to_genres.movie_id
JOIN genres ON movies_to_genres.genre_id = genres.genre_id
WHERE genres.name = 'Romcom';

SELECT DISTINCT mo_actors.* FROM mo_actors
JOIN movies_to_actors ON mo_actors.actor_id = movies_to_actors.actor_id
JOIN romcom ON movies_to_actors.movie_id = romcom.movie_id
ORDER BY mo_actors.name;
/*
 actor_id |  name   |    agency    | active_since | location 
----------+---------+--------------+--------------+----------
       19 | Malachi | Mohr-Johnson |         2008 | Missouri
(1 row)
*/


-- Query 7
SELECT movies.*
FROM movies
JOIN movies_to_genres ON movies.movie_id = movies_to_genres.movie_id
JOIN genres ON genres.genre_id = movies_to_genres.genre_id
WHERE genres.name = 'Thriller'
ORDER BY movies.gross_revenue DESC LIMIT 3;
/*
movie_id |      name      | duration | year_of_release | gross_revenue |    country    |         language          | imbd_rating | platform_id 
----------+----------------+----------+-----------------+---------------+---------------+---------------------------+-------------+-------------
       26 | Shutter Island |        2 |            2010 |     294805697 | United States | English                   |         8.2 |           1
       21 | Mammy          |        1 |            1988 |        938708 | Peru          | New Zealand Sign Language |         2.9 |           7
       12 | Cover-Up       |        3 |            2004 |        618728 | United States | Bislama                   |           7 |           7
(3 rows)
*/

-- Query 8
UPDATE movies 
SET platform_id = (
    SELECT platform_id FROM platforms WHERE name = 'Netflix'
);
/*
movies_db=# SELECT name, movie_id, platform_id FROM movies WHERE movies.year_of_release = 2004; 
              name               | movie_id | platform_id 
---------------------------------+----------+-------------
 Satan's Tango (Sátántangó)      |        8 |           1
 Cover-Up                        |       12 |           1
 Midsummer Night's Sex Comedy, A |       17 |           1
(3 rows)
*/
-- Query 9
SELECT platforms.name, COUNT(*)
FROM movies
JOIN platforms ON movies.platform_id = platforms.platform_id
GROUP BY platforms.platform_id
ORDER BY COUNT(*) DESC
LIMIT 1;

/*
  name   | count 
---------+-------
 Netflix |    28
(1 row)
*/

-- Query 10
SELECT actors.name, SUM(movies.gross_revenue) AS revenue_sum
FROM movies
JOIN movies_to_actors ON movies.movie_id = movies_to_actors.movie_id
JOIN actors ON movies_to_actors.actor_id = actors.actor_id
GROUP BY actors.actor_id
ORDER BY SUM(movies.gross_revenue) DESC LIMIT 2;

/*
        name        | revenue_sum 
--------------------+-------------
 Leonardo di Caprio |   298665119
 Gael Garcia        |    50000000
(2 rows)
*/
