import mongoose, { Schema, Document } from "mongoose";

// Wedding Configuration
export interface IWeddingConfig extends Document {
  groomName: string;
  brideName: string;
  eventDate: Date;
  eventLocation?: string;
  totalTables: number;
  guestCapacity: number;
  createdAt: Date;
  updatedAt: Date;
}

const weddingConfigSchema = new Schema<IWeddingConfig>(
  {
    groomName: { type: String, required: true },
    brideName: { type: String, required: true },
    eventDate: { type: Date, required: true },
    eventLocation: { type: String },
    totalTables: { type: Number, required: true, default: 25 },
    guestCapacity: { type: Number, required: true, default: 200 },
  },
  { timestamps: true }
);

export const WeddingConfig =
  mongoose.models.WeddingConfig ||
  mongoose.model<IWeddingConfig>("WeddingConfig", weddingConfigSchema);

// Seating Tables
export interface ISeatingTable extends Document {
  tableNumber: number;
  capacity: number;
  status: "available" | "reserved" | "full";
  createdAt: Date;
  updatedAt: Date;
}

const seatingTableSchema = new Schema<ISeatingTable>(
  {
    tableNumber: { type: Number, required: true, unique: true },
    capacity: { type: Number, required: true, default: 10 },
    status: {
      type: String,
      enum: ["available", "reserved", "full"],
      default: "available",
    },
  },
  { timestamps: true }
);

export const SeatingTable =
  mongoose.models.SeatingTable ||
  mongoose.model<ISeatingTable>("SeatingTable", seatingTableSchema);

// Bookings
export interface IBooking extends Document {
  tableId: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  numberOfGuests: number;
  specialRequests?: string;
  confirmationCode: string;
  emailSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    tableId: {
      type: String,
      required: true,
    },
    guestName: { type: String, required: true },
    guestEmail: { type: String, required: true },
    guestPhone: { type: String },
    numberOfGuests: { type: Number, required: true, default: 1 },
    specialRequests: { type: String },
    confirmationCode: { type: String, required: true, unique: true },
    emailSent: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Booking =
  mongoose.models.Booking ||
  mongoose.model<IBooking>("Booking", bookingSchema);

// Guests
export interface IGuest extends Document {
  bookingId: string;
  firstName: string;
  lastName: string;
  email?: string;
  dietaryRestrictions?: string;
  createdAt: Date;
}

const guestSchema = new Schema<IGuest>(
  {
    bookingId: {
      type: String,
      required: true,
    },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String },
    dietaryRestrictions: { type: String },
  },
  { timestamps: true }
);

export const Guest =
  mongoose.models.Guest ||
  mongoose.model<IGuest>("Guest", guestSchema);

// Email Logs
export interface IEmailLog extends Document {
  bookingId?: string;
  recipientEmail: string;
  emailType: "confirmation" | "reminder" | "cancellation";
  subject: string;
  status: "sent" | "failed" | "pending";
  sentAt?: Date;
  createdAt: Date;
}

const emailLogSchema = new Schema<IEmailLog>(
  {
    bookingId: {
      type: String,
    },
    recipientEmail: { type: String, required: true },
    emailType: {
      type: String,
      enum: ["confirmation", "reminder", "cancellation"],
      required: true,
    },
    subject: { type: String, required: true },
    status: {
      type: String,
      enum: ["sent", "failed", "pending"],
      default: "pending",
    },
    sentAt: { type: Date },
  },
  { timestamps: true }
);

export const EmailLog =
  mongoose.models.EmailLog ||
  mongoose.model<IEmailLog>("EmailLog", emailLogSchema);
