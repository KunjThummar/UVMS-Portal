const ExcelJS = require('exceljs');

const styleHeaderRow = (row, bgColor = '2563EB') => {
  row.eachCell((cell) => {
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: bgColor }
    };
    cell.font = { bold: true, color: { argb: 'FFFFFF' }, size: 11 };
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
    cell.border = {
      top: { style: 'thin', color: { argb: 'CBD5E1' } },
      bottom: { style: 'thin', color: { argb: 'CBD5E1' } },
      left: { style: 'thin', color: { argb: 'CBD5E1' } },
      right: { style: 'thin', color: { argb: 'CBD5E1' } }
    };
  });
  row.height = 26;
};

const autoFitColumns = (worksheet) => {
  worksheet.columns.forEach((col) => {
    let maxLength = 10;
    col.eachCell({ includeEmpty: true }, (cell) => {
      const val = cell.value ? cell.value.toString() : '';
      if (val.length > maxLength) {
        maxLength = Math.min(val.length, 50);
      }
    });
    col.width = maxLength + 3;
  });
};

/**
 * Generate Master Excel Workbook for Events (filtered by Academic Year)
 */
async function generateEventsMasterWorkbook(events, academicYearLabel = '') {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CHARUSAT UVMS Portal';
  workbook.created = new Date();

  const sheetName = academicYearLabel ? `Events AY ${academicYearLabel}` : 'University Events';
  const worksheet = workbook.addWorksheet(sheetName.slice(0, 31), {
    views: [{ state: 'frozen', ySplit: 1 }]
  });

  worksheet.columns = [
    { header: 'Event Title', key: 'title', width: 28 },
    { header: 'Academic Year', key: 'academicYear', width: 14 },
    { header: 'Event Level', key: 'eventLevel', width: 14 },
    { header: 'Event Type', key: 'eventType', width: 14 },
    { header: 'Mode', key: 'eventMode', width: 10 },
    { header: 'Status', key: 'status', width: 16 },
    { header: 'Start Date', key: 'eventDate', width: 14 },
    { header: 'End Date', key: 'eventEndDate', width: 14 },
    { header: 'Duration (Days)', key: 'eventDay', width: 14 },
    { header: 'Application Deadline', key: 'applicationDeadline', width: 18 },
    { header: 'Capacity', key: 'volunteerCapacity', width: 10 },
    { header: 'Approved Volunteers', key: 'approvedCount', width: 18 },
    { header: 'Remaining Slots', key: 'remainingSlots', width: 14 },
    { header: 'Organizer Institute', key: 'organizer', width: 22 },
    { header: 'Department', key: 'subOrganizer', width: 22 },
    { header: 'Target Institutes', key: 'targetInstitutes', width: 24 },
    { header: 'Target Departments', key: 'targetDepartments', width: 24 },
    { header: 'Faculty Coordinator', key: 'coordinatorName', width: 22 },
    { header: 'Coordinator Email', key: 'coordinatorEmail', width: 24 },
    { header: 'Archived', key: 'isArchived', width: 10 },
    { header: 'Created Date', key: 'createdAt', width: 16 },
    { header: 'Description', key: 'description', width: 45 }
  ];

  styleHeaderRow(worksheet.getRow(1));

  events.forEach((ev) => {
    const targetInst = (ev.targetInstituteIds || []).map((i) => i.name || i.code || i).join(', ');
    const targetDept = (ev.targetDepartmentIds || []).map((d) => d.name || d.code || d).join(', ');
    const capacity = ev.volunteerCapacity || 0;
    const approved = ev.approvedCount || 0;
    const remaining = Math.max(0, capacity - approved);

    const row = worksheet.addRow({
      title: ev.title,
      academicYear: ev.academicYear || '',
      eventLevel: ev.eventLevel,
      eventType: ev.eventType,
      eventMode: ev.eventMode ? ev.eventMode.toUpperCase() : 'OFFLINE',
      status: ev.status,
      eventDate: ev.eventDate ? new Date(ev.eventDate).toLocaleDateString() : '',
      eventEndDate: ev.eventEndDate ? new Date(ev.eventEndDate).toLocaleDateString() : '',
      eventDay: ev.eventDay || 1,
      applicationDeadline: ev.applicationDeadline ? new Date(ev.applicationDeadline).toLocaleDateString() : '',
      volunteerCapacity: capacity,
      approvedCount: approved,
      remainingSlots: remaining,
      organizer: ev.organizer || '',
      subOrganizer: ev.subOrganizer || '',
      targetInstitutes: targetInst || 'All Eligible',
      targetDepartments: targetDept || 'All Eligible',
      coordinatorName: ev.createdBy?.fullName || 'N/A',
      coordinatorEmail: ev.createdBy?.email || 'N/A',
      isArchived: ev.isArchived ? 'Yes' : 'No',
      createdAt: ev.createdAt ? new Date(ev.createdAt).toLocaleDateString() : '',
      description: ev.description || ''
    });

    row.alignment = { vertical: 'middle' };
  });

  autoFitColumns(worksheet);
  return workbook;
}

module.exports = {
  generateEventsMasterWorkbook
};
