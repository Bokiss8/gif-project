var express = require('express');
var router = express.Router();
const http = require('http');
const axios = require('axios');
const fs = require('file-system');
const { callbackify } = require('util');
const pathImg = './public/images/';

router.get('/', async function (req, res) {
  //--------------------------------------------------------------------------
  async function saveImages(queryString) {
    let term = encodeURIComponent(queryString);
    let APIKEY = "G6V04Ouy9iPEtk1XvmtkleLHZHVG9Kdu";
    let url = `http://api.giphy.com/v1/gifs/search?q=${term}&api_key=${APIKEY}`;
    await http.get(url, (response) => {
      response.setEncoding('utf8');
      let body = '';
      response.on('data', (d) => {
        body += d;
      });
      response.on('end', async () => {
        let parsed = JSON.parse(body);
        parsed.data.sort(function (a, b) {
          if ( a.rating < b.rating ) {
            return -1;
          }
          if ( a.rating > b.rating ) {
            return 1;
          }
          return 0;
        });

        await parsed.data.forEach(async (element, i) => {
          if (i > 9) return;
          await axios({
            method: 'get',
            url: element.images.fixed_height.url,
            responseType: 'stream'
          }).then(async function (responseData) {
            await responseData.data.pipe(fs.createWriteStream(pathImg + i + '.gif'))
          });
        });
      });

    });
    
  }
//-----------------------------------------------------------
  async function getSavedImages() {
    let images = fs.readdirSync(pathImg);
    let result = [];
    await images.forEach(file => {
       result.push('images/' + file);
    });
    return result;
  }
//------------------------------------------------------------
   let searchString = req.query.search;
   await saveImages(searchString);
   let gifs = await getSavedImages();
  //console.log('masiv:', gifs);
  await new Promise((resolve, reject) => setTimeout(resolve, 1000));
  res.render('index', { title: 'Express', gifs: gifs });
  
});

module.exports = router;
