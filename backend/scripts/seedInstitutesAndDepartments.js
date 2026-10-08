require('dotenv').config();
const mongoose = require('mongoose');
const { connectToDatabase } = require('../src/config/db');
const Institute = require('../src/models/institute.model');
const Department = require('../src/models/department.model');

const charusatData = [
  {
    code: 'ARIP',
    name: 'Ashok and Rita Patel Institute of Physiotherapy',
    departments: [
      { code: 'PT', name: 'Physiotherapy' }
    ]
  },
  {
    code: 'BDIAS',
    name: 'Bapubhai Desaibhai Patel Institute of Allied and Healthcare Sciences',
    departments: [
      { code: 'MLT', name: 'Medical Laboratory Technology' },
      { code: 'MIT', name: 'Medical Imaging Technology' },
      { code: 'OPT', name: 'Optometry' },
      { code: 'OTAT', name: 'Operation Theater and Anesthesia Technology' }
    ]
  },
  {
    code: 'CSPIT',
    name: 'Chandubhai S. Patel Institute of Technology',
    departments: [
      { code: 'IT', name: 'Information Technology' },
      { code: 'CL', name: 'Civil Engineering' },
      { code: 'ME', name: 'Mechanical Engineering' },
      { code: 'AIML', name: 'Artificial Intelligence and Machine Learning' },
      { code: 'EE', name: 'Electrical Engineering' }
    ]
  },
  {
    code: 'CLASS',
    name: 'Charotar Institute of Languages, Arts and Social Studies',
    departments: [
      { code: 'HSS', name: 'Humanities and Social Sciences' },
      { code: 'LIS', name: 'Library and Information Science' }
    ]
  },
  {
    code: 'DEPSTAR',
    name: 'Devang Patel Institute of Advance Technology and Research',
    departments: [
      { code: 'CE', name: 'Computer Engineering' },
      { code: 'CSE', name: 'Computer Science and Engineering' },
      { code: 'IT', name: 'Information Technology' }
    ]
  },
  {
    code: 'IIIM',
    name: 'Indukaka Ipcowala Institute of Management',
    departments: [
      { code: 'MS', name: 'Management Studies' }
    ]
  },
  {
    code: 'MTIN',
    name: 'Manikaka Topawala Institute of Nursing',
    departments: [
      { code: 'NUR', name: 'Nursing' }
    ]
  },
  {
    code: 'PDPIAS',
    name: 'P. D. Patel Institute of Applied Sciences',
    departments: [
      { code: 'BS', name: 'Biological Sciences' },
      { code: 'CS', name: 'Chemical Sciences' },
      { code: 'MS', name: 'Mathematical Sciences' },
      { code: 'PS', name: 'Physical Sciences' }
    ]
  },
  {
    code: 'RPCP',
    name: 'Ramanbhai Patel College of Pharmacy',
    departments: [
      { code: 'PPT', name: 'Pharmaceutics and Pharmaceutical Technology' },
      { code: 'PCOL', name: 'Pharmacology' },
      { code: 'PCA', name: 'Pharmaceutical Chemistry and Analysis' },
      { code: 'PCOG', name: 'Pharmacognosy' }
    ]
  },
  {
    code: 'CMPICA',
    name: 'Smt. Chandaben Mohanbhai Patel Institute of Computer Applications',
    departments: [
      { code: 'CA', name: 'Computer Applications' }
    ]
  }
];

async function seed() {
  try {
    await connectToDatabase();
    console.log('\n--- Starting Seeding CHARUSAT Institutes and Departments ---');

    let totalInstitutes = 0;
    let totalDepartments = 0;

    for (const instData of charusatData) {
      // Upsert Institute
      let institute = await Institute.findOne({
        $or: [{ code: instData.code }, { name: instData.name }]
      });

      if (!institute) {
        institute = await Institute.create({
          code: instData.code,
          name: instData.name
        });
        console.log(`[+] Created Institute: ${institute.code} - ${institute.name}`);
      } else {
        institute.code = instData.code;
        institute.name = instData.name;
        await institute.save();
        console.log(`[~] Updated Institute: ${institute.code} - ${institute.name}`);
      }
      totalInstitutes++;

      // Upsert Departments under this Institute
      for (const deptData of instData.departments) {
        let dept = await Department.findOne({
          instituteId: institute._id,
          $or: [{ code: deptData.code }, { name: deptData.name }]
        });

        if (!dept) {
          dept = await Department.create({
            code: deptData.code,
            name: deptData.name,
            instituteId: institute._id
          });
          console.log(`    ├── [+] Created Department: [${dept.code}] ${dept.name}`);
        } else {
          dept.code = deptData.code;
          dept.name = deptData.name;
          dept.instituteId = institute._id;
          await dept.save();
          console.log(`    ├── [~] Updated Department: [${dept.code}] ${dept.name}`);
        }
        totalDepartments++;
      }
    }

    console.log('\n======================================================');
    console.log(` Seeding Complete!`);
    console.log(` Total Institutes Processed: ${totalInstitutes}`);
    console.log(` Total Departments Processed: ${totalDepartments}`);
    console.log('======================================================\n');

  } catch (error) {
    console.error('Error during seeding:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  }
}

seed();
