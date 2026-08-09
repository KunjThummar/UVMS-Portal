const departmentService = require('./department.service');
const {validateDepartment} = require('./department.validation');

async function listDepartments(req , res){
    const {instituteId} = req.query;
    try {
        const departments = await departmentService.getAll(instituteId);
        return res.status(200).json({success : true , data : departments});
    } catch (error) {
        return res.status(500).json({success : false , message : error.message});
    }
}

async function createDepartment(req , res){
    const {isValid , errors} = validateDepartment(req.body);

    if(!isValid){
        return res.status(400).json({success : false , message : errors});
    }
    try {
        const department = await departmentService.create(req.body);
        return res.status(201).json({success : true , data : department});
    } catch (error) {
        return res.status(400).json({success : false , message : error.message});
    }
}

async function updateDepartment(req, res) {
  const { isValid, errors } = validateDepartment(req.body);

  if (!isValid) {
    return res.status(400).json({ success: false, errors });
  }

  try {
    const department = await departmentService.update(req.params.id, req.body);

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    return res.status(200).json({ success: true, data: department });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
}

async function deleteDepartment(req, res) {
  try {
    const department = await departmentService.remove(req.params.id);

    if (!department) {
      return res.status(404).json({ success: false, message: 'Department not found' });
    }

    return res.status(200).json({ success: true, message: 'Department deleted successfully' });
  } catch (error) {
    const statusCode = error.statusCode || 500;
    return res.status(statusCode).json({ success: false, message: err.message });
  }
}

module.exports = {listDepartments , createDepartment , updateDepartment , deleteDepartment};