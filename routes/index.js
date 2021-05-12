var express = require('express');
var router = express.Router();
const http = require('http');
const axios = require('axios');
const fs = require('file-system');
const { callbackify } = require('util');
const pathImg = './public/images/';
var prapor = 0; 

router.get('/', async function (req, res) {
  //--------------------------------------------------------------------------
  async function saveImages(queryString) {
    prapor = 0;
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
          if (i > 9) return console.log('propysk image:',i);
          await axios({
            method: 'get',
            url: element.images.fixed_height.url,
            responseType: 'stream'
          }).then(async function (responseData) {
            await responseData.data.pipe(fs.createWriteStream(pathImg + i + '.gif'))
            console.log('image:',i);
          });
          console.log('image prapor', prapor);
          if (prapor != 10) {prapor++} else {console.log('prapor konec', prapor);}
        });
        //console.log('ne 2 sohranil image');
      });
      //console.log('ne 1 sohranil image');
    });
    console.log('startoval saveimage');
    
  }
//-----------------------------------------------------------
  async function getSavedImages() {
    let images = fs.readdirSync(pathImg);
    let result = [];
     await images.forEach(file => {
       result.push('images/' + file);
    });
    console.log('getsavedimages completed');  
    return result;
  }
//------------------------------------------------------------
      async function waitForIt(){
        if (prapor != 10) {
            setTimeout(function(){waitForIt()},3000);
            console.log('status prapor', prapor);
        } else { 
          console.log('otrabotal saveimage');
          console.log('mogno start getsavedimages')
        //3. Await for the first function to complete
        let gifs = await getSavedImages();
        console.log('promise resolved: ' + gifs);
        console.log('next step vuvod na ekran');
        res.render('index', { title: 'Express', gifs: gifs });
        };
    };
//------------------------------------------------------------------
        let searchString = req.query.search;
        await saveImages(searchString); 
        await waitForIt();
});

module.exports = router;
