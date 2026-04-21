import { Router, Request, Response } from "express";
import * as db from "../db";
import { initializeDB } from "../db";

const router = Router();

const wrap = (fn: (req: Request, res: Response) => Promise<void>) =>
  async (req: Request, res: Response) => {
    try {
      await initializeDB();
      await fn(req, res);
    } catch (err: any) {
      console.error("[Wedding API]", err.message);
      if (!res.headersSent) {
        res.status(500).json({ error: err.message ?? "Internal server error" });
      }
    }
  };

// GET /api/wedding/tables
router.get("/tables", wrap(async (_req, res) => {
  const tables = await db.getAllSeatingTables();
  res.json(tables);
}));

// GET /api/wedding/tables/available?numberOfGuests=N
router.get("/tables/available", wrap(async (req, res) => {
  const n = Math.max(1, parseInt(String(req.query.numberOfGuests)) || 1);
  const tables = await db.getAvailableTablesForGuests(n);
  res.json(tables);
}));

// GET /api/wedding/bookings/search?name=X
router.get("/bookings/search", wrap(async (req, res) => {
  const name = String(req.query.name ?? "").trim();
  if (!name) return void res.status(400).json({ error: "name query param is required" });
  const bookings = await db.getBookingsByName(name);
  res.json(bookings);
}));

// GET /api/wedding/bookings/by-email?email=X
router.get("/bookings/by-email", wrap(async (req, res) => {
  const email = String(req.query.email ?? "").trim();
  if (!email) return void res.status(400).json({ error: "email query param is required" });
  const bookings = await db.getBookingsByEmail(email);
  res.json(bookings);
}));

// GET /api/wedding/bookings/by-code/:code
router.get("/bookings/by-code/:code", wrap(async (req, res) => {
  const booking = await db.getBookingByConfirmationCode(req.params.code);
  if (!booking) return void res.status(404).json({ error: "Booking not found" });
  res.json(booking);
}));

// POST /api/wedding/bookings
router.post("/bookings", wrap(async (req, res) => {
  const { tableId, guestName, guestEmail, guestPhone, numberOfGuests, specialRequests } = req.body;
  if (!tableId || !guestName || !guestEmail || !numberOfGuests) {
    return void res.status(400).json({ error: "tableId, guestName, guestEmail and numberOfGuests are required" });
  }

  const available = await db.getAvailableTablesForGuests(Number(numberOfGuests));
  if (!available.some(t => t.tableId === tableId)) {
    return void res.status(400).json({ error: "Selected table does not have enough available seats for this booking." });
  }

  const booking = await db.createBooking({ tableId, guestName, guestEmail, guestPhone, numberOfGuests: Number(numberOfGuests), specialRequests });

  await db.createEmailLog({
    bookingId: (booking as any)._id?.toString(),
    recipientEmail: guestEmail,
    emailType: "confirmation",
    subject: `Wedding Booking Confirmation`,
    status: "pending",
  });

  res.status(201).json(booking);
}));

// GET /api/wedding/config
router.get("/config", wrap(async (_req, res) => {
  const config = await db.getWeddingConfig();
  res.json(config);
}));

// Admin
router.get("/admin/bookings", wrap(async (_req, res) => {
  res.json(await db.getAllBookings());
}));

router.put("/admin/bookings/:id", wrap(async (req, res) => {
  res.json(await db.updateBooking(req.params.id, req.body));
}));

router.delete("/admin/bookings/:id", wrap(async (req, res) => {
  await db.deleteBooking(req.params.id);
  res.json({ success: true });
}));

export default router;
