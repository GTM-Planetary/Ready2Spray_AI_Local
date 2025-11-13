import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Calendar, ArrowLeft, Search } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useLocation } from "wouter";
import { AgrianProductLookup } from "@/components/AgrianProductLookup";

export default function Jobs() {
  const [location, setLocation] = useLocation();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAgrianLookup, setShowAgrianLookup] = useState(false);
  const [editingJob, setEditingJob] = useState<any>(null);

  // Check for selected product data from ProductLookup page
  useEffect(() => {
    const selectedProductData = localStorage.getItem("selectedAgrianProduct");
    if (selectedProductData) {
      try {
        const product = JSON.parse(selectedProductData);
        // Auto-populate form fields from selected product
        setFormData((prev) => ({
          ...prev,
          epaNumber: product.epaNumber || prev.epaNumber,
          chemicalProduct: product.name || prev.chemicalProduct,
          reEntryInterval: product.reEntryInterval || prev.reEntryInterval,
          preharvestInterval: product.preharvestInterval || prev.preharvestInterval,
          maxApplicationsPerSeason: product.maxApplicationsPerSeason || prev.maxApplicationsPerSeason,
          maxRatePerSeason: product.maxRatePerSeason || prev.maxRatePerSeason,
          methodsAllowed: product.methodsAllowed || prev.methodsAllowed,
          rate: product.rate || prev.rate,
          diluentAerial: product.diluentAerial || prev.diluentAerial,
          diluentGround: product.diluentGround || prev.diluentGround,
          diluentChemigation: product.diluentChemigation || prev.diluentChemigation,
          genericConditions: product.genericConditions || prev.genericConditions,
        }));
        // Clear the localStorage after using the data
        localStorage.removeItem("selectedAgrianProduct");
        toast.success("Product data loaded from EPA lookup!");
      } catch (error) {
        console.error("Failed to parse selected product data:", error);
      }
    }
  }, [location]); // Re-run when location changes (i.e., when returning from product-lookup)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    jobType: "crop_dusting" as const,
    status: "",
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
  const { data: jobStatuses } = trpc.jobStatuses.list.useQuery();
  const utils = trpc.useUtils();
  
  // Get default status ID
  const defaultStatus = jobStatuses?.find(s => s.isDefault);
  const defaultStatusId = defaultStatus?.id.toString() || jobStatuses?.[0]?.id.toString() || "";

  const resetForm = () => {
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
    setEditingJob(null);
  };

  const handleOpenForm = (job?: any) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        title: job.title || "",
        description: job.description || "",
        jobType: job.jobType || "crop_dusting",
        status: job.statusId?.toString() || "",
        priority: job.priority || "medium",
        locationAddress: job.locationAddress || "",
        customerId: job.customerId?.toString() || "",
        assignedPersonnelId: job.assignedPersonnelId?.toString() || "",
        scheduledStart: job.scheduledStart ? new Date(job.scheduledStart).toISOString().slice(0, 16) : "",
        scheduledEnd: job.scheduledEnd ? new Date(job.scheduledEnd).toISOString().slice(0, 16) : "",
        state: job.state || "",
        commodityCrop: job.commodityCrop || "",
        targetPest: job.targetPest || "",
        epaNumber: job.epaNumber || "",
        applicationRate: job.applicationRate || "",
        applicationMethod: job.applicationMethod || "",
        chemicalProduct: job.chemicalProduct || "",
        reEntryInterval: job.reEntryInterval || "",
        preharvestInterval: job.preharvestInterval || "",
        maxApplicationsPerSeason: job.maxApplicationsPerSeason || "",
        maxRatePerSeason: job.maxRatePerSeason || "",
        methodsAllowed: job.methodsAllowed || "",
        rate: job.rate || "",
        diluentAerial: job.diluentAerial || "",
        diluentGround: job.diluentGround || "",
        diluentChemigation: job.diluentChemigation || "",
        genericConditions: job.genericConditions || "",
      });
    } else {
      resetForm();
    }
    setShowCreateForm(true);
  };

  const createMutation = trpc.jobs.create.useMutation({
    onSuccess: () => {
      utils.jobs.list.invalidate();
      toast.success("Job created successfully!");
      setShowCreateForm(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to create job: ${error.message}`);
    },
  });

  const updateMutation = trpc.jobs.update.useMutation({
    onSuccess: () => {
      utils.jobs.list.invalidate();
      toast.success("Job updated successfully!");
      setShowCreateForm(false);
      resetForm();
    },
    onError: (error) => {
      toast.error(`Failed to update job: ${error.message}`);
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
    
    if (editingJob) {
      updateMutation.mutate({ id: editingJob.id, ...submitData });
    } else {
      createMutation.mutate(submitData);
    }
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
          <h1 className="text-3xl font-bold tracking-tight">{editingJob ? "Edit Job" : "Create New Job"}</h1>
          <p className="text-muted-foreground">
            {editingJob ? "Update job information" : "Schedule a new service job for your team"}
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
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={formData.status || defaultStatusId}
                    onValueChange={(value) =>
                      setFormData({ ...formData, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {jobStatuses?.map((status) => (
                        <SelectItem key={status.id} value={status.id.toString()}>
                          <div className="flex items-center gap-2">
                            <div
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: status.color }}
                            />
                            {status.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setLocation("/product-lookup");
                    }}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    EPA Product Lookup
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
            <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
              {(createMutation.isPending || updateMutation.isPending) && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {editingJob ? "Update Job" : "Create Job"}
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
        <Button onClick={() => handleOpenForm()}>
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
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
                    style={{
                      backgroundColor: job.statusColor ? `${job.statusColor}20` : '#FEF3C7',
                      color: job.statusColor || '#92400E'
                    }}
                  >
                    {job.statusName || 'Unknown'}
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
                {/* Status Transition Button */}
                {job.statusCategory !== 'completed' && job.statusCategory !== 'cancelled' && (
                  <StatusTransitionButton job={job} jobStatuses={jobStatuses} />
                )}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleOpenForm(job)}
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
            <Button onClick={() => handleOpenForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Create First Job
            </Button>
          </CardContent>
        </Card>
      )}
      {/* Agrian Product Lookup Dialog */}
      {/* Temporarily commented out to debug
      <AgrianProductLookup
        open={showAgrianLookup}
        onClose={() => setShowAgrianLookup(false)}
        onSelectProduct={(product) => {
          setFormData({
            ...formData,
            chemicalProduct: product.name || "",
            epaNumber: product.epaNumber || product.epaRegistrationNumber || "",
            state: product.state || formData.state,
            commodityCrop: formData.commodityCrop,
            applicationRate: product.rate || "",
            reEntryInterval: product.reEntryInterval || "",
            preharvestInterval: product.preharvestInterval || "",
            maxApplicationsPerSeason: product.maxApplicationsPerSeason || "",
            maxRatePerSeason: product.maxRatePerSeason || "",
            methodsAllowed: product.methodsAllowed || "",
            rate: product.rate || "",
            diluentAerial: product.diluentAerial || "",
            diluentGround: product.diluentGround || "",
            diluentChemigation: product.diluentChemigation || "",
          });
          setShowAgrianLookup(false);
        }}
        defaultCountry="United States"
        defaultState={formData.state}
        defaultCommodity={formData.commodityCrop}
      />
      */}
    </div>
  );
}

// Status Transition Button Component
function StatusTransitionButton({ job, jobStatuses }: { job: any; jobStatuses: any[] | undefined }) {
  const utils = trpc.useUtils();
  
  const updateMutation = trpc.jobs.update.useMutation({
    onSuccess: () => {
      utils.jobs.list.invalidate();
      toast.success("Job status updated!");
    },
    onError: (error: any) => {
      toast.error(`Failed to update status: ${error.message}`);
    },
  });

  if (!jobStatuses || jobStatuses.length === 0) return null;

  // Find the next logical status based on current category
  const currentCategory = job.statusCategory;
  let nextStatus;

  if (currentCategory === 'pending') {
    // Move to first 'active' status
    nextStatus = jobStatuses.find(s => s.category === 'active');
  } else if (currentCategory === 'active') {
    // Move to first 'completed' status
    nextStatus = jobStatuses.find(s => s.category === 'completed');
  }

  if (!nextStatus) return null;

  const handleTransition = () => {
    updateMutation.mutate({
      id: job.id,
      status: nextStatus.id.toString(),
    });
  };

  const getButtonText = () => {
    if (currentCategory === 'pending') return `Start: ${nextStatus.name}`;
    if (currentCategory === 'active') return `Complete: ${nextStatus.name}`;
    return `Move to ${nextStatus.name}`;
  };

  return (
    <Button
      variant="default"
      size="sm"
      className="w-full"
      onClick={handleTransition}
      disabled={updateMutation.isPending}
      style={{
        backgroundColor: nextStatus.color,
        borderColor: nextStatus.color,
      }}
    >
      {updateMutation.isPending && (
        <Loader2 className="mr-2 h-3 w-3 animate-spin" />
      )}
      {getButtonText()}
    </Button>
  );
}
