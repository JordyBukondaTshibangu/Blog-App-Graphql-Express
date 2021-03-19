const path = require('path');
const { clearImage } = require('./util/file')

const express = require('express');
const bodyParser = require('body-parser');
require('./util/database')
const multer = require('multer');
const graphqlHTTP = require('express-graphql')
const graphqlSchema = require('./graphql/schema')
const graphqlResolver = require('./graphql/resolver')
const isAuth = require('./middleware/isAuth')
const app = express();

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + '-' + file.originalname);
  }
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg'
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.use(bodyParser.json());
app.use(multer({ storage: fileStorage, fileFilter: fileFilter }).single('image');
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if(req.method === 'OPTIONS'){
    return res.sendStatus(200)
  }
  next();
});
app.use(isAuth)
app.put('/post-image', (req, res, next) => {
  if(!req.isAuth){
    throw new Error('Not Authenticated !')
  }
  if(!req.file){
    return res.status(200).json({ message : 'No file provided'})
  }
  if(req.body.oldPath){
    clearImage(req.body.oldPath)
  }
  return res.status(201).json({ message : 'File stored.', filePath : req.file.path})

})

app.use('/graphql', graphqlHTTP({
  schema  : graphqlSchema,
  rootValue : graphqlResolver,
  graphiql : true,
  customFormatErrorFn(error){
    if(!error.originalError){
      return error;
    }
    const data = error.originalError.data
    const message = error.message || 'An error occured.'
    const code = error.originalError.code || 500
    return {
      message, 
      status : code,
      data
    }
  }
}))
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data
  res.status(status).json({ message: message, data });
});

app.listen(8080);
