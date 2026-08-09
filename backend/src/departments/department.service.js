const Department = require('../models/department.model');
const Institute = require('../models/institute.model');
const Student = require('../models/student.model');
const Faculty = require('../models/faculty.model');
const Event = require('../models/event.model');
const ApiError = require('../utils/ApiError');

async function getAll(instituteId){
    try {
        const filter = instituteId ? {instituteId} : {};
        const departments = await Department.find(filter).sort({name : 1});
        return departments;
    } catch (error) {
        throw new ApiError(500, 'Failed to fetch departments: ' + error.message);
    }
}

async function create(data){
    const {name , code , instituteId} = data;

    const institute = await Institute.findById(instituteId);
    if(!institute){
        throw new ApiError(404, 'No institute with given instituteId found');
    }
    const existing = await Department.findOne({
        instituteId, 
        $or : [
            {code},
            {name}
        ]
    });
    if(existing){
        throw new ApiError(409, 'A department with given code or name already exists in the institute');
    }
    try {
        const department = new Department({name , code , instituteId});
        return await department.save();
    } catch (error) {
        if(error.code === 11000){
            throw new ApiError(409, 'A department with given code or name already exists in the institute');
        }
        throw new ApiError(500, 'Failed to create a department: ' + error.message);
    }
}

async function update(id, data) {
  const { name, code, instituteId } = data;

  const institute = await Institute.findById(instituteId);
  if (!institute) {
    throw new ApiError(404, 'No institute found with the given instituteId');
  }

  const existing = await Department.findOne({
    instituteId,
    code,
    _id: { $ne: id }
  });
  if (existing) {
    throw new ApiError(409, 'A department with this code already exists in this institute');
  }

  try {
    const department = await Department.findByIdAndUpdate(
      id,
      { name, code, instituteId },
      { new: true, runValidators: true }
    );
    return department; 
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(409, 'A department with this code already exists in this institute');
    }
    throw new ApiError(500, 'Failed to update department: ' + err.message);
  }
}

async function remove(id) {
  const [studentCount, facultyCount, eventCount] = await Promise.all([
    Student.countDocuments({ departmentId: id }),
    Faculty.countDocuments({ departmentId: id }),
    Event.countDocuments({ targetDepartmentIds: id })
  ]);

  if (studentCount > 0 || facultyCount > 0 || eventCount > 0) {
    throw new ApiError(409, 'Department still has linked students, faculty, or events');
  }

  const department = await Department.findByIdAndDelete(id);
  return department; // null if no department matched that id
}

module.exports = {getAll , create , update ,remove};