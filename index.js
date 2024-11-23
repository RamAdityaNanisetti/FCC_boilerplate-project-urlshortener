require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

let short = Number(1);

const urlSchema = new mongoose.Schema({
  original_url: {
    type: String,
    unique: true
  },
  short_url: {
    type: Number,
    unique: true
  }
});
let url = mongoose.model('url', urlSchema);

app.use(bodyParser.urlencoded({extended: false}));
// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

// function isValid(url) {
//   try {
//     new URL(url);
//     return true;
//   } catch (e) {
//     return false;
//   }
// }

// function isValid(_url) {
//   const pattern = /^(https?:\/\/)([\w-]+\.)+[\w-]+(\/[\w-]*)*$/;
//   return pattern.test(_url);
// }

app.post('/api/shorturl/',  async function(req, res){
  let original_url = req.body.url;
  // if(!isValid(original_url)){ 
  //   return res.json({error: 'invalid url' });
  // }
  const httpRegex = /^(https?)(:\/\/)/;
  if (!httpRegex.test(original_url)) {return res.json({ error: 'invalid url' })}
  let result;
  try {
    result =  await url.find({original_url: original_url}).exec();
  } catch(error) {
    console.log(error);
    res.json({"error_message": error});
  }
  
  if(result[0]) {
    // when url is present in db
    // respond with the result's tiny url
    res.json({original_url: original_url, short_url: result[0].short_url});
  } else {
    // creat new tiny url
    // respond with new tiny url
    result =  await url.find({}).exec();
    let short = result.length+1;
    let url1 = new url({original_url: original_url, short_url: short});
    url1.save();
    res.json({original_url: original_url, short_url: short});
  }
}); 

app.get('/api/shorturl/:short_url', async function(req, res){
  try {
    result =  await url.find({short_url: req.params.short_url}).exec();
  } catch(error) {
    console.log(error);
    res.json({"error_message": error});
  }
  if(result[0]){
    res.redirect(result[0].original_url);
  }
  else{
    res.json({error: 'invalid url' });
  }
})

