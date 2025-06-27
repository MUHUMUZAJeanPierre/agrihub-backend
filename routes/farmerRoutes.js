const express = require('express');
const router = express.Router();
const farmerController = require('../controllers/farmerController');

router.get('/farmers', farmerController.getAllFarmers);
router.get('/farmers/:id', farmerController.getFarmerById);
router.post('/farmers', farmerController.createFarmer);
router.put('/farmers/:id', farmerController.updateFarmer);

router.delete('/farmers/:id', farmerController.deleteFarmer);

module.exports = router;
