import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link } from "wouter";
import { ArrowLeft, Users, Check } from "lucide-react";

export default function Seating() {
  const [tables, setTables] = useState<any[]>([]);
  const [selectedTable, setSelectedTable] = useState<number | null>(null);

  // Fetch tables data
  useEffect(() => {
    // Initialize with mock data for now
    const mockTables = Array.from({ length: 25 }, (_, i) => ({
      id: i + 1,
      tableNumber: i + 1,
      capacity: 10,
      status: Math.random() > 0.6 ? "reserved" : "available",
      bookedGuests: Math.floor(Math.random() * 10),
    }));
    setTables(mockTables);
  }, []);

  const getTableColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-50 border-green-200 hover:bg-green-100";
      case "reserved":
        return "bg-blue-50 border-blue-200 hover:bg-blue-100";
      case "full":
        return "bg-gray-50 border-gray-200 cursor-not-allowed";
      default:
        return "bg-white border-border";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <span className="text-xs font-semibold text-green-700">Available</span>;
      case "reserved":
        return <span className="text-xs font-semibold text-blue-700">Reserved</span>;
      case "full":
        return <span className="text-xs font-semibold text-gray-700">Full</span>;
      default:
        return null;
    }
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
          <h1 className="text-4xl font-bold text-foreground">Seating Chart</h1>
          <p className="text-muted-foreground mt-2">
            Explore our 25 elegantly arranged tables
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        {/* Legend */}
        <div className="mb-12 bg-card border border-border rounded-lg p-6">
          <h2 className="font-bold mb-4">Table Status Legend</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-green-100 border-2 border-green-200 rounded"></div>
              <span className="text-sm">Available - Open for booking</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-blue-100 border-2 border-blue-200 rounded"></div>
              <span className="text-sm">Reserved - Partially booked</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 bg-gray-100 border-2 border-gray-200 rounded"></div>
              <span className="text-sm">Full - No more seats available</span>
            </div>
          </div>
        </div>

        {/* Seating Grid */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-8">Table Arrangement</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {tables.map((table) => (
              <button
                key={table.id}
                onClick={() => setSelectedTable(table.id)}
                className={`relative p-4 rounded-lg border-2 transition-all ${getTableColor(table.status)}`}
                disabled={table.status === "full"}
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-foreground mb-2">
                    {table.tableNumber}
                  </div>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <Users size={16} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {table.bookedGuests}/{table.capacity}
                    </span>
                  </div>
                  <div className="mb-2">
                    {getStatusBadge(table.status)}
                  </div>
                  {table.status === "available" && (
                    <Button size="sm" variant="outline" className="w-full text-xs">
                      Book
                    </Button>
                  )}
                  {table.status === "reserved" && (
                    <Button size="sm" variant="secondary" className="w-full text-xs">
                      View
                    </Button>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Table Details */}
        {selectedTable && (
          <Card className="card-elegant p-8">
            <h3 className="text-2xl font-bold mb-4">Table {selectedTable} Details</h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-bold mb-4">Table Information</h4>
                <div className="space-y-3">
                  <div>
                    <span className="text-muted-foreground">Table Number:</span>
                    <p className="font-semibold">{selectedTable}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Capacity:</span>
                    <p className="font-semibold">10 guests</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Available Seats:</span>
                    <p className="font-semibold">
                      {10 - (tables.find(t => t.id === selectedTable)?.bookedGuests || 0)} seats
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-bold mb-4">Actions</h4>
                <div className="space-y-3">
                  <Link href={`/booking?table=${selectedTable}`}>
                    <Button className="w-full btn-elegant">
                      Book This Table
                    </Button>
                  </Link>
                  <Link href={`/lookup?table=${selectedTable}`}>
                    <Button variant="outline" className="w-full">
                      View Guest List
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
