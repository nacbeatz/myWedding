import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Link, useLocation } from "wouter";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { weddingApi, type TableAvailability } from "@/lib/api";

export default function Booking() {
  const [location] = useLocation();
  const tableParam = new URLSearchParams(location.split("?")[1]).get("table");

  const [selectedTable, setSelectedTable] = useState<number | null>(
    tableParam ? parseInt(tableParam) : null
  );
  const [formData, setFormData] = useState({
    guestName: "",
    guestEmail: "",
    guestPhone: "",
    numberOfGuests: "1",
    specialRequests: "",
  });
  const [bookingComplete, setBookingComplete] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const numberOfGuests = parseInt(formData.numberOfGuests) || 1;

  const [allTables, setAllTables] = useState<any[]>([]);
  const [availableTables, setAvailableTables] = useState<TableAvailability[]>([]);

  useEffect(() => {
    weddingApi.getTables().then(setAllTables).catch(() => {});
  }, []);

  useEffect(() => {
    weddingApi.getAvailableTables(numberOfGuests)
      .then(setAvailableTables)
      .catch(() => setAvailableTables([]));
  }, [numberOfGuests]);

  const availableTableIds = new Set(availableTables.map(t => String(t.tableId)));

  const handleTableSelect = (tableNumber: number) => {
    const table = allTables.find(t => t.tableNumber === tableNumber);
    if (!table) return;
    if (!availableTableIds.has(String(table._id))) return;
    setSelectedTable(tableNumber);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTable) { toast.error("Please select a table"); return; }
    if (!formData.guestName || !formData.guestEmail) { toast.error("Please fill in all required fields"); return; }

    const table = allTables.find(t => t.tableNumber === selectedTable);
    if (!table) { toast.error("Selected table not found. Please try again."); return; }

    setIsSubmitting(true);
    try {
      const booking = await weddingApi.createBooking({
        tableId: String(table._id),
        guestName: formData.guestName,
        guestEmail: formData.guestEmail,
        guestPhone: formData.guestPhone || undefined,
        numberOfGuests,
        specialRequests: formData.specialRequests || undefined,
      });
      setConfirmationCode(booking.confirmationCode ?? "");
      setBookingComplete(true);
      toast.success("Table booked successfully!");
    } catch (err: any) {
      toast.error(err.message || "Failed to book table. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (bookingComplete) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container py-12">
          <Link href="/">
            <Button variant="ghost" size="sm" className="mb-8">
              <ArrowLeft size={18} className="mr-2" />
              Back to Home
            </Button>
          </Link>

          <Card className="card-elegant p-12 max-w-2xl mx-auto text-center">
            <div className="flex justify-center mb-6">
              <CheckCircle className="text-accent" size={64} />
            </div>
            <h1 className="text-4xl font-bold mb-4">Booking Confirmed!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Thank you for booking with us. Your reservation has been confirmed.
            </p>

            <div className="bg-accent/10 rounded-lg p-8 mb-8">
              <div className="space-y-4">
                <div>
                  <p className="text-muted-foreground mb-1">Confirmation Code</p>
                  <p className="text-3xl font-bold text-accent">{confirmationCode}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Table Number</p>
                  <p className="text-2xl font-bold">{selectedTable}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Guest Name</p>
                  <p className="text-lg font-semibold">{formData.guestName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Number of Guests</p>
                  <p className="text-lg font-semibold">{formData.numberOfGuests}</p>
                </div>
              </div>
            </div>

            <p className="text-muted-foreground mb-8">
              A confirmation email has been sent to <span className="font-semibold">{formData.guestEmail}</span>
            </p>

            <div className="flex gap-4 justify-center">
              <Link href="/seating">
                <Button className="btn-elegant">View Seating Chart</Button>
              </Link>
              <Link href="/">
                <Button variant="outline">Back to Home</Button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container py-12">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-8">
            <ArrowLeft size={18} className="mr-2" />
            Back to Home
          </Button>
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="card-elegant p-6">
              <h2 className="text-xl font-bold mb-4">Select Table</h2>
              <div className="grid grid-cols-4 gap-2">
                {Array.from({ length: 25 }, (_, i) => i + 1).map(tableNum => {
                  const table = allTables.find(t => t.tableNumber === tableNum);
                  const isAvailable = table ? availableTableIds.has(String(table._id)) : true;
                  const isSelected = selectedTable === tableNum;
                  return (
                    <button
                      key={tableNum}
                      onClick={() => handleTableSelect(tableNum)}
                      disabled={!isAvailable}
                      className={`p-2 rounded border-2 font-bold transition-all ${
                        isSelected
                          ? "bg-accent text-accent-foreground border-accent"
                          : isAvailable
                          ? "bg-card border-border hover:border-accent"
                          : "bg-muted text-muted-foreground border-muted cursor-not-allowed opacity-50"
                      }`}
                    >
                      {tableNum}
                    </button>
                  );
                })}
              </div>

              {selectedTable && (
                <div className="mt-6 p-4 bg-accent/10 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Selected Table</p>
                  <p className="text-3xl font-bold text-accent">{selectedTable}</p>
                </div>
              )}
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card className="card-elegant p-8">
              <h1 className="text-3xl font-bold mb-2">Book Your Table</h1>
              <p className="text-muted-foreground mb-8">Fill in your details to complete your reservation</p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="guestName" className="text-base font-semibold">Guest Name *</Label>
                  <Input id="guestName" name="guestName" value={formData.guestName} onChange={handleInputChange} placeholder="Enter your full name" className="mt-2" required />
                </div>

                <div>
                  <Label htmlFor="guestEmail" className="text-base font-semibold">Email Address *</Label>
                  <Input id="guestEmail" name="guestEmail" type="email" value={formData.guestEmail} onChange={handleInputChange} placeholder="Enter your email" className="mt-2" required />
                </div>

                <div>
                  <Label htmlFor="guestPhone" className="text-base font-semibold">Phone Number (WhatsApp)</Label>
                  <Input id="guestPhone" name="guestPhone" type="tel" value={formData.guestPhone} onChange={handleInputChange} placeholder="e.g. +32 470 000 000" className="mt-2" />
                </div>

                <div>
                  <Label htmlFor="numberOfGuests" className="text-base font-semibold">Number of Guests *</Label>
                  <Input id="numberOfGuests" name="numberOfGuests" type="number" min="1" max="8" value={formData.numberOfGuests} onChange={handleInputChange} className="mt-2" required />
                  <p className="text-xs text-muted-foreground mt-1">Maximum 8 guests per table</p>
                </div>

                <div>
                  <Label htmlFor="specialRequests" className="text-base font-semibold">Special Requests</Label>
                  <Textarea id="specialRequests" name="specialRequests" value={formData.specialRequests} onChange={handleInputChange} placeholder="Any dietary restrictions, seating preferences, or special requests?" className="mt-2" rows={4} />
                </div>

                <Button type="submit" disabled={!selectedTable || isSubmitting} className="w-full btn-elegant" size="lg">
                  {isSubmitting ? "Booking..." : "Complete Booking"}
                </Button>
              </form>

              <p className="text-xs text-muted-foreground mt-6 text-center">
                By booking, you agree to our terms and conditions
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
