const express = require('express');
const multer = require('multer');
const sharp = require('sharp');
const helmet = require('helmet');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// File upload configuration
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'image/tiff',
      'image/bmp'
    ];
    allowedMimes.includes(file.mimetype) ? cb(null, true) : cb(new Error('Invalid file type'));
  }
});

// Serve static files
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
  res.render('index', { formats: ['jpeg', 'png', 'webp', 'gif', 'bmp', 'tiff'] });
});

app.post('/convert', upload.single('image'), async (req, res) => {
  try {
    const format = req.body.format;
    const fileName = `${uuidv4()}.${format}`;
    
    const image = sharp(req.file.buffer);
    const convertedImage = await image.toFormat(format).toBuffer();

    res.set({
      'Content-Type': `image/${format}`,
      'Content-Disposition': `attachment; filename="${fileName}"`
    });

    res.send(convertedImage);
  } catch (error) {
    res.status(500).send('Conversion failed: ' + error.message);
  }
});

// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});