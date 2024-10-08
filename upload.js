const { google } = require('googleapis');
const express = require('express');
const multer = require('multer');
const app = express();
const port = 3000;

// OAuth2 setup with Google Drive API credentials
const oauth2Client = new google.auth.OAuth2(
  process.env.CLIENT_ID,
  process.env.CLIENT_SECRET,
  'https://developers.google.com/oauthplayground'
);

oauth2Client.setCredentials({
  refresh_token: process.env.REFRESH_TOKEN,
});

const drive = google.drive({ version: 'v3', auth: oauth2Client });

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Handle the file upload POST request
app.post('/upload', upload.array('files'), async (req, res) => {
  try {
    const folderId = process.env.FOLDER_ID;
    const files = req.files;

    // Upload each file to Google Drive
    for (const file of files) {
      await drive.files.create({
        requestBody: {
          name: file.originalname,
          parents: [folderId],
        },
        media: {
          mimeType: file.mimetype,
          body: file.buffer,
        },
      });
    }
    res.status(200).send({ message: 'Files uploaded successfully' });
  } catch (error) {
    res.status(500).send({ message: 'Failed to upload files', error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
