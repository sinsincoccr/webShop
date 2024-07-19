// app.js

const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const bodyParser = require('body-parser');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/users');
const testRouter = require('./routes/test');

const app = express();
const port = 3000;

// database
const oracledb = require('oracledb'); // 오라클 데이터베이스 모듈

// Database configuration
const dbConfig = {
  user: 'C##webShop',
  password: '123321',
  connectString: 'localhost:1521/orcl'
};

// Middleware setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: false }));

// Route setup
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/test', testRouter);

app.get('/myPage', (req, res) => {
  res.render('myPage');
});

app.get('/contact', (req, res) => {
  res.render('contact');
});

app.post('/contactProc', async (req, res) => {
  const name = req.body.name;
  const phone = req.body.phone;
  const email = req.body.email;
  const meno = req.body.meno;

  let connection;

  try {
    // Establish connection to the database
    connection = await oracledb.getConnection(dbConfig);

    // Define the SQL query
    const sql = `INSERT INTO USER_LIST (USER_CD, USER_ID, USER_PW) VALUES (:name, :phone, :email)`;

    // Execute the query
    await connection.execute(sql, [name, phone, email], { autoCommit: true });

    console.log('1 record inserted');
    res.send(`<script>alert('문의사항이 등록되었습니다.'); location.href='/';</script>`);
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).send('An error occurred while processing your request.');
  } finally {
    if (connection) {
      try {
        await connection.close();
      } catch (err) {
        console.error('Error closing connection:', err);
      }
    }
  }
});

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// Error handler
app.use((err, req, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  res.status(err.status || 500);
  res.render('error');
});

app.listen(port, () => {
  console.log(`서버가 실행되었습니다. 접속주소 : http://localhost:${port}`);
});

module.exports = app;