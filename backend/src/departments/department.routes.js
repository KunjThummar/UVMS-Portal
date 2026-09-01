const express = require('express');
const router = express.Router();

const {
       listDepartments,
       createDepartment,
       deleteDepartment,
       updateDepartment } = require('./department.controller')

const authenticate = require('../middleware/authenticate');
const authorize = require('../middleware/authorize');

router.get('/', listDepartments);
router.post('/', authenticate, authorize('admin'), createDepartment);
router.put('/:id', authenticate, authorize('admin'), updateDepartment);
router.delete('/:id', authenticate, authorize('admin'), deleteDepartment);

module.exports = router;