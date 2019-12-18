import express, { Router, Request, Response } from 'express';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles} from './util/util';
import fs from 'fs';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}}
  // endpoint to filter an image from a public url.
  // IT SHOULD
  //    
  //    1. validate the image_url query
  //    2. call filterImageFromURL(image_url) to filter the image
  //    3. send the resulting file in the response
  //    4. deletes any files on the server on finish of the response
  // QUERY PARAMATERS
  //    image_url: URL of a publicly accessible image
  // RETURNS
  //   the filtered image file [!!TIP res.sendFile(filteredpath); might be useful]

  /**************************************************************************** */

  //! END @TODO1  

  // GET method to valid a URL, filter it using filterImageFromURL, and send it back.
  // The server is then purged of all stored images.
  // Example input from Postman:
  // http://localhost:8082/filteredimage?image_url=https://images.pexels.com/photos/2318555/pexels-photo-2318555.jpeg

  app.get( "/filteredimage/", async ( req: Request, res: Response ) => {

    // checks to see if there is a valid URL
    let image_url:string = req.query.image_url;

    // checks to see if there is a URL and if not returns requirement
    if ( !image_url ) {
      return res.status(422)
                .send(`valid URL is required`);
    }

    // inputs URL into filterImageFromURL function
    // downloads the image to /tmp/, renames it, and applies filtering effects
    const filteredPath = await filterImageFromURL(image_url);

    // returns the new filtered image
    res.sendFile(filteredPath);

    // reads local directory and creates an array of the file names
    fs.readdir(__dirname + "/util/tmp/", async function(err, file) {
    // console.log(file);

      // adds the absolute address to every element of a new array
      const filePath : Array<string> = new Array();
      file.forEach(function(element) {
        filePath.push(__dirname + "/util/tmp/" + element);
      });

      // deletes locally stored image and sends error message if there is an issue
      try{
      await deleteLocalFiles(filePath);}
      catch(err){
        console.log('failure to delete!');
      }
    });

   });

  // Root Endpoint
  // Displays a simple message to the user
  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );

})();