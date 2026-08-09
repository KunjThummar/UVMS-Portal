const mongoose = require('mongoose');

function validateDepartment(data){
    const errors = []
    const {name , code , instituteId} = data;

    if(!name || typeof name !== 'string' || name.trim().length === 0){
        errors.push('Name of department is required and it must be a non-empty string');
    }
    if(!code || typeof code !== 'string' || code.trim().length === 0){
        errors.push('code of department is required and it must be a non-empty string');
    }
    if(!instituteId || !mongoose.Types.ObjectId.isValid(instituteId)){
        errors.push('instituteId is required and it must be a valid mongodb ObjectId');
    }

    return{
        isValid : errors.length === 0,
        errors
    }
    
}

module.exports = {validateDepartment};
