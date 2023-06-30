// *********************************
// <!-- Section 1 : Dependencies-->
// *********************************

// importing the dependencies
// Express is a NodeJS framework that, among other features, allows us to create HTML templates.
const express = require('express');
const bodyParser = require('body-parser');
const pgp = require('pg-promise')();
require('dotenv').config();

// ***********************************
// <!-- Section 2 : Initialization-->
// ***********************************

// defining the Express app
const app = express();
// using bodyParser to parse JSON in the request body into JS objects
app.use(bodyParser.json());
// Database connection details
const dbConfig = {
  host: 'db',
  port: 5432,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
};
// Connect to database using the above details
const db = pgp(dbConfig);

// ****************************************************
// <!-- Section 3 : Examples Enpoint Implementation-->
// ****************************************************

// <!-- Endpoint 1 :  Default endpoint ("/") -->
const message = 'Hey there!';
app.get('/', (req, res) => {
  res.send(message);
});
// <!-- Endpoint 1 :  Get User Details ("/getUserInfo") -->
app.get('/getUserInfo', function (req, res) {
    // Fetch query parameters from the request object
    var username = req.query.username;
    var city = req.query.city;
  
    // Multiple queries using templated strings
    var current_user = `select * from userinfo where username = '${username}';`;
    var city_users = `select * from userinfo where city = '${city}';`;
  
    // use task to execute multiple queries
    db.task('get-everything', task => {
      return task.batch([task.any(current_user), task.any(city_users)]);
    })
      // if query execution succeeds
      // query results can be obtained
      // as shown below
      .then(data => {
        res.status(200).json({
          current_user: data[0],
          city_users: data[1],
        });
      })
      // if query execution fails
      // send error message
      .catch(err => {
        console.log('Uh Oh spaghettio');
        console.log(err);
        res.status('400').json({
          current_user: '',
          city_users: '',
          error: err,
        });
      });
  });

  // <!-- Endpoint 3 :  Add User ("/add_user") -->
app.post('/add_user', function (req, res) {
    const query =
      'insert into userinfo (username, name, email, city) values ($1, $2, $3, $4)  returning * ;';
    db.any(query, [
      req.body.username,
      req.body.name,
      req.body.email,
      req.body.city,
    ])
      // if query execution succeeds
      // send success message
      .then(function (data) {
        res.status(201).json({
          status: 'success',
          data: data,
          message: 'data added successfully',
        });
      })
      // if query execution fails
      // send error message
      .catch(function (err) {
        return console.log(err);
      });
  });

  // <!-- Endpoint 4 :  Update User ("/update_user") -->
app.put('/update_user', function (req, res) {
    const query =
      'update userinfo set name = $1 where username = $2 returning * ;';
    // $1 and $2 will be replaced by req.body.name, req.body.username
    db.any(query, [req.body.name, req.body.username])
      // if query execution succeeds
      // send success message
      .then(function (data) {
        res.status(201).json({
          status: 'success',
          data: data,
          message: 'data updated successfully',
        });
      })
      // if query execution fails
      // send error message
      .catch(function (err) {
        return console.log(err);
      });
  });

  // <!-- Endpoint 5 :  Delete User ("/delete_user") -->
app.delete('/delete_user/:username', function (req, res) {
    //Here we are using path parameter
    const username = req.params.username;
    const query = 'delete from userinfo where username = $1 returning * ;';
  
    db.any(query, [username])
      // if query execution succeeds
      // send success message
      .then(function (data) {
        res.status(200).json({
          status: 'success',
          data: data,
          message: 'data deleted successfully',
        });
      })
      // if query execution fails
      // send error message
      .catch(function (err) {
        return console.log(err);
      });
  });

// ************************************************
// <!-- Section 4 : TODOs Enpoint Implementation-->
// ************************************************
// <!-- Endpoint 1 :  Get User Details ("/getUserInfo") -->
app.get('/getTop3ByRatingCali', function (req, res) {
    // Fetch query parameters from the request object

  
    // Multiple queries using templated strings
    var trails = `select * from trails WHERE location = 'California' order by avg_rating DESC LIMIT 3`;
  
    db.task('get-everything', task => {
      return task.batch([task.any(trails)]);
    })
      // if query execution succeeds
      // query results can be obtained
      // as shown below
      .then(data => {
        res.status(200).json({
          trails: data[0],
        });
      })
      // if query execution fails
      // send error message
      .catch(err => {
        console.log('Uh Oh spaghettio');
        console.log(err);
        res.status('400').json({
          trails: '',
          error: err,
        });
      });
  });

//   ii POST review
app.post('/add_review', async (req, res) => {
    var rev_id;
    var img_id;
    try {
        const reviewQuery = await db.query (
            'insert into reviews (username, review, rating) values ($1, $2, $3) returning review_id;',
            [req.body.username, req.body.review, req.body.rating]
        );
        rev_id = reviewQuery[0].review_id;

        if (req.body.image_url) {
            var img_url = req.body.image_url;
            var img_caption = req.body.image_caption ? req.body.image_caption : null;
            const imageQuery = await db.query (
                'insert into images (image_url, image_caption) values ($1, $2) returning image_id;',
                [img_url, img_caption]
            );
            img_id = imageQuery[0].image_id;

            const reviews_to_images = await db.query(
                'insert into reviews_to_images (image_id, review_id) values ($1, $2) returning *;',
                [img_id, rev_id]
            );
            return res.status(201).json({
                status : 'sucess',
                message : 'data added successfully',
                image_id : img_id,
                review_id : rev_id
            });
        } else {
            return res.status(201).json({
                status : 'sucess',
                message : 'data added successfully',
                review_id : rev_id
            });
        }

        } catch (err) {
        console.log(err)
        return res.status(400).json({ error: 'Something went wrong', reason: err});
    }
    
  });

