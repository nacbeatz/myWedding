import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { ArrowLeft, Trash2, Edit2, Plus } from "lucide-react";
import { toast } from "sonner";

interface Booking {
  id: string;
  tableNumber: number;
  guestName: string;
  guestEmail: string;
  numberOfGuests: number;
  status: "confirmed" | "pending" | "cancelled";
}

export default function Admin() {
  const [bookings, setBookings] = useState<Booking[]>([
    {
      id: "1",
      tableNumber: 1,
      guestName: "John Smith",
      guestEmail: "john@example.com",
      numberOfGuests: 4,
      status: "confirmed",
    },
    {
      id: "2",
      tableNumber: 2,
      guestName: "Jane Doe",
      guestEmail: "jane@example.com",
      numberOfGuests: 3,
      status: "confirmed",
    },
    {
      id: "3",
      tableNumber: 5,
      guestName: "Robert Johnson",
      guestEmail: "robert@example.com",
      numberOfGuests: 2,
      status: "pending",
    },
  ]);

  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const handleDeleteBooking = (id: string) => {
    setBookings(bookings.filter((b) => b.id !== id));
    toast.success("Booking deleted");
  };

  const handleEditBooking = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsEditing(true);
  };

  const handleSaveBooking = () => {
    if (selectedBooking) {
      setBookings(
        bookings.map((b) => (b.id === selectedBooking.id ? selectedBooking : b))
      );
      setIsEditing(false);
      setSelectedBooking(null);
      toast.success("Booking updated");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const stats = {
    totalBookings: bookings.length,
    confirmedBookings: bookings.filter((b) => b.status === "confirmed").length,
    pendingBookings: bookings.filter((b) => b.status === "pending").length,
    totalGuests: bookings.reduce((sum, b) => sum + b.numberOfGuests, 0),
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container py-6">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft size={18} className="mr-2" />
              Back to Home
            </Button>
          </Link>
          <h1 className="text-4xl font-bold text-foreground">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage bookings and seating arrangements
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        {/* Statistics */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <Card className="card-elegant p-6">
            <p className="text-muted-foreground text-sm mb-2">Total Bookings</p>
            <p className="text-4xl font-bold text-accent">{stats.totalBookings}</p>
          </Card>
          <Card className="card-elegant p-6">
            <p className="text-muted-foreground text-sm mb-2">Confirmed</p>
            <p className="text-4xl font-bold text-green-600">
              {stats.confirmedBookings}
            </p>
          </Card>
          <Card className="card-elegant p-6">
            <p className="text-muted-foreground text-sm mb-2">Pending</p>
            <p className="text-4xl font-bold text-yellow-600">
              {stats.pendingBookings}
            </p>
          </Card>
          <Card className="card-elegant p-6">
            <p className="text-muted-foreground text-sm mb-2">Total Guests</p>
            <p className="text-4xl font-bold">{stats.totalGuests}</p>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Bookings List */}
          <div className="lg:col-span-2">
            <Card className="card-elegant p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Bookings</h2>
                <Button className="btn-elegant" size="sm">
                  <Plus size={18} className="mr-2" />
                  New Booking
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold">Table</th>
                      <th className="text-left py-3 px-4 font-semibold">Guest</th>
                      <th className="text-left py-3 px-4 font-semibold">Guests</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr
                        key={booking.id}
                        className="border-b border-border hover:bg-accent/5 transition-colors"
                      >
                        <td className="py-3 px-4 font-bold">#{booking.tableNumber}</td>
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-semibold">{booking.guestName}</p>
                            <p className="text-xs text-muted-foreground">
                              {booking.guestEmail}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">{booking.numberOfGuests}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                              booking.status
                            )}`}
                          >
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEditBooking(booking)}
                            >
                              <Edit2 size={16} />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteBooking(booking.id)}
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Edit Panel */}
          {isEditing && selectedBooking && (
            <Card className="card-elegant p-8 h-fit">
              <h3 className="text-xl font-bold mb-6">Edit Booking</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-semibold">Table Number</Label>
                  <Input
                    type="number"
                    value={selectedBooking.tableNumber}
                    onChange={(e) =>
                      setSelectedBooking({
                        ...selectedBooking,
                        tableNumber: parseInt(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Guest Name</Label>
                  <Input
                    value={selectedBooking.guestName}
                    onChange={(e) =>
                      setSelectedBooking({
                        ...selectedBooking,
                        guestName: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Email</Label>
                  <Input
                    type="email"
                    value={selectedBooking.guestEmail}
                    onChange={(e) =>
                      setSelectedBooking({
                        ...selectedBooking,
                        guestEmail: e.target.value,
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Number of Guests</Label>
                  <Input
                    type="number"
                    min="1"
                    max="8"
                    value={selectedBooking.numberOfGuests}
                    onChange={(e) =>
                      setSelectedBooking({
                        ...selectedBooking,
                        numberOfGuests: parseInt(e.target.value),
                      })
                    }
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Status</Label>
                  <select
                    value={selectedBooking.status}
                    onChange={(e) =>
                      setSelectedBooking({
                        ...selectedBooking,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full mt-1 px-3 py-2 border border-border rounded-lg"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    className="flex-1 btn-elegant"
                    onClick={handleSaveBooking}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setIsEditing(false);
                      setSelectedBooking(null);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
