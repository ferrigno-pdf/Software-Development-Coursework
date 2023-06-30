// *****************************************************
// <!-- Section 1 : Import Dependencies -->
// *****************************************************

const express = require('express'); // To build an application server or API
const app = express();
const pgp = require('pg-promise')(); // To connect to the Postgres DB from the node server
const bodyParser = require('body-parser');
const session = require('express-session'); // To set the session object. To store or access session data, use the `req.session`, which is (generally) serialized as JSON by the store.
const bcrypt = require('bcrypt'); //  To hash passwords
const axios = require('axios'); // To make HTTP requests from our server. We'll learn more about it in Part B.

// *****************************************************
// <!-- Section 2 : Connect to DB -->
// *****************************************************

// database configuration
const dbConfig = {
  host: 'db', // the database server
  port: 5432, // the database port
  database: process.env.POSTGRES_DB, // the database name
  user: process.env.POSTGRES_USER, // the user account to connect with
  password: process.env.POSTGRES_PASSWORD, // the password of the user account
};

const db = pgp(dbConfig);

// test your database
db.connect()
  .then(obj => {
    console.log('Database connection successful'); // you can view this message in the docker compose logs
    obj.done(); // success, release the connection;
  })
  .catch(error => {
    console.log('ERROR:', error.message || error);
  });

// *****************************************************
// <!-- Section 3 : App Settings -->
// *****************************************************

app.set('view engine', 'ejs'); // set the view engine to EJS
app.use(bodyParser.json()); // specify the usage of JSON for parsing request body.

// initialize session variables
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    saveUninitialized: false,
    resave: false,
  })
);

app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// *****************************************************
// <!-- Section 4 : API Routes -->
// *****************************************************

// TODO - Include your API routes here
app.get('/', (req, res) => {
    res.redirect('/login');
  });

app.get('/register', (req, res) => {
  res.render('pages/register', {});
});

app.post('/register', async (req, res) => {
  //hash the password using bcrypt library
  const hash = await bcrypt.hash(req.body.password, 10);
  // To-DO: Insert username and hashed password into 'users' table
  if (hash.err) {
    res.render('pages/register');
  } else {
    const addUser = await db.query (
      "insert into users (username, password) values ($1, $2);",
      [req.body.username, hash]
  );
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  res.render('pages/login')
});

app.post('/login', async (req, res) => {

  try {
    const username = req.body.username;
    const password = req.body.password;
    const userMatch = await db.query(
      "select * from users where users.username = $1",
      [username]
    );
    if (!userMatch[0]) {
      res.redirect('/register');
      return;
    }
    // check if password from request matches with password in DB
    const trimmedPass = userMatch[0].password.trim();
    const match = await bcrypt.compare(password, trimmedPass);
    if (!match) {
      throw new Error("Incorrect Username or password real pass");
    }

    const userObj = {username: userMatch[0].username, password: trimmedPass};
    req.session.user = userObj;
    req.session.save();
    res.redirect('/discover');

  } catch (error) {
    console.error(error);
    res.render('pages/login', { error: error.message });
  }

});

// Authentication Middleware.
const auth = (req, res, next) => {
  if (!req.session.user) {
    // Default to login page.
    return res.redirect('/login');
  }
  next();
};

// Authentication Required
app.use(auth);

app.get('/discover', async (req, res) => {

  axios({
    url: `https://app.ticketmaster.com/discovery/v2/events.json`,
    method: 'GET',
    dataType: 'json',
    headers: {
      'Accept-Encoding': 'application/json',
    },
    params: {
      apikey: process.env.API_KEY,
      keyword: 'Intocable', //you can choose any artist/event here
      size: 10,
    },
  })
    .then(results => {
      console.log(results.data._embedded.events); // the results will be displayed on the terminal if the docker containers are running // Send some parameters
      res.render('pages/discover',{results:results.data._embedded.events})
    })
    .catch(error => {
      // Handle errors
      res.render('pages/discover',{results:[]})
      console.error(error);

    });

});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.status(200).json({ message: 'Logged out successfully, refresh for login page' });
  res.render('pages/login');
})

// *****************************************************
// <!-- Section 5 : Start Server-->
// *****************************************************
// starting the server and keeping the connection open to listen for more requests
app.listen(3000);
console.log('Server is listening on port 3000');