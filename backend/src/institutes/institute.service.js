const Institute = require('../models/institute.model');
const Department = require('../models/department.model');
const Student = require('../models/student.model');
const Faculty = require('../models/faculty.model');
const Event = require('../models/event.model');
const ApiError = require('../utils/ApiError');

async function getAll(){
    try{
        const institues = await Institute.find({}).sort({name : 1});
        return institues;
    }catch(err){
        throw new ApiError(500, 'Failed to fetch institutes: ' + err.message);
    }
}

async function create(data){
    try {
        const institue = new Institute({
            name : data.name,
            code : data.code
        });
        return await institue.save();
    } catch (error) {
        if(error.code === 11000){
            throw new ApiError(409, 'An institute with this name or code already exists');
        }
        throw new ApiError(500, 'Failed to create institute: ' + error.message);
    }
}

async function update(id ,data){
    try {
        const institute = await Institute.findByIdAndUpdate(
            id,
            {
                name : data.name,
                code : data.code
            },
            {
                new : true,
                runValidators : true
            }
        );
        return institute;
    } catch (error) {
        if(error.code === 11000){
            throw new ApiError(409, 'An institute with this name or code already exists');
        }
        throw new ApiError(500, 'Failed to update institute: ' + error.message);
    }   
}

async function remove(id){
    const [departmentCount , studentCount , facultyCount , eventcount] = await Promise.all([
        Department.countDocuments({instituteId : id}),
        Student.countDocuments({instituteId : id}),
        Faculty.countDocuments({instituteId : id}),
        Event.countDocuments({instituteId : id})
    ]);

    if(departmentCount>0 || studentCount>0 || facultyCount>0 || eventcount>0){
        throw new ApiError(409, 'Institute still has linked students, departments, or events');
    }

    const institute = await Institute.findByIdAndDelete(id);
    return institute;
}

module.exports = {getAll , create , update , remove};