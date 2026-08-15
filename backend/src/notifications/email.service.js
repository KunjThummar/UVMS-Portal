const nodemailer = require("nodemailer");
const Student = require("../models/student.model");
const ApiError = require("../utils/ApiError");

function buildTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = String(process.env.SMTP_SECURE || "false").toLowerCase() === "true";
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error(
      "SMTP configuration is missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, and SMTP_PASS in .env"
    );
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass }
  });
}

async function sendMail({ to, bcc, subject, html }) {
  const validTo = Array.isArray(to) ? to.filter(Boolean) : to ? [to] : [];
  const validBcc = Array.isArray(bcc) ? bcc.filter(Boolean) : bcc ? [bcc] : [];

  if (!validTo.length && !validBcc.length) {
    return null;
  }

  const transporter = buildTransporter();
  const from = process.env.SMTP_FROM || `"UVMS" <${process.env.SMTP_USER}>`;

  return transporter.sendMail({
    from,
    to: validTo.length ? validTo.join(", ") : from,
    bcc: validBcc.length ? validBcc : undefined,
    subject,
    html
  });
}

async function notifyEligibleStudents(event) {
  if (!event || !event._id) {
    throw new ApiError(400, "Event data is required");
  }

  let students = [];

  if (event.eventLevel === "University") {
    students = await Student.find({}).select("email");
  }
  else if (event.eventLevel === "Institute") {
    const instituteIds = Array.isArray(event.targetInstituteIds)
      ? event.targetInstituteIds
      : event.targetInstituteIds
        ? [event.targetInstituteIds]
        : [];

    if (!instituteIds.length) {
      return 0;
    }

    students = await Student.find({ instituteId: { $in: instituteIds } }).select("email");
  }
  else if (event.eventLevel === "Department") {
    const departmentIds = Array.isArray(event.targetDepartmentIds)
      ? event.targetDepartmentIds
      : [];

    if (!departmentIds.length) {
      return 0;
    }

    students = await Student.find({ departmentId: { $in: departmentIds } }).select("email");
  }
  else {
    throw new ApiError(400, `Unsupported event level: ${event.eventLevel}`);
  }

  const recipients = [...new Set(students.map((student) => student.email).filter(Boolean))];

  if (!recipients.length) {
    return 0;
  }

  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
      <h2>${event.title || "Volunteer Opportunity"}</h2>
      <p><strong>Event Level:</strong> ${event.eventLevel}</p>
      <p><strong>Description:</strong> ${event.description || "No description provided."}</p>
      <p><strong>Event Date:</strong> ${new Date(event.eventDate).toLocaleString()}</p>
      <p><strong>Application Deadline:</strong> ${new Date(event.applicationDeadline).toLocaleString()}</p>
      <p><strong>Capacity:</strong> ${event.volunteerCapacity || 0}</p>
      <p>We invite eligible students to apply before the deadline.</p>
      <p>
        <a href="${process.env.CLIENT_URL || "#"}">Apply Now</a> 
      </p>
    </div>
  `;
   // here work is not completed in link 

  await sendMail({
    to: process.env.SMTP_FROM || process.env.SMTP_USER,
    bcc: recipients,
    subject: `New Opportunity: ${event.title || "Volunteer Event"}`,
    html
  });

  return recipients.length;
}

module.exports = {
  sendMail,
  notifyEligibleStudents
};
