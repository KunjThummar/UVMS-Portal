const express = require('express');
const router = express.Router();

const {listDepartments,
       createDepartment,
       deleteDepartment,
       updateDepartment} = require('./department.controller')

//const { authMiddleware } = require('../middleware/authMiddleware');
//const { requireAdmin } = require('../middleware/requireAdmin');

// router.get('/', listInstitutes);
// router.post('/', authMiddleware, requireAdmin, createInstitute);
// router.put('/:id', authMiddleware, requireAdmin, updateInstitute);
// router.delete('/:id', authMiddleware, requireAdmin, deleteInstitute);


router.get('/' , listDepartments);
router.post('/' , createDepartment);
router.put('/:id' , updateDepartment);
router.delete('/:id' , deleteDepartment);

module.exports = router;