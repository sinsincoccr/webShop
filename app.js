// app.js

const createError = require('http-errors');
const express = require('express');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const session = require('express-session');
const nunjucks = require('nunjucks');
const dotenv = require('dotenv');

dotenv.config();
const pageRouter = require('./routes/page');


const path = require('path');
const logger = require('morgan');


// database
const oracledb = require('oracledb'); // 오라클 데이터베이스 모듈

// Database configuration
const dbConfig = {
  user: 'C##webShop',
  password: '123321',
  connectString: 'localhost:1521/orcl'
};

const app = express();
app.set('port', process.env.PORT || 8001);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');
nunjucks.configure('views', {
  express: app,
  watch: true,
});

app.use(morgan('dev'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.use(logger('dev'));

app.use(express.static(path.join(__dirname, 'public')));

app.use('/', pageRouter);
app.use((req,res,next) => {
  const error = new Error( '${req.method ${req.url} 라우터가 없습니다.')
  error.status = 404;
});

app.use((req,res,next) => {
  const error = new Error( '${req.method ${req.url} 라우터가 없습니다.')
  error.status = 404;
  next(error);
});
app.use((err, req,res,next) => {
  res.local.message = err.message;
  res.local.error = process.env.NODE_ENV !== 'production' ? err: {};
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'), () => {
  console.log(app.get('port'), '번 포트에서 대기 중');
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


