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
    const rawInstituteIds = Array.isArray(event.targetInstituteIds)
      ? event.targetInstituteIds
      : event.targetInstituteIds
        ? [event.targetInstituteIds]
        : [];
    const instituteIds = rawInstituteIds.map((inst) => inst._id || inst);

    if (!instituteIds.length) {
      return 0;
    }

    students = await Student.find({ instituteId: { $in: instituteIds } }).select("email");
  }
  else if (event.eventLevel === "Department") {
    const rawDepartmentIds = Array.isArray(event.targetDepartmentIds)
      ? event.targetDepartmentIds
      : [];
    const departmentIds = rawDepartmentIds.map((dept) => dept._id || dept);

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

  const formattedStartDate = new Date(event.eventDate).toLocaleDateString();
  const formattedEndDate = event.eventEndDate ? new Date(event.eventEndDate).toLocaleDateString() : formattedStartDate;
  const eventModeDisplay = event.eventMode ? (event.eventMode.charAt(0).toUpperCase() + event.eventMode.slice(1)) : 'Offline';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Volunteer Opportunity</title>
</head>

<body style="
  margin: 0;
  padding: 0;
  background-color: #f4f7fb;
  font-family: Arial, Helvetica, sans-serif;
  color: #1f2937;
">

  <table width="100%" cellpadding="0" cellspacing="0" border="0"
    style="background-color: #f4f7fb; padding: 30px 15px;">

    <tr>
      <td align="center">

        <!-- Main Container -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="
            max-width: 650px;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 15px rgba(0,0,0,0.08);
          ">       
          <!-- Header -->
          <tr>
            <td style="
              background-color: #123e6a;
              padding: 24px 30px;
              text-align: center;
            ">
          
              <img
                src="https://admission.charusat.ac.in/View%20Assets/MainPage/assets/charusat%20images/logo.png"
                alt="CHARUSAT Logo"
                style="
                  width: 180px;
                  max-width: 100%;
                  height: auto;
                  display: block;
                  margin: 0 auto 15px auto;
                "
              />
          
              <div style="
                color: #ffffff;
                font-size: 22px;
                font-weight: bold;
              ">
                University Volunteer Management System
              </div>
          
              <div style="
                color: #dbeafe;
                font-size: 13px;
                margin-top: 6px;
              ">
                Volunteer Opportunity
              </div>
          
            </td>
          </tr>
                    <!-- Main Content -->
                    <tr>
            <td style="padding: 30px;">

              <h2 style="
                margin: 0 0 10px 0;
                color: #123e6a;
                font-size: 24px;
              ">
                ${event.title || "Volunteer Opportunity"}
              </h2>

              <p style="
                margin: 0 0 24px 0;
                color: #6b7280;
                font-size: 14px;
              ">
                A new volunteering opportunity is available for eligible students.
              </p>

              <!-- Event Information -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="
                  border: 1px solid #e5e7eb;
                  border-radius: 8px;
                  overflow: hidden;
                ">

                <tr>
                  <td colspan="2" style="
                    background-color: #f8fafc;
                    padding: 14px 16px;
                    color: #123e6a;
                    font-size: 16px;
                    font-weight: bold;
                  ">
                    Event Details
                  </td>
                </tr>

                <tr>
                  <td width="38%" style="
                    padding: 11px 16px;
                    color: #6b7280;
                    font-size: 14px;
                    border-top: 1px solid #e5e7eb;
                  ">
                    Organizer
                  </td>

                  <td style="
                    padding: 11px 16px;
                    color: #1f2937;
                    font-size: 14px;
                    font-weight: 600;
                    border-top: 1px solid #e5e7eb;
                  ">
                    ${event.organizer || "University"}
                    ${event.subOrganizer ? ` - ${event.subOrganizer}` : ""}
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding: 11px 16px;
                    color: #6b7280;
                    font-size: 14px;
                    border-top: 1px solid #e5e7eb;
                  ">
                    Event Type
                  </td>

                  <td style="
                    padding: 11px 16px;
                    color: #1f2937;
                    font-size: 14px;
                    border-top: 1px solid #e5e7eb;
                  ">
                    ${event.eventType || "Event"}
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding: 11px 16px;
                    color: #6b7280;
                    font-size: 14px;
                    border-top: 1px solid #e5e7eb;
                  ">
                    Mode
                  </td>

                  <td style="
                    padding: 11px 16px;
                    color: #1f2937;
                    font-size: 14px;
                    border-top: 1px solid #e5e7eb;
                  ">
                    ${eventModeDisplay}
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding: 11px 16px;
                    color: #6b7280;
                    font-size: 14px;
                    border-top: 1px solid #e5e7eb;
                  ">
                    Academic Year
                  </td>

                  <td style="
                    padding: 11px 16px;
                    color: #1f2937;
                    font-size: 14px;
                    border-top: 1px solid #e5e7eb;
                  ">
                    ${event.academicYear || "N/A"}
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding: 11px 16px;
                    color: #6b7280;
                    font-size: 14px;
                    border-top: 1px solid #e5e7eb;
                  ">
                    Event Level
                  </td>

                  <td style="
                    padding: 11px 16px;
                    color: #1f2937;
                    font-size: 14px;
                    border-top: 1px solid #e5e7eb;
                  ">
                    ${event.eventLevel || "N/A"}
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding: 11px 16px;
                    color: #6b7280;
                    font-size: 14px;
                    border-top: 1px solid #e5e7eb;
                  ">
                    Event Dates
                  </td>

                  <td style="
                    padding: 11px 16px;
                    color: #1f2937;
                    font-size: 14px;
                    border-top: 1px solid #e5e7eb;
                  ">
                    ${formattedStartDate} to ${formattedEndDate}
                    (${event.eventDay || 1}
                    ${(event.eventDay || 1) > 1 ? "Days" : "Day"})
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding: 11px 16px;
                    color: #6b7280;
                    font-size: 14px;
                    border-top: 1px solid #e5e7eb;
                  ">
                    Application Deadline
                  </td>

                  <td style="
                    padding: 11px 16px;
                    color: #c2410c;
                    font-size: 14px;
                    font-weight: bold;
                    border-top: 1px solid #e5e7eb;
                  ">
                    ${new Date(event.applicationDeadline).toLocaleString()}
                  </td>
                </tr>

                <tr>
                  <td style="
                    padding: 11px 16px;
                    color: #6b7280;
                    font-size: 14px;
                    border-top: 1px solid #e5e7eb;
                  ">
                    Volunteer Capacity
                  </td>

                  <td style="
                    padding: 11px 16px;
                    color: #1f2937;
                    font-size: 14px;
                    border-top: 1px solid #e5e7eb;
                  ">
                    ${event.volunteerCapacity || 0} Slots
                  </td>
                </tr>

              </table>

              <!-- Description -->
              <div style="margin-top: 25px;">

                <h3 style="
                  margin: 0 0 8px 0;
                  color: #123e6a;
                  font-size: 17px;
                ">
                  About the Event
                </h3>

                <p style="
                  margin: 0;
                  color: #4b5563;
                  font-size: 14px;
                  line-height: 1.7;
                ">
                  ${event.description || "No description provided."}
                </p>

              </div>

              <!-- CTA -->
              <div style="
                text-align: center;
                margin: 30px 0 15px 0;
              ">

                <a
                  href="${process.env.CLIENT_URL || "#"}"
                  style="
                    display: inline-block;
                    background-color: #f47920;
                    color: #ffffff;
                    text-decoration: none;
                    font-size: 15px;
                    font-weight: bold;
                    padding: 13px 30px;
                    border-radius: 6px;
                  "
                >
                  Apply Now
                </a>

              </div>

              <p style="
                text-align: center;
                margin: 12px 0 0 0;
                color: #6b7280;
                font-size: 13px;
              ">
                We encourage eligible students to apply before the application deadline.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="
              background-color: #f8fafc;
              border-top: 1px solid #e5e7eb;
              padding: 20px 30px;
              text-align: center;
            ">

              <p style="
                margin: 0 0 6px 0;
                color: #123e6a;
                font-size: 14px;
                font-weight: bold;
              ">
                University Volunteer Management System
              </p>

              <p style="
                margin: 0;
                color: #9ca3af;
                font-size: 12px;
                line-height: 1.5;
              ">
                This is an automated email. Please do not reply directly to this message.
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>

  </table>

</body>
</html>
  `;

  // const html = `
  //   <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #1f2937;">
  //     <h2>${event.title || "Volunteer Opportunity"}</h2>
  //     <p><strong>Event Level:</strong> ${event.eventLevel}</p>
  //     <p><strong>Description:</strong> ${event.description || "No description provided."}</p>
  //     <p><strong>Event Date:</strong> ${new Date(event.eventDate).toLocaleString()}</p>
  //     <p><strong>Application Deadline:</strong> ${new Date(event.applicationDeadline).toLocaleString()}</p>
  //     <p><strong>Capacity:</strong> ${event.volunteerCapacity || 0}</p>
  //     <p>We invite eligible students to apply before the deadline.</p>
  //     <p>
  //       <a href="${process.env.CLIENT_URL || "#"}">Apply Now</a> 
  //     </p>
  //   </div>
  // `;
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
