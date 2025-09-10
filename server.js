const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const multer = require("multer");
const FormData = require("form-data");
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() }); 

// --- Aapki Nayi RapidAPI ki details daal di gayi hain ---
const RAPIDAPI_KEY = '33ad6dbc9fmsh37b98984ca0d4f7p1782c2jsn9b4345a43215';
const RAPIDAPI_HOST = 'background-removal4.p.rapidapi.com';

app.use(cors());
app.use(express.static(path.join(__dirname, '')));

app.post("/remove-background", upload.single('image_file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No image file uploaded.");
  }

  if (!RAPIDAPI_KEY || !RAPIDAPI_HOST) {
    return res.status(500).send("API credentials are not set in the server code.");
  }

  try {
    const form = new FormData();
    form.append('image', req.file.buffer, { filename: "image.png" });
    
    const apiResponse = await fetch("https://background-removal4.p.rapidapi.com/v1/results?mode=fg-image", {
      method: "POST",
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST,
        ...form.getHeaders()
      },
      body: form,
    });

    if (apiResponse.ok) {
      const jsonData = await apiResponse.json();
      const imageBuffer = Buffer.from(jsonData.results[0].entities[0].image, 'base64');
      res.setHeader('Content-Type', 'image/png');
      res.send(imageBuffer);
    } else {
      const errorText = await apiResponse.text();
      res.status(apiResponse.status).send(`RapidAPI Error: ${errorText}`);
    }
  } catch (error) {
    res.status(500).send(`Server Error: ${error.message}`);
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});