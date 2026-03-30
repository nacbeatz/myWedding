import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import * as db from "../db";
import { initializeDB } from "../db";

export const weddingRouter = router({
  // Initialize seating tables
  initializeTables: publicProcedure.mutation(async () => {
    await initializeDB();
    return db.initializeSeatingTables(25);
  }),

  // Get all seating tables
  getTables: publicProcedure.query(async () => {
    await initializeDB();
    return db.getAllSeatingTables();
  }),

  // Get table by number
  getTableByNumber: publicProcedure
    .input(z.object({ tableNumber: z.number().min(1).max(25) }))
    .query(async ({ input }) => {
      await initializeDB();
      return db.getSeatingTableByNumber(input.tableNumber);
    }),

  // Get bookings for a table
  getTableBookings: publicProcedure
    .input(z.object({ tableId: z.string() }))
    .query(async ({ input }) => {
      await initializeDB();
      return db.getBookingsByTableId(input.tableId);
    }),

  // Get tables that can fit the provided guest count
  getAvailableTables: publicProcedure
    .input(z.object({ numberOfGuests: z.number().min(1).max(10) }))
    .query(async ({ input }) => {
      await initializeDB();
      return db.getAvailableTablesForGuests(input.numberOfGuests);
    }),

  // Create a booking
  createBooking: publicProcedure
    .input(
      z.object({
        tableId: z.string(),
        guestName: z.string().min(1),
        guestEmail: z.string().email(),
        guestPhone: z.string().optional(),
        numberOfGuests: z.number().min(1).max(10),
        specialRequests: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await initializeDB();
      const availableTables = await db.getAvailableTablesForGuests(
        input.numberOfGuests
      );
      const isTableAvailable = availableTables.some(
        table => table.tableId === input.tableId
      );

      if (!isTableAvailable) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message:
            "Selected table does not have enough available seats for this booking.",
        });
      }

      const booking = await db.createBooking(input);

      // Log email sent
      await db.createEmailLog({
        bookingId: booking._id?.toString(),
        recipientEmail: input.guestEmail,
        emailType: "confirmation",
        subject: `Your Wedding Table Booking Confirmation - Table ${input.tableId}`,
        status: "pending",
      });

      return booking;
    }),

  // Get booking by confirmation code
  getBookingByCode: publicProcedure
    .input(z.object({ code: z.string() }))
    .query(async ({ input }) => {
      await initializeDB();
      return db.getBookingByConfirmationCode(input.code);
    }),

  // Get bookings by email
  getBookingsByEmail: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .query(async ({ input }) => {
      await initializeDB();
      return db.getBookingsByEmail(input.email);
    }),

  // Get wedding config
  getWeddingConfig: publicProcedure.query(async () => {
    await initializeDB();
    return db.getWeddingConfig();
  }),

  // Update wedding config
  updateWeddingConfig: publicProcedure
    .input(
      z.object({
        groomName: z.string().optional(),
        brideName: z.string().optional(),
        eventDate: z.date().optional(),
        eventLocation: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await initializeDB();
      return db.updateWeddingConfig(input);
    }),

  // Get all bookings (admin)
  getAllBookings: publicProcedure.query(async () => {
    await initializeDB();
    return db.getAllBookings();
  }),

  // Update booking (admin)
  updateBooking: publicProcedure
    .input(
      z.object({
        id: z.string(),
        guestName: z.string().optional(),
        guestEmail: z.string().email().optional(),
        numberOfGuests: z.number().optional(),
        specialRequests: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await initializeDB();
      const { id, ...data } = input;
      return db.updateBooking(id, data);
    }),

  // Delete booking (admin)
  deleteBooking: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await initializeDB();
      return db.deleteBooking(input.id);
    }),

  // Get guests for a booking
  getGuestsForBooking: publicProcedure
    .input(z.object({ bookingId: z.string() }))
    .query(async ({ input }) => {
      await initializeDB();
      return db.getGuestsByBookingId(input.bookingId);
    }),

  // Add guest to booking
  addGuest: publicProcedure
    .input(
      z.object({
        bookingId: z.string(),
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        email: z.string().email().optional(),
        dietaryRestrictions: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      await initializeDB();
      return db.createGuest(input);
    }),
});
