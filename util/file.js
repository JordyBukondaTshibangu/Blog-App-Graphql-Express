import path from 'path';
import fs from 'fs';

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath)
    fs.unlink(filePath, err => console.log(err))
  }

  export default clearImage;