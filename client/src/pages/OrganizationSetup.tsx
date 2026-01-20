import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";

export default function OrganizationSetup() {
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    phone: "",
    email: "",
    mode: "ag_aerial" as "ag_aerial" | "residential_pest" | "both",
    invitationCode: "",
  });

  const { isAuthenticated, loading: authLoading } = useAuth();
  const createOrgMutation = trpc.stripe.createOrganization.useMutation({
    onSuccess: (data) => {
      if (data.requiresPayment) {
        // Redirect to plan selection
        setLocation("/signup/plans");
      } else {
        // Owner bypass - go straight to dashboard
        toast.success("Organization created successfully!");
        setLocation("/dashboard");
      }
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create organization");
    },
  });

  // Restore form data from sessionStorage after OAuth login
  useEffect(() => {
    const savedData = sessionStorage.getItem('pendingOrgSetup');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(parsed);
        sessionStorage.removeItem('pendingOrgSetup');
      } catch (e) {
        console.error('Failed to restore form data:', e);
      }
    }
  }, []);

  // Auto-submit if we have pending data and are authenticated
  useEffect(() => {
    const savedData = sessionStorage.getItem('pendingOrgSetup');
    if (savedData && isAuthenticated && !authLoading) {
      try {
        const parsed = JSON.parse(savedData);
        createOrgMutation.mutate(parsed);
        sessionStorage.removeItem('pendingOrgSetup');
      } catch (e) {
        console.error('Failed to auto-submit form data:', e);
      }
    }
  }, [isAuthenticated, authLoading, createOrgMutation]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // If not authenticated, save form data and redirect to login
    if (!isAuthenticated) {
      // Store form data in sessionStorage so we can restore it after login
      sessionStorage.setItem('pendingOrgSetup', JSON.stringify(formData));
      // Redirect to OAuth login
      window.location.href = getLoginUrl();
      return;
    }
    
    // If authenticated, proceed with organization creation
    createOrgMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Set Up Your Organization</CardTitle>
          <CardDescription>
            Ready2Spray is currently in beta. Please enter your invitation code to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
              <Label htmlFor="invitationCode" className="text-purple-300">Invitation Code *</Label>
              <Input
                id="invitationCode"
                value={formData.invitationCode}
                onChange={(e) => setFormData({ ...formData, invitationCode: e.target.value })}
                placeholder="Enter your invitation code"
                required
                className="font-mono"
              />
              <p className="text-sm text-purple-300/70">Beta access requires an invitation code</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Organization Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Acme Spray Services"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="mode">Business Type *</Label>
              <Select
                value={formData.mode}
                onValueChange={(value: "ag_aerial" | "residential_pest" | "both") =>
                  setFormData({ ...formData, mode: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ag_aerial">Agricultural Aerial Application</SelectItem>
                  <SelectItem value="residential_pest">Residential Pest Control</SelectItem>
                  <SelectItem value="both">Both Ag & Pest Control</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="contact@acmespraying.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="123 Main Street"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Springfield"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="IL"
                  maxLength={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                  placeholder="62701"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/")}
                disabled={createOrgMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createOrgMutation.isPending || !formData.name}
                className="flex-1"
              >
                {createOrgMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Continue to Plan Selection
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
