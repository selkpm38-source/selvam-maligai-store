'use strict';

const express = require('express');
const router = express.Router();
const { authenticate, ownerOnly } = require('../middlewares/auth');
const productController = require('../controllers/productController');

router.get('/', productController.list);
router.post('/', authenticate, ownerOnly, productController.create);
router.put('/:id', authenticate, ownerOnly, productController.update);
router.delete('/:id', authenticate, ownerOnly, productController.remove);

module.exports = router;
