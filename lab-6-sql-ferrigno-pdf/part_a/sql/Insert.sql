INSERT INTO movies (movie_id, name, duration, year_of_release, gross_revenue, country, language, IMBD_rating, platform_id)
  VALUES (27, 'Fight Club', 96, 1999, 50000000, 'United States', 'English', 9.9, 2), /* First row  */
  (28, 'The Whale', 99, 2023, 50000000, 'United States', 'English', 9.7, 1); /* Second row */

INSERT INTO actors (actor_id, name, agency, active_since, location)
  VALUES (21, 'Eugenio Derbez', 'Kebabes', 1995, 'Mexico City'),
  (22, 'Gael Garcia', 'Alitas Centrito', 1996, 'Centrito Valle');

INSERT INTO genres (genre_id, name)
  VALUES (9, 'Dark Humour'),
  (10, 'Cooking');

INSERT INTO platforms (platform_id, name, viewership_cost)
  VALUES (8, 'Muvi', 10),
  (9, 'Cablevision', 15);

INSERT INTO movies_to_actors (movie_id, actor_id)
  VALUES (27, 21),
  (28, 22);

INSERT INTO movies_to_genres (genre_id, movie_id)
  VALUES (9, 27),
  (10, 28);




