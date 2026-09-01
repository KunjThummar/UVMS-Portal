const express = require('express');
const router = express.Router();

const {
  listInstitutes,
  createInstitute,
  updateInstitute,
  deleteInstitute
} = require('../institutes/institute.controller');

const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', listInstitutes);
router.post('/', authenticate, authorize('admin'), createInstitute);
router.put('/:id', authenticate, authorize('admin'), updateInstitute);
router.delete('/:id', authenticate, authorize('admin'), deleteInstitute);

module.exports = router;