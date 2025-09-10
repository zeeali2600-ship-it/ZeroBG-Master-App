const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");
const multer = require("multer");
const FormData = require("form-data");
const path = require('path');

const app = express();
const upload = multer({ storage: multer.memoryStorage() }); 

// Pixian API ki poori Authorization Key
const PIXIAN_AUTH_HEADER = 'Basic cHhrcWNta2lyNmF5czRiOmthdW5mbXBpYTNqNWRhNWJqNG83aGJsNzQ3dHJjMjFkZ2FkaWRzMmZpajJwbDBxcm8zYWk=';

app.use(cors());
app.use(express.static(path.join(__dirname, '')));

app.post("/remove-background", upload.single('image_file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send("No image file uploaded.");
  }

  try {
    const form = new FormData();
    form.append('image', req.file.buffer, { filename: "image.png" });
    
    const apiResponse = await fetch("https://api.pixian.ai/v1/image", {
      method: "POST",
      headers: {
        'Authorization': PIXIAN_AUTH_HEADER,
        ...form.getHeaders()
      },
      body: form,
    });

    if (apiResponse.ok) {
      const imageBuffer = await apiResponse.buffer();
      res.setHeader('Content-Type', 'image/png');
      res.send(imageBuffer);
    } else {
      const errorText = await apiResponse.text();
      res.status(apiResponse.status).send(`Pixian.AI API Error: ${errorText}`);
    }
  } catch (error) {
    res.status(500).send(`Server Error: ${error.message}`);
  }
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});