
function validateInstitute(data){
    const errors = [];
    const {name , code} = data;

    if(!name || typeof name !== 'string' || name.trim().length === 0){
        errors.push('name is required and it must be a non empty string');
    }

    if(!code || typeof code !== 'string' || code.trim().length === 0){
        errors.push('code is required and it must be a non empty string');
    }

    if(code && code.trim().length > 10){
        errors.push('The code must be 10 characters or fewres');
    }

    return {
        isValid : errors.length === 0,
        errors
    };   
}

module.exports = {validateInstitute};