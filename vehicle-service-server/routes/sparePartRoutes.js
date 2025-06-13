//routes/sparePartRoutes
const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getAllSpareParts,
  getSparePartById,
  createSparePart,
  updateSparePart,
  deleteSparePart,
  updateSparePartQuantity,
  uploadImage
} = require('../controllers/sparePartController');

// Multer config
const multer = require('multer');
const path = require('path');

// Ensure uploads directory exists
const fs = require('fs');
const dir = './uploads';
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  }
});

const upload = multer({ storage });

// Existing routes
router.get('/', getAllSpareParts);
router.get('/:id', getSparePartById);
router.post('/', authenticate, createSparePart);
router.put('/:id', authenticate, updateSparePart);
router.delete('/:id', authenticate, deleteSparePart);
router.patch('/:id/quantity', authenticate, updateSparePartQuantity);



// New route for image upload
router.post('/upload', authenticate, upload.single('image'), uploadImage);

module.exports = router;