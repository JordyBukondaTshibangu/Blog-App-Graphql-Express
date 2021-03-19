import mongoose from 'mongoose';
const dbName = 'Graphql-blog'
const url = `mongodb://localhost:27017/${dbName}`

mongoose.connect(url, {useNewUrlParser : true,  useUnifiedTopology: true });
    
const db = mongoose.connection

    db.on('error', (err) => console.log(err))
    db.once('open', () =>{
        console.log('Connected to the Database')
    })

