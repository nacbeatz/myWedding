import * as db from "../db";

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private static readonly GROOM_NAME = "Anaclet Nsabimana";
  private static readonly BRIDE_NAME = "Ingabire Claudone";

  static generateConfirmationEmail(
    guestName: string,
    tableNumber: number,
    confirmationCode: string,
    numberOfGuests: number
  ): EmailTemplate {
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Lora', Georgia, serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; color: #b8860b; margin-bottom: 30px; }
            .content { background: #f5f5f0; padding: 30px; border-radius: 8px; }
            .confirmation-box { background: white; padding: 20px; border-left: 4px solid #b8860b; margin: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${this.GROOM_NAME} & ${this.BRIDE_NAME}</h1>
              <p>Wedding Celebration</p>
            </div>
            
            <div class="content">
              <p>Dear ${guestName},</p>
              
              <p>Thank you for booking your table at our wedding! We're delighted to have you celebrate this special day with us.</p>
              
              <div class="confirmation-box">
                <h3>Booking Confirmation</h3>
                <p><strong>Confirmation Code:</strong> ${confirmationCode}</p>
                <p><strong>Table Number:</strong> ${tableNumber}</p>
                <p><strong>Number of Guests:</strong> ${numberOfGuests}</p>
              </div>
              
              <p>Please save your confirmation code for your records. If you need to make any changes to your booking, please contact us with this code.</p>
              
              <p>We look forward to celebrating with you!</p>
              
              <p>Warm regards,<br>${this.GROOM_NAME} & ${this.BRIDE_NAME}</p>
            </div>
            
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Wedding Booking Confirmation

Dear ${guestName},

Thank you for booking your table at our wedding! We're delighted to have you celebrate this special day with us.

Booking Confirmation:
Confirmation Code: ${confirmationCode}
Table Number: ${tableNumber}
Number of Guests: ${numberOfGuests}

Please save your confirmation code for your records. If you need to make any changes to your booking, please contact us with this code.

We look forward to celebrating with you!

Warm regards,
${this.GROOM_NAME} & ${this.BRIDE_NAME}
    `;

    return {
      subject: `Your Wedding Table Booking Confirmation - Table ${tableNumber}`,
      html,
      text,
    };
  }

  static generateReminderEmail(
    guestName: string,
    tableNumber: number,
    eventDate: Date
  ): EmailTemplate {
    const formattedDate = eventDate.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: 'Lora', Georgia, serif; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; color: #b8860b; margin-bottom: 30px; }
            .content { background: #f5f5f0; padding: 30px; border-radius: 8px; }
            .reminder-box { background: white; padding: 20px; border-left: 4px solid #b8860b; margin: 20px 0; }
            .footer { text-align: center; color: #999; font-size: 12px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${this.GROOM_NAME} & ${this.BRIDE_NAME}</h1>
              <p>Wedding Celebration</p>
            </div>
            
            <div class="content">
              <p>Dear ${guestName},</p>
              
              <p>We're excited to remind you that our wedding is coming up soon!</p>
              
              <div class="reminder-box">
                <h3>Event Details</h3>
                <p><strong>Date:</strong> ${formattedDate}</p>
                <p><strong>Your Table:</strong> ${tableNumber}</p>
              </div>
              
              <p>We can't wait to celebrate with you and our loved ones. Please arrive on time and don't hesitate to reach out if you have any questions.</p>
              
              <p>See you soon!</p>
              
              <p>Warm regards,<br>${this.GROOM_NAME} & ${this.BRIDE_NAME}</p>
            </div>
            
            <div class="footer">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const text = `
Wedding Reminder

Dear ${guestName},

We're excited to remind you that our wedding is coming up soon!

Event Details:
Date: ${formattedDate}
Your Table: ${tableNumber}

We can't wait to celebrate with you and our loved ones. Please arrive on time and don't hesitate to reach out if you have any questions.

See you soon!

Warm regards,
${this.GROOM_NAME} & ${this.BRIDE_NAME}
    `;

    return {
      subject: `Reminder: ${this.GROOM_NAME} & ${this.BRIDE_NAME}'s Wedding on ${formattedDate}`,
      html,
      text,
    };
  }

  static async sendConfirmationEmail(
    bookingId: string,
    guestName: string,
    guestEmail: string,
    tableNumber: number,
    confirmationCode: string,
    numberOfGuests: number
  ): Promise<boolean> {
    try {
      const template = this.generateConfirmationEmail(
        guestName,
        tableNumber,
        confirmationCode,
        numberOfGuests
      );

      // Log the email
      await db.createEmailLog({
        bookingId,
        recipientEmail: guestEmail,
        emailType: "confirmation",
        subject: template.subject,
        status: "sent",
      });

      // In production, integrate with SendGrid, AWS SES, or similar
      console.log(`[Email] Confirmation sent to ${guestEmail}`);
      console.log(`Subject: ${template.subject}`);

      return true;
    } catch (error) {
      console.error("Failed to send confirmation email:", error);
      await db.createEmailLog({
        bookingId,
        recipientEmail: guestEmail,
        emailType: "confirmation",
        subject: `Booking Confirmation - Table ${tableNumber}`,
        status: "failed",
      });
      return false;
    }
  }

  static async sendReminderEmail(
    bookingId: string,
    guestName: string,
    guestEmail: string,
    tableNumber: number,
    eventDate: Date
  ): Promise<boolean> {
    try {
      const template = this.generateReminderEmail(
        guestName,
        tableNumber,
        eventDate
      );

      // Log the email
      await db.createEmailLog({
        bookingId,
        recipientEmail: guestEmail,
        emailType: "reminder",
        subject: template.subject,
        status: "sent",
      });

      // In production, integrate with SendGrid, AWS SES, or similar
      console.log(`[Email] Reminder sent to ${guestEmail}`);
      console.log(`Subject: ${template.subject}`);

      return true;
    } catch (error) {
      console.error("Failed to send reminder email:", error);
      await db.createEmailLog({
        bookingId,
        recipientEmail: guestEmail,
        emailType: "reminder",
        subject: `Wedding Reminder - Table ${tableNumber}`,
        status: "failed",
      });
      return false;
    }
  }
}
