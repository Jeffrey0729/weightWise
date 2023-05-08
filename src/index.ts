///  <reference types="node" />
import './config';
import 'express-async-errors';
import express, { Express } from 'express';
import path from 'path';
import session from 'express-session';
import connectSqlite3 from 'connect-sqlite3';
import { logIn, logOut, registerUser } from './controllers/UserController';

const app: Express = express();
const { PORT, COOKIE_SECRET } = process.env;
const SQLiteStore = connectSqlite3(session);

app.use(
  session({
    store: new SQLiteStore({ db: 'sessions.sqlite', }),
    secret: COOKIE_SECRET,
    cookie: { maxAge: 8 * 60 * 60 * 1000, secure: false }, // 8 hours
    name: 'session',
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.static('public', { extensions: ['.html'] }));
app.use('/assets', express.static('assets'));
app.set('view engine', 'ejs');

const directoryPath = process.cwd();
app.use(express.static(path.join(directoryPath, 'public')));

app.get("/", (req, res) => {
  let session = req.session;
  res.render("index", { session });
})

app.get("/register", (req, res) => res.render("register"))
app.post('/api/register', registerUser);

app.get("/login", (req, res) => res.render("login"))
app.post('/api/login', logIn);
app.get('/api/logout/', logOut);

// Takes to meals page
app.get('/meals', (req, res) => res.render('meals.ejs'))

// Takes to workout page
app.get('/workouts', (req, res) => res.render('workouts.ejs'))

// Vegetarian Meal Page
app.get('/vegetarianMeal', (req, res) => {
  const filePath = path.resolve(directoryPath, 'public', 'vegetarianMeal.html');
  res.sendFile(filePath);
});

// Turkey Meal Page
app.get('/turkeyMeal', (req, res) => {
  const filePath = path.resolve(directoryPath, 'public', 'turkeyMeal.html');
  res.sendFile(filePath);
});

// Seafood Meal Page
app.get('/seafoodMeal', (req, res) => {
  const filePath = path.resolve(directoryPath, 'public', 'seafoodMeal.html');
  res.sendFile(filePath);
});

// Chicken Meal Page
app.get('/chickenMeal', (req, res) => {
  const filePath = path.resolve(directoryPath, 'public', 'chickenMeal.html');
  res.sendFile(filePath);
});

// Beef Meal Page
app.get('/beefMeal', (req, res) => {
  const filePath = path.resolve(directoryPath, 'public', 'beefMeal.html');
  res.sendFile(filePath);
});

// Upper Body Workouts Page
app.get('/upperBodyWorkouts', (req, res) => {
  const filePath = path.resolve(directoryPath, 'public', 'upperBodyWorkouts.html');
  res.sendFile(filePath);
});

// Lower Body Workouts Page
app.get('/lowerBodyWorkouts', (req, res) => {
  const filePath = path.resolve(directoryPath, 'public', 'lowerBodyWorkouts.html');
  res.sendFile(filePath);
});

// Core Workouts Page
app.get('/coreWorkouts', (req, res) => {
  const filePath = path.resolve(directoryPath, 'public', 'coreWorkouts.html');
  res.sendFile(filePath);
});

app.get("/user/profile", (req, res) => {
  if (!req.session.isLoggedIn) {
    res.redirect("/login")
    return;
  }

  const user = req.session.authenticatedUser;
  res.render("userProfile", { user });
})

app.listen(PORT, () => {
  console.log(`Listening at http://localhost:${PORT}`);
});
