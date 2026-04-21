const BASE = "/api/wedding";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? `HTTP ${res.status}`);
  return data as T;
}

export type TableAvailability = {
  tableId: string;
  tableNumber: number;
  capacity: number;
  bookedSeats: number;
  availableSeats: number;
  status: string;
};

export type Booking = {
  _id: string;
  tableId: string;
  tableNumber?: number | null;
  guestName: string;
  guestEmail: string;
  guestPhone?: string;
  numberOfGuests: number;
  specialRequests?: string;
  confirmationCode: string;
};

export const weddingApi = {
  getTables: () => request<any[]>("/tables"),

  getAvailableTables: (numberOfGuests: number) =>
    request<TableAvailability[]>(`/tables/available?numberOfGuests=${numberOfGuests}`),

  createBooking: (data: {
    tableId: string;
    guestName: string;
    guestEmail: string;
    guestPhone?: string;
    numberOfGuests: number;
    specialRequests?: string;
  }) =>
    request<Booking>("/bookings", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  searchByName: (name: string) =>
    request<Booking[]>(`/bookings/search?name=${encodeURIComponent(name)}`),

  getByCode: (code: string) =>
    request<Booking>(`/bookings/by-code/${encodeURIComponent(code)}`),

  getByEmail: (email: string) =>
    request<Booking[]>(`/bookings/by-email?email=${encodeURIComponent(email)}`),

  getConfig: () => request<any>("/config"),
};