// iii PUT Review
// <!-- Endpoint 4 :  Update User ("/update_user") -->
app.put('/update_review_or_image', async (req, res) => {

    try {
        const updateRev = await db.query(
            'update reviews set review = $1 where review_id = $2 returning *;',
            [req.body.review, req.body.review_id]
        );
        if (req.body.rating) {
            const updateRating = await db.query(
                'update reviews set rating = $1 where review_id = $2 returning *;',
                [req.body.rating, req.body.review_id]
            )
        }
        if (req.body.image_id) {
            var updatedImage;
            if (req.body.image_url) {
                const updateUrl = await db.query(
                    'update images set image_url = $1 where image_id = $2 returning *;',
                    [req.body.image_url, req.body.image_id]
                );
                updatedImage = updateUrl;
            } if (req.body.image_caption) {
                const updateCaption = await db.query(
                    'update images set image_caption = $1 where image_id = $2 returning *;',
                    [req.body.image_caption, req.body.image_id]
                );
                updatedImage = updateCaption;
            }
            return res.status(201).json({
                status: 'success',
                message: 'data updated successfully',
                new_review : updateRev,
                new_image : updatedImage
            });
        } else {
            return res.status(201).json({
                status: 'success',
                message: 'data updated successfully',
                new_review : updateRev
            });

        }

    }
      // if query execution fails
      // send error message
      catch(err) {
      console.log(err)
      return res.status(400).json({ error: 'Something went wrong', reason: err});
  }
});

  // iv delete review
  app.delete('/delete_review', async (req, res) => {
    try {
        const usernameReq = req.body.username ? req.body.username : null;
        const ratingReq = req.body.rating ? req.body.rating : null;
        const reviewIdReq = req.body.review_id ? req.body.review_id : null;

        if (reviewIdReq != null) {
            const deleteByRevId = await db.query(
                'delete from reviews where review_id = $1 returning * ;',
                [reviewIdReq]
            );
            const deleteInReviewsToImages = await db.query(
                'delete from reviews_to_images where review_id = $1 returning *;',
                [reviewIdReq]
            );
            return res.status(200).json({
                status: 'success',
                message: 'Data deleted successfully'
            })
        } if (usernameReq != null) {
            const deleteWithUser = await db.query (
                'DELETE FROM reviews_to_images WHERE review_id IN (SELECT review_id FROM reviews WHERE username = $1);', 
                [usernameReq]
            );
            const deleteByUser = await db.query ('delete from reviews where username = $1 returning *;',
            [usernameReq]
            );

            return res.status(200).json({
                status: 'success',
                message: 'Data deleted successfully'
            })
        } if (ratingReq != null) {
            const deleteWithRating = await db.query (
                'DELETE FROM reviews_to_images WHERE review_id IN (SELECT review_id FROM reviews WHERE rating = $1);', 
                [ratingReq]
            );
            const deleteByRating = await db.query (
                'delete from reviews where rating = $1 returning *;', 
                [ratingReq]
            );
            const getByRating = await db.query (
                'select * FROM reviews WHERE rating = $1', ratingReq
            )
            return res.status(200).json({
                status: 'success',
                message: 'Data deleted successfully',
                deleted : deleteByRating,
                get : getByRating
            })


        }

    } catch(err) {
        console.log(err)
        return res.status(400).json({ error: 'Something went wrong', reason: err});
    }

  });

app.get('/getTrails', async (req, res) => {
    try {
        var diffParam = req.query.difficulty ? req.query.difficulty : req.body.difficulty;
        var ratingParam = req.query.avg_rating ? req.query.avg_rating : req.body.avg_rating;
        var locationParam = req.query.location ? req.query.location : req.body.location;
        var elevationParam = req.query.elevation_gain ? req.query.elevation_gain : req.body.elevation_gain;

        var fullResponse = [];
        if (diffParam != null) {
            const getByDifficulty = await db.query(
                `select * from trails where difficulty = '${diffParam}';`
            );
            fullResponse.push(getByDifficulty);
        }
        if (ratingParam != null) {
            const getByRating = await db.query(
                `select * from trails where avg_rating = ${ratingParam}`
            );
            fullResponse.push(getByRating);
        }
        if (locationParam != null) {
            const getByLocation = await db.query(
                `select * from trails where location = '${locationParam}'`
            );
            fullResponse.push(getByLocation);
        }
        if (elevationParam != null) {
            const getByElevation = await db.query(
                `select * from trails where elevation_gain = ${elevationParam}`
            );
            fullResponse.push(getByElevation);
        }
        return res.status(200).json({
            trails : fullResponse
        })
    } catch(err) {
        console.log(err)
        return res.status(400).json({ error: 'Something went wrong', reason: err});
    }

  
  });

app.get('/getTrailId', async (req, res) => {
    try {
        var trailIdParam = req.query.trail_id ? req.query.trail_id : req.body.trail_id;
        const getReviews = await db.query(
            `SELECT reviews.review
            FROM trails
            INNER JOIN trails_to_reviews ON trails.trail_id = trails_to_reviews.trail_id
            INNER JOIN reviews ON trails_to_reviews.review_id = reviews.review_id
            WHERE trails.trail_id = ${trailIdParam};`
        );
        return res.status(200).json({
            reviews : getReviews
        })
    } catch(err) {
        console.log(err)
        return res.status(400).json({ error: 'Something went wrong', reason: err});
    }

  
  });


// *********************************
// <!-- Section 5 : Start Server-->
// *********************************
// starting the server and keeping the connection open to listen for more requests
app.listen(3000, () => {
  console.log('listening on port 3000');
});
