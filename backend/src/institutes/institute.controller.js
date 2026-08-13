const instituteService = require('./institute.service');
const {validateInstitute} = require('./institute.validation')

async function listInstitutes(req , res){
    try {
        const institutes = await instituteService.getAll();
        return res.status(200).json(institutes);
    } catch (error) {
        return res.status(500).json({message : error.message});
    }
}

async function createInstitute(req , res) {
    const {isValid , errors} = validateInstitute(req.body);

    if(!isValid){
        return res.status(400).json({success :false , errors});
    }
    try {
        const institue = await instituteService.create(req.body);
        return res.status(201).json({success : true , data : institue});
    } catch (error) {
        return res.status(500).json({success : false , message : error.message});
    }
}

async function updateInstitute(req , res){
    const {isValid , errors} = validateInstitute(req.body);

    if(!isValid){
        return res.status(400).json({success : false , errors});
    }
    try {
        const institute = await instituteService.update( req.params.id, req.body);
        if(!institute){
            return res.status(404).json({success : false , message : 'Institute not found'})
        }
        return res.status(200).json({success : true , data : institute})
    } catch (error) {
        return res.status(500).json({success : false , message : error.message})
    }
}

async function deleteInstitute(req , res) {
    try{
        const institute = await instituteService.remove(req.params.id);

        if(!institute){
            return res.status(404).json({success : false , message : 'Institute not found'});
        }
        return res.status(200).json({success : true, message : 'Institute deleted successfully'});
    }catch(error){
        const statusCode = error.statusCode || 500;
        return res.status(statusCode).json({success : false , message : error.message});
    }
}

module.exports = {listInstitutes , createInstitute , updateInstitute , deleteInstitute};