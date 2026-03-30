import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link } from "wouter";
import { ArrowLeft, Search, Users } from "lucide-react";
import { toast } from "sonner";

interface Guest {
  id: string;
  name: string;
  dietaryRestrictions?: string;
}

export default function Lookup() {
  const [tableNumber, setTableNumber] = useState("");
  const [guests, setGuests] = useState<Guest[]>([]);
  const [searched, setSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tableInfo, setTableInfo] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tableNumber || isNaN(parseInt(tableNumber))) {
      toast.error("Please enter a valid table number");
      return;
    }

    const tableNum = parseInt(tableNumber);
    if (tableNum < 1 || tableNum > 25) {
      toast.error("Table number must be between 1 and 25");
      return;
    }

    setIsLoading(true);
    setSearched(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Mock data
      const mockGuests: Guest[] = [
        { id: "1", name: "John Smith", dietaryRestrictions: "Vegetarian" },
        { id: "2", name: "Jane Doe", dietaryRestrictions: "None" },
        { id: "3", name: "Robert Johnson", dietaryRestrictions: "Gluten-free" },
      ];

      const mockTableInfo = {
        tableNumber: tableNum,
        capacity: 10,
        bookedSeats: 3,
        availableSeats: 7,
      };

      setGuests(mockGuests);
      setTableInfo(mockTableInfo);
    } catch (error) {
      toast.error("Failed to fetch table information");
    } finally {
      setIsLoading(false);
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
          <h1 className="text-4xl font-bold text-foreground">Table Lookup</h1>
          <p className="text-muted-foreground mt-2">
            Search for a table to see who will be sitting there
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-12">
        <div className="max-w-2xl mx-auto">
          {/* Search Form */}
          <Card className="card-elegant p-8 mb-8">
            <h2 className="text-2xl font-bold mb-6">Find a Table</h2>
            <form onSubmit={handleSearch} className="space-y-6">
              <div>
                <Label htmlFor="tableNumber" className="text-base font-semibold">
                  Table Number (1-25)
                </Label>
                <div className="flex gap-3 mt-2">
                  <Input
                    id="tableNumber"
                    type="number"
                    min="1"
                    max="25"
                    value={tableNumber}
                    onChange={(e) => setTableNumber(e.target.value)}
                    placeholder="Enter table number"
                    className="flex-1"
                  />
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="btn-elegant"
                  >
                    <Search size={18} className="mr-2" />
                    {isLoading ? "Searching..." : "Search"}
                  </Button>
                </div>
              </div>
            </form>
          </Card>

          {/* Results */}
          {searched && (
            <>
              {tableInfo && (
                <Card className="card-elegant p-8 mb-8">
                  <div className="mb-8">
                    <h3 className="text-3xl font-bold text-center mb-2">
                      Table {tableInfo.tableNumber}
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div className="bg-accent/10 rounded-lg p-4">
                        <p className="text-muted-foreground text-sm mb-1">Capacity</p>
                        <p className="text-2xl font-bold">{tableInfo.capacity}</p>
                      </div>
                      <div className="bg-accent/10 rounded-lg p-4">
                        <p className="text-muted-foreground text-sm mb-1">Booked</p>
                        <p className="text-2xl font-bold">{tableInfo.bookedSeats}</p>
                      </div>
                      <div className="bg-accent/10 rounded-lg p-4">
                        <p className="text-muted-foreground text-sm mb-1">Available</p>
                        <p className="text-2xl font-bold text-accent">
                          {tableInfo.availableSeats}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Guest List */}
                  <div>
                    <h4 className="text-xl font-bold mb-4 flex items-center gap-2">
                      <Users size={24} className="text-accent" />
                      Guests at This Table
                    </h4>

                    {guests.length > 0 ? (
                      <div className="space-y-3">
                        {guests.map((guest) => (
                          <div
                            key={guest.id}
                            className="border border-border rounded-lg p-4 hover:bg-accent/5 transition-colors"
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold text-lg">{guest.name}</p>
                                {guest.dietaryRestrictions && (
                                  <p className="text-sm text-muted-foreground mt-1">
                                    Dietary: {guest.dietaryRestrictions}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No guests have been assigned to this table yet
                      </p>
                    )}
                  </div>
                </Card>
              )}

              {!tableInfo && !isLoading && (
                <Card className="card-elegant p-12 text-center">
                  <p className="text-lg text-muted-foreground mb-4">
                    No table found with that number
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Please try another table number between 1 and 25
                  </p>
                </Card>
              )}
            </>
          )}

          {!searched && (
            <Card className="card-elegant p-12 text-center">
              <Users className="text-accent mx-auto mb-4" size={48} />
              <h3 className="text-2xl font-bold mb-2">Search for a Table</h3>
              <p className="text-muted-foreground">
                Enter a table number above to see who will be sitting at that table
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
