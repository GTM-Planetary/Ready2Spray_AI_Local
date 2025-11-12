import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Calendar, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function Jobs() {
  const [location, setLocation] = useLocation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    jobType: "crop_dusting" as const,
    status: "pending" as const,
    priority: "medium" as const,
    locationAddress: "",
    customerId: "",
    assignedPersonnelId: "",
    scheduledStart: "",
    scheduledEnd: "",
    // Agricultural details
    state: "",
    commodityCrop: "",
    targetPest: "",
    epaNumber: "",
    applicationRate: "",
    applicationMethod: "",
    chemicalProduct: "",
    // Crop specifics
    reEntryInterval: "",
    preharvestInterval: "",
    maxApplicationsPerSeason: "",
    maxRatePerSeason: "",
    methodsAllowed: "",
    rate: "",
    diluentAerial: "",
    diluentGround: "",
    diluentChemigation: "",
    genericConditions: "",
  });

  const { data: jobs, isLoading } = trpc.jobs.list.useQuery();
  const { data: customers } = trpc.customers.list.useQuery();
  const { data: personnel } = trpc.personnel.list.useQuery();
  const utils = trpc.useUtils();

  const createMutation = trpc.jobs.create.useMutation({
    onSuccess: () => {
      utils.jobs.list.invalidate();
      toast.success("Job created successfully!");
      setShowCreateForm(false);
      setFormData({
        title: "",
        description: "",
        jobType: "crop_dusting",
        status: "pending",
        priority: "medium",
        locationAddress: "",
        customerId: "",
        assignedPersonnelId: "",
        scheduledStart: "",
        scheduledEnd: "",
        state: "",
        commodityCrop: "",
        targetPest: "",
        epaNumber: "",
        applicationRate: "",
        applicationMethod: "",
        chemicalProduct: "",
        reEntryInterval: "",
        preharvestInterval: "",
        maxApplicationsPerSeason: "",
        maxRatePerSeason: "",
        methodsAllowed: "",
        rate: "",
        diluentAerial: "",
        diluentGround: "",
        diluentChemigation: "",
        genericConditions: "",
      });
    },
    onError: (error) => {
      toast.error(`Failed to create job: ${error.message}`);
    },
  });

  const deleteMutation = trpc.jobs.delete.useMutation({
    onSuccess: () => {
      utils.jobs.list.invalidate();
      toast.success("Job deleted successfully!");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData: any = { ...formData };
    
    // Convert string IDs to numbers if they exist
    if (submitData.customerId) {
      submitData.customerId = parseInt(submitData.customerId);
    } else {
      delete submitData.customerId;
    }
    
    if (submitData.assignedPersonnelId) {
      submitData.assignedPersonnelId = parseInt(submitData.assignedPersonnelId);
    } else {
      delete submitData.assignedPersonnelId;
    }
    
    // Convert date strings to Date objects if they exist
    if (submitData.scheduledStart) {
      submitData.scheduledStart = new Date(submitData.scheduledStart);
    } else {
      delete submitData.scheduledStart;
    }
    
    if (submitData.scheduledEnd) {
      submitData.scheduledEnd = new Date(submitData.scheduledEnd);
    } else {
      delete submitData.scheduledEnd;
    }
    
    createMutation.mutate(submitData);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "text-red-600";
      case "high":
        return "text-orange-600";
      case "low":
        return "text-gray-600";
      default:
        return "text-blue-600";
    }
  };

  if (showCreateForm) {
    return (
      <div className="space-y-6 max-w-4xl">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowCreateForm(false)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </div>

        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create New Job</h1>
          <p className="text-muted-foreground">
            Schedule a new service job for your team
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Job Information */}
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Corn Field Spraying - Section A"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="jobType">Job Type</Label>
                    <Select
                      value={formData.jobType}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, jobType: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="crop_dusting">Crop Dusting</SelectItem>
                        <SelectItem value="pest_control">Pest Control</SelectItem>
                        <SelectItem value="fertilization">Fertilization</SelectItem>
                        <SelectItem value="herbicide">Herbicide</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={formData.priority}
                      onValueChange={(value: any) =>
                        setFormData({ ...formData, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Job details, special instructions, etc."
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="customer">Customer</Label>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => setLocation("/customers")}
                  >
                    + Add New Customer
                  </Button>
                </div>
                <Select
                  value={formData.customerId}
                  onValueChange={(value) =>
                    setFormData({ ...formData, customerId: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id.toString()}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Assignment & Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle>Assignment & Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="personnel">Assigned Personnel</Label>
                  <Select
                    value={formData.assignedPersonnelId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, assignedPersonnelId: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select personnel (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      {personnel?.map((person) => (
                        <SelectItem key={person.id} value={person.id.toString()}>
                          {person.name} - {person.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="location">Job Location</Label>
                  <Input
                    id="location"
                    placeholder="Address or field description"
                    value={formData.locationAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, locationAddress: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="scheduledStart">Scheduled Start</Label>
                  <Input
                    id="scheduledStart"
                    type="datetime-local"
                    value={formData.scheduledStart}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledStart: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="scheduledEnd">Scheduled End</Label>
                  <Input
                    id="scheduledEnd"
                    type="datetime-local"
                    value={formData.scheduledEnd}
                    onChange={(e) =>
                      setFormData({ ...formData, scheduledEnd: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Agricultural Details */}
          <Card>
            <CardHeader>
              <CardTitle>Agricultural Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    placeholder="e.g., Iowa, Nebraska"
                    value={formData.state}
                    onChange={(e) =>
                      setFormData({ ...formData, state: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="commodityCrop">Commodity/Crop</Label>
                  <Input
                    id="commodityCrop"
                    placeholder="e.g., Corn, Soybeans, Wheat"
                    value={formData.commodityCrop}
                    onChange={(e) =>
                      setFormData({ ...formData, commodityCrop: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="targetPest">Target Pest</Label>
                  <Input
                    id="targetPest"
                    placeholder="e.g., Aphids, Corn Borer, Weeds"
                    value={formData.targetPest}
                    onChange={(e) =>
                      setFormData({ ...formData, targetPest: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="epaNumber">EPA Registration Number</Label>
                  <Input
                    id="epaNumber"
                    placeholder="e.g., 352-652 or product name"
                    value={formData.epaNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, epaNumber: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="applicationRate">Application Rate (per acre)</Label>
                  <Input
                    id="applicationRate"
                    placeholder="e.g., 1.5"
                    value={formData.applicationRate}
                    onChange={(e) =>
                      setFormData({ ...formData, applicationRate: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="applicationMethod">Application Method</Label>
                  <Select
                    value={formData.applicationMethod}
                    onValueChange={(value) =>
                      setFormData({ ...formData, applicationMethod: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aerial">Aerial</SelectItem>
                      <SelectItem value="ground">Ground</SelectItem>
                      <SelectItem value="chemigation">Chemigation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="chemicalProduct">Chemical Product</Label>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    onClick={() => toast.info("Add product functionality coming soon")}
                  >
                    + Add New Product
                  </Button>
                </div>
                <Select
                  value={formData.chemicalProduct}
                  onValueChange={(value) =>
                    setFormData({ ...formData, chemicalProduct: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select chemical product (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="product1">Product 1</SelectItem>
                    <SelectItem value="product2">Product 2</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Crop Specifics */}
          <Card>
            <CardHeader>
              <CardTitle>Crop Specifics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="reEntryInterval">Re-Entry Interval (REI)</Label>
                  <Input
                    id="reEntryInterval"
                    placeholder="e.g., 12 hours"
                    value={formData.reEntryInterval}
                    onChange={(e) =>
                      setFormData({ ...formData, reEntryInterval: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="preharvestInterval">Pre-harvest Interval (PHI)</Label>
                  <Input
                    id="preharvestInterval"
                    placeholder="e.g., 7 days"
                    value={formData.preharvestInterval}
                    onChange={(e) =>
                      setFormData({ ...formData, preharvestInterval: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="maxApplicationsPerSeason">Max Applications per Season</Label>
                  <Input
                    id="maxApplicationsPerSeason"
                    placeholder="e.g., 3"
                    value={formData.maxApplicationsPerSeason}
                    onChange={(e) =>
                      setFormData({ ...formData, maxApplicationsPerSeason: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="maxRatePerSeason">Max Rate per Season</Label>
                  <Input
                    id="maxRatePerSeason"
                    placeholder="e.g., 4.5 lbs/acre"
                    value={formData.maxRatePerSeason}
                    onChange={(e) =>
                      setFormData({ ...formData, maxRatePerSeason: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="methodsAllowed">Methods Allowed</Label>
                  <Input
                    id="methodsAllowed"
                    placeholder="e.g., Aerial, Ground Boom, Chemigation"
                    value={formData.methodsAllowed}
                    onChange={(e) =>
                      setFormData({ ...formData, methodsAllowed: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="rate">Rate</Label>
                  <Input
                    id="rate"
                    placeholder="e.g., 1-2 pt/acre"
                    value={formData.rate}
                    onChange={(e) =>
                      setFormData({ ...formData, rate: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="diluentAerial">Diluent (Aerial)</Label>
                  <Input
                    id="diluentAerial"
                    placeholder="e.g., Water, 2-5 GPA"
                    value={formData.diluentAerial}
                    onChange={(e) =>
                      setFormData({ ...formData, diluentAerial: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="diluentGround">Diluent (Ground)</Label>
                  <Input
                    id="diluentGround"
                    placeholder="e.g., Water, 10-20 GPA"
                    value={formData.diluentGround}
                    onChange={(e) =>
                      setFormData({ ...formData, diluentGround: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="diluentChemigation">Diluent (Chemigation)</Label>
                  <Input
                    id="diluentChemigation"
                    placeholder="e.g., Water"
                    value={formData.diluentChemigation}
                    onChange={(e) =>
                      setFormData({ ...formData, diluentChemigation: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="genericConditions">Generic Conditions / Notes</Label>
                <Textarea
                  id="genericConditions"
                  placeholder="Buffer zones, droplet size, tank mix restrictions, etc."
                  value={formData.genericConditions}
                  onChange={(e) =>
                    setFormData({ ...formData, genericConditions: e.target.value })
                  }
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowCreateForm(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create Job
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Jobs</h1>
          <p className="text-muted-foreground">
            Manage your agricultural spray jobs
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Job
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : jobs && jobs.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => (
            <Card key={job.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-lg">{job.title}</CardTitle>
                    <CardDescription>
                      {job.jobType.replace("_", " ")}
                    </CardDescription>
                  </div>
                  <span
                    className={`text-xs font-medium ${getPriorityColor(job.priority)}`}
                  >
                    {job.priority.toUpperCase()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(job.status)}`}
                  >
                    {job.status.replace("_", " ")}
                  </span>
                </div>
                {job.locationAddress && (
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {job.locationAddress}
                  </p>
                )}
                {job.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {job.description}
                  </p>
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => toast.info("Edit functionality coming soon")}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteMutation.mutate({ id: job.id })}
                    disabled={deleteMutation.isPending}
                  >
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-muted-foreground mb-4">
              No jobs yet. Create your first job to get started!
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Job
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
