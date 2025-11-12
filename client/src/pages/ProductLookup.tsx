import { useState } from "react";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Search, Loader2 } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function ProductLookup() {
  const [, navigate] = useLocation();
  const [country, setCountry] = useState("United States");
  const [state, setState] = useState("");
  const [commodity, setCommodity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [productDetailUrl, setProductDetailUrl] = useState("");

  // Search products - using manual state
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Get product details - using manual state since we need to trigger it on click
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }
    setIsSearching(true);
    try {
      // For now, create mock results until we fix the tRPC endpoint
      // In production, this would call the actual API
      const mockResults = [
        {
          name: searchQuery,
          epaNumber: "352-652",
          distributor: "Example Distributor",
          registrant: "Example Registrant",
          url: "https://example.com/product",
        },
      ];
      setSearchResults(mockResults);
      toast.success(`Found ${mockResults.length} products`);
    } catch (error: any) {
      toast.error("Failed to search products: " + error.message);
    } finally {
      setIsSearching(false);
    }
  };

  const handleProductClick = async (product: any) => {
    setProductDetailUrl(product.url);
    setIsLoadingDetail(true);
    try {
      // We'll implement this with a manual fetch since tRPC query doesn't support dynamic triggering
      // For now, just set the product from search results
      setSelectedProduct(product);
      toast.success("Product loaded");
    } catch (error: any) {
      toast.error("Failed to load product details: " + error.message);
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const handleSelectProduct = () => {
    if (!selectedProduct) {
      toast.error("Please select a product first");
      return;
    }

    // Store the selected product data in localStorage so the job form can access it
    localStorage.setItem("selectedAgrianProduct", JSON.stringify(selectedProduct));
    toast.success("Product selected! Returning to job form...");
    
    // Navigate back to jobs page
    setTimeout(() => {
      navigate("/jobs");
    }, 500);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/jobs")}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">EPA Product Lookup</h1>
              <p className="text-sm text-muted-foreground">
                Search Agrian Label Center for EPA-registered agricultural products
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-6">
        {/* Search Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Search Filters</CardTitle>
            <CardDescription>
              Enter search criteria to find agricultural products
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger id="country">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  placeholder="e.g., Iowa, Nebraska"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="commodity">Commodity/Crop</Label>
                <Input
                  id="commodity"
                  placeholder="e.g., Corn, Soybeans"
                  value={commodity}
                  onChange={(e) => setCommodity(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="search">Product Search</Label>
              <div className="flex gap-2">
                <Input
                  id="search"
                  placeholder="Search by product name, EPA number, or active ingredient..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                />
                <Button
                  onClick={handleSearch}
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  Search
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Search Results</CardTitle>
              <CardDescription>
                {searchResults.length} products found
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product Name</TableHead>
                      <TableHead>EPA Registration #</TableHead>
                      <TableHead>Distributor</TableHead>
                      <TableHead>Registrant</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((product: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{product.name}</TableCell>
                        <TableCell>{product.epaNumber || "N/A"}</TableCell>
                        <TableCell>{product.distributor || "N/A"}</TableCell>
                        <TableCell>{product.registrant || "N/A"}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleProductClick(product)}
                            disabled={isLoadingDetail}
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Details */}
        {selectedProduct && (
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{selectedProduct.name}</CardTitle>
                  <CardDescription>
                    EPA Registration: {selectedProduct.epaNumber || "N/A"}
                  </CardDescription>
                </div>
                <Button onClick={handleSelectProduct}>
                  Select This Product
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="general">
                <TabsList>
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="crop-specific">Crop Specific</TabsTrigger>
                  <TabsTrigger value="safety">Safety</TabsTrigger>
                </TabsList>

                <TabsContent value="general" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Registrant</Label>
                      <p>{selectedProduct.registrant || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Product Type</Label>
                      <p>{selectedProduct.productType || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Active Ingredients</Label>
                      <p>{selectedProduct.activeIngredients || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Physical State</Label>
                      <p>{selectedProduct.physicalState || "N/A"}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="crop-specific" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">Re-Entry Interval</Label>
                      <p>{selectedProduct.reEntryInterval || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Pre-harvest Interval</Label>
                      <p>{selectedProduct.preharvestInterval || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Max Applications per Season</Label>
                      <p>{selectedProduct.maxApplicationsPerSeason || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Max Rate per Season</Label>
                      <p>{selectedProduct.maxRatePerSeason || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Methods Allowed</Label>
                      <p>{selectedProduct.methodsAllowed || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Application Rate</Label>
                      <p>{selectedProduct.rate || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Diluent (Aerial)</Label>
                      <p>{selectedProduct.diluentAerial || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Diluent (Ground)</Label>
                      <p>{selectedProduct.diluentGround || "N/A"}</p>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="safety" className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-muted-foreground">PPE Information</Label>
                      <p>{selectedProduct.ppeInformation || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Signal Word</Label>
                      <p>{selectedProduct.signalWord || "N/A"}</p>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">SDS Hazard ID</Label>
                      <p>{selectedProduct.sdsHazardId || "N/A"}</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoadingDetail && (
          <Card>
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading product details...</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
