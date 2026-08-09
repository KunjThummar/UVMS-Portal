const express = require('express');
const router = express.Router();

const {
  listInstitutes,
  createInstitute,
  updateInstitute,
  deleteInstitute
} = require('../institutes/institute.controller');

//const { authMiddleware } = require('../middleware/authMiddleware');
//const { requireAdmin } = require('../middleware/requireAdmin');

// router.get('/', listInstitutes);
// router.post('/', authMiddleware, requireAdmin, createInstitute);
// router.put('/:id', authMiddleware, requireAdmin, updateInstitute);
// router.delete('/:id', authMiddleware, requireAdmin, deleteInstitute);

router.get('/', listInstitutes);
router.post('/', createInstitute);
router.put('/:id', updateInstitute);
router.delete('/:id', deleteInstitute);

module.exports = router;