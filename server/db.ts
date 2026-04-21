import { connectToDatabase } from "./mongodb";
import {
  SeatingTable,
  Booking,
  Guest,
  EmailLog,
  WeddingConfig,
  ISeatingTable,
  IBooking,
  IGuest,
  IEmailLog,
  IWeddingConfig,
} from "./models";
import { nanoid } from "nanoid";
import { InsertUser } from "../drizzle/schema";
import { ENV } from "./_core/env";
import type { User } from "../drizzle/schema";

export type TableAvailability = {
  tableId: string;
  tableNumber: number;
  capacity: number;
  bookedSeats: number;
  availableSeats: number;
  status: "available" | "reserved" | "full";
};

let tablesSeeded = false;

// Initialize database connection and seed tables on first call
export async function initializeDB() {
  await connectToDatabase();
  if (!tablesSeeded) {
    await initializeSeatingTables(25);
    tablesSeeded = true;
  }
}

// ============ SEATING TABLES ============

export async function getAllSeatingTables() {
  await connectToDatabase();
  return SeatingTable.find().sort({ tableNumber: 1 });
}

export async function getSeatingTableById(id: string) {
  await connectToDatabase();
  return SeatingTable.findById(id);
}

export async function getSeatingTableByNumber(tableNumber: number) {
  await connectToDatabase();
  return SeatingTable.findOne({ tableNumber });
}

export async function createSeatingTable(data: {
  tableNumber: number;
  capacity: number;
}) {
  await connectToDatabase();
  const table = new SeatingTable(data);
  return table.save();
}

export async function updateSeatingTableStatus(
  id: string,
  status: "available" | "reserved" | "full"
) {
  await connectToDatabase();
  return SeatingTable.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );
}

export async function initializeSeatingTables(totalTables: number = 25) {
  await connectToDatabase();
  const existing = await SeatingTable.countDocuments();
  if (existing === 0) {
    const tables = Array.from({ length: totalTables }, (_, i) => ({
      tableNumber: i + 1,
      capacity: 10,
      status: "available" as const,
    }));
    return SeatingTable.insertMany(tables);
  }
  return null;
}

export async function getAvailableTablesForGuests(
  numberOfGuests: number
): Promise<TableAvailability[]> {
  await connectToDatabase();

  const tables = await SeatingTable.find().sort({ tableNumber: 1 }).lean();
  const bookingTotals = await Booking.aggregate<{
    _id: string;
    bookedSeats: number;
  }>([
    {
      $group: {
        _id: "$tableId",
        bookedSeats: { $sum: "$numberOfGuests" },
      },
    },
  ]);

  const bookedByTableId = new Map(
    bookingTotals.map(item => [item._id, item.bookedSeats])
  );

  return tables
    .map(table => {
      const tableId = String(table._id);
      const bookedSeats = bookedByTableId.get(tableId) ?? 0;
      const availableSeats = Math.max(table.capacity - bookedSeats, 0);

      return {
        tableId,
        tableNumber: table.tableNumber,
        capacity: table.capacity,
        bookedSeats,
        availableSeats,
        status: table.status,
      };
    })
    .filter(table => table.status !== "full" && table.availableSeats >= numberOfGuests);
}

// ============ BOOKINGS ============

export async function getAllBookings() {
  await connectToDatabase();
  return Booking.find()
    .populate("tableId")
    .sort({ createdAt: -1 });
}

export async function getBookingById(id: string) {
  await connectToDatabase();
  return Booking.findById(id).populate("tableId");
}

export async function getBookingsByTableId(tableId: string) {
  await connectToDatabase();
  return Booking.find({ tableId }).populate("tableId");
}

export async function getBookingByConfirmationCode(code: string) {
  await connectToDatabase();
  return Booking.findOne({ confirmationCode: code }).populate("tableId");
}

export async function createBooking(data: {
  tableId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  numberOfGuests: number;
  specialRequests?: string;
}) {
  await connectToDatabase();
  const confirmationCode = nanoid(12);
  const booking = new Booking({
    tableId: data.tableId,
    guestName: data.guestName,
    guestEmail: data.guestEmail,
    guestPhone: data.guestPhone,
    numberOfGuests: data.numberOfGuests,
    specialRequests: data.specialRequests,
    confirmationCode,
  });
  return booking.save();
}

export async function updateBooking(
  id: string,
  data: Partial<{
    guestName: string;
    guestEmail: string;
    guestPhone: string;
    numberOfGuests: number;
    specialRequests: string;
    emailSent: boolean;
  }>
) {
  await connectToDatabase();
  return Booking.findByIdAndUpdate(id, data, { new: true });
}

export async function deleteBooking(id: string) {
  await connectToDatabase();
  return Booking.findByIdAndDelete(id);
}

export async function getBookingsByEmail(email: string) {
  await connectToDatabase();
  return Booking.find({ guestEmail: email }).populate("tableId");
}

export async function getBookingsByName(name: string) {
  await connectToDatabase();
  const bookings = await Booking.find({ guestName: { $regex: name, $options: "i" } }).lean();
  const tableIds = [...new Set(bookings.map(b => b.tableId))];
  const tables = await SeatingTable.find({ _id: { $in: tableIds } }).lean();
  const tableMap = new Map(tables.map(t => [String(t._id), t.tableNumber]));
  return bookings.map(b => ({ ...b, tableNumber: tableMap.get(b.tableId) ?? null }));
}

// ============ GUESTS ============

export async function getGuestsByBookingId(bookingId: string) {
  await connectToDatabase();
  return Guest.find({ bookingId });
}

export async function createGuest(data: {
  bookingId: string;
  firstName: string;
  lastName: string;
  email?: string;
  dietaryRestrictions?: string;
}) {
  await connectToDatabase();
  const guest = new Guest(data);
  return guest.save();
}

export async function deleteGuestsByBookingId(bookingId: string) {
  await connectToDatabase();
  return Guest.deleteMany({ bookingId });
}

// ============ EMAIL LOGS ============

export async function createEmailLog(data: {
  bookingId?: string;
  recipientEmail: string;
  emailType: "confirmation" | "reminder" | "cancellation";
  subject: string;
  status: "sent" | "failed" | "pending";
}) {
  await connectToDatabase();
  const log = new EmailLog(data);
  return log.save();
}

export async function updateEmailLogStatus(
  id: string,
  status: "sent" | "failed" | "pending",
  sentAt?: Date
) {
  await connectToDatabase();
  return EmailLog.findByIdAndUpdate(
    id,
    { status, sentAt: sentAt || new Date() },
    { new: true }
  );
}

export async function getEmailLogsByBookingId(bookingId: string) {
  await connectToDatabase();
  return EmailLog.find({ bookingId });
}

// ============ WEDDING CONFIG ============

export async function getWeddingConfig() {
  await connectToDatabase();
  let config = await WeddingConfig.findOne();
  if (!config) {
    config = new WeddingConfig({
      groomName: "Anaclet Nsabimana",
      brideName: "Ingabire Claudone",
      eventDate: new Date(),
      totalTables: 25,
      guestCapacity: 200,
    });
    await config.save();
  }
  return config;
}

export async function updateWeddingConfig(data: Partial<IWeddingConfig>) {
  await connectToDatabase();
  let config = await WeddingConfig.findOne();
  if (!config) {
    config = new WeddingConfig(data);
  } else {
    Object.assign(config, data);
  }
  return config.save();
}

// ============ USER MANAGEMENT (for auth compatibility) ============
// Note: User management is handled by Manus OAuth and stored in MySQL
// These functions are placeholders for compatibility

export async function upsertUser(user: InsertUser): Promise<void> {
  // User management is handled by the auth system
  // This is a no-op for MongoDB-based wedding app
  return;
}

export async function getUserByOpenId(openId: string): Promise<User | undefined> {
  // User management is handled by the auth system
  return undefined;
}
