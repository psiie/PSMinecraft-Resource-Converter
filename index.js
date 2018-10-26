const express = require('express');
const app = express();
const path = require('path');
const formidable = require('formidable');
const cookieParser = require('cookie-parser');
const fs = require('fs-extra');

const { onFileReceived } = require('./convert');

// cleanup on boot
fs.removeSync(path.join(__dirname, 'tmp'));

app.use(cookieParser());
app.use((req, res, next) => {
  const cookie = req.cookies ? req.cookies.sessionId : undefined;
  if (!cookie) {
    let randomNumber = Math.random().toString();
    randomNumber=randomNumber.substring(2,randomNumber.length);
    res.cookie('sessionId',randomNumber, { maxAge: 900000, httpOnly: true });
    req.cookies.sessionId = randomNumber;
    console.log('Express: cookie created successfully', randomNumber);
  } else {
    console.log('Express: cookie exists', cookie);
  }

  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// -------------------------------------------------------------------------- //

app.get('/', (req, res) => {
  console.log('Express: app get /. cookie:', req.cookies.sessionId);
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.get('/download/:sessionId', (req, res) => {
  const { sessionId } = req.params;
  if (!sessionId) {
    res.send(301).send('No download id specified');
    return;
  }

  const filePath = path.join(__dirname, 'tmp', sessionId, 'converted.zip');
  
  if (!fs.existsSync(filePath)) {
    res.status(302).send('Download file does not exist. Are you accessing your own convertion?');
    return;
  }

  res.download(filePath, 'texturepack.zip', err => {
    if (err) {
      console.log('error sending user the download');
      if (!res.headersSent) res.status(502).send('Server error in sending file to client', err);
    }
    
    fs.remove(path.join(__dirname, 'tmp', sessionId));
  });
});

// -------------------------------------------------------------------------- //

app.post('/upload', (req, res) => {
  console.log('Express: UPLOAD COOKIE. sessionId cookie:', req.cookies.sessionId);
  const { sessionId } = req.cookies;
  if (!sessionId) res.status(403).end('No cookie sent with request. Cannot process.');

  const uploadDir = path.join(__dirname, 'tmp', sessionId);
  const form = new formidable.IncomingForm(); // create an incoming form object

  fs.mkdirpSync(uploadDir);
  form.multiples = true; // specify that we want to allow the user to upload multiple files in a single request
  form.uploadDir = uploadDir; // store all uploads in the /uploads directory

  form.on('file', (field, file) => onFileReceived(file, uploadDir, sessionId, res));
  form.on('error', error => res.status(500).end(JSON.stringify(error)));
  // form.on('end', () => res.status(200).end('success'));
  form.parse(req); // parse the incoming request containing the form data

  // console.log('Attempting cleanup');
  // cleanup.cleanByExpiration();
});

// -------------------------------------------------------------------------- //

app.listen(process.env.PORT || 3000, () => {
  console.log('Express: Server listening on port');
});