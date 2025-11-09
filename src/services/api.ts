import multer from 'multer';
import schedule from 'node-schedule';
import fs from 'fs';

const upload = multer({ dest: 'uploads/' });

app.post('/upload', upload.array('files', 10), (req, res) => {
  const files = req.files;
  console.log('Files received:', files); // Debugging line
  if (!files || files.length === 0) {
    return res.status(400).send('No files uploaded.');
  }
  // Process each file
  files.forEach(file => {
    console.log('Processing file:', file.originalname); // Debugging line
    // Perform OCR and other processing
    // Schedule file deletion
    schedule.scheduleJob(new Date(Date.now() + 5 * 60 * 1000), () => {
      fs.unlink(file.path, (err) => {
        if (err) console.error('Error deleting file:', err);
      });
    });
  });
  res.status(200).send('Files uploaded and processed');
}); 