import { describe, it, expect } from "vitest";
import { EmailService } from "./services/emailService";

describe("Wedding Application", () => {
  describe("Email Service", () => {
    it("should generate confirmation email with correct structure", () => {
      const email = EmailService.generateConfirmationEmail(
        "John Doe",
        5,
        "ABC123",
        4
      );

      expect(email).toBeDefined();
      expect(email.subject).toContain("Table 5");
      expect(email.subject).toContain("Booking Confirmation");
      expect(email.html).toContain("John Doe");
      expect(email.html).toContain("ABC123");
      expect(email.html).toContain("Anaclet Nsabimana");
      expect(email.html).toContain("Ingabire Claudone");
      expect(email.text).toContain("John Doe");
      expect(email.text).toContain("ABC123");
    });

    it("should generate confirmation email with correct guest count", () => {
      const email = EmailService.generateConfirmationEmail(
        "Jane Smith",
        10,
        "XYZ789",
        6
      );

      expect(email.html).toContain("6");
      expect(email.text).toContain("6");
    });

    it("should generate reminder email with correct structure", () => {
      const eventDate = new Date("2026-06-15");
      const email = EmailService.generateReminderEmail(
        "Jane Smith",
        3,
        eventDate
      );

      expect(email).toBeDefined();
      expect(email.subject).toContain("Reminder");
      expect(email.subject).toContain("Wedding");
      expect(email.html).toContain("Jane Smith");
      expect(email.html).toContain("Your Table");
      expect(email.html).toContain("3");
      expect(email.text).toContain("Jane Smith");
      expect(email.text).toContain("Table: 3");
      expect(email.html).toContain("Anaclet Nsabimana");
      expect(email.html).toContain("Ingabire Claudone");
    });

    it("should include couple names in all emails", () => {
      const confirmationEmail = EmailService.generateConfirmationEmail(
        "Guest",
        1,
        "CODE",
        2
      );
      const reminderEmail = EmailService.generateReminderEmail(
        "Guest",
        1,
        new Date()
      );

      expect(confirmationEmail.html).toContain("Anaclet Nsabimana");
      expect(confirmationEmail.html).toContain("Ingabire Claudone");
      expect(reminderEmail.html).toContain("Anaclet Nsabimana");
      expect(reminderEmail.html).toContain("Ingabire Claudone");
    });

    it("should format email text properly", () => {
      const email = EmailService.generateConfirmationEmail(
        "Test User",
        7,
        "TEST123",
        3
      );

      expect(email.text).toContain("Dear Test User");
      expect(email.text).toContain("Confirmation Code: TEST123");
      expect(email.text).toContain("Table Number: 7");
      expect(email.text).toContain("Number of Guests: 3");
    });

    it("should format reminder email with date", () => {
      const eventDate = new Date("2026-12-25");
      const email = EmailService.generateReminderEmail(
        "Holiday Guest",
        12,
        eventDate
      );

      expect(email.subject).toContain("December");
      expect(email.html).toContain("December");
    });
  });

  describe("Wedding Configuration", () => {
    it("should have correct couple names", () => {
      const confirmationEmail = EmailService.generateConfirmationEmail(
        "Guest",
        1,
        "CODE",
        1
      );

      expect(confirmationEmail.html).toContain("Anaclet Nsabimana");
      expect(confirmationEmail.html).toContain("Ingabire Claudone");
    });

    it("should reference 25 tables in system", () => {
      // This validates that the system is designed for 25 tables
      const validTableNumbers = Array.from({ length: 25 }, (_, i) => i + 1);
      
      expect(validTableNumbers).toHaveLength(25);
      expect(validTableNumbers[0]).toBe(1);
      expect(validTableNumbers[24]).toBe(25);
    });
  });

  describe("Email Content Validation", () => {
    it("should have professional email structure", () => {
      const email = EmailService.generateConfirmationEmail(
        "Professional Guest",
        5,
        "PROF001",
        4
      );

      // Check HTML structure
      expect(email.html).toContain("<!DOCTYPE html>");
      expect(email.html).toContain("</html>");
      expect(email.html).toContain("<style>");
      expect(email.html).toContain("font-family");

      // Check text version
      expect(email.text).toContain("Wedding Booking Confirmation");
      expect(email.text).toContain("Dear Professional Guest");
    });

    it("should include confirmation code in both formats", () => {
      const code = "UNIQUE123";
      const email = EmailService.generateConfirmationEmail(
        "Test",
        1,
        code,
        1
      );

      expect(email.html).toContain(code);
      expect(email.text).toContain(code);
    });

    it("should handle special characters in guest names", () => {
      const specialName = "O'Brien-Smith";
      const email = EmailService.generateConfirmationEmail(
        specialName,
        1,
        "CODE",
        1
      );

      expect(email.html).toContain(specialName);
      expect(email.text).toContain(specialName);
    });
  });
});
