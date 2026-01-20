import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, AlertCircle, ExternalLink, Upload, Loader2, X, Sparkles, FileText } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { isValidEpaNumber } from "@shared/validation";

export default function ProductLookup() {
  const [, navigate] = useLocation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<Array<{file: File, preview: string, type: 'image' | 'pdf'}>>([]);
  
  // Get jobId or jobV2Id from URL params if linking to existing job
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get('jobId') ? parseInt(urlParams.get('jobId')!) : null;
  const jobV2Id = urlParams.get('jobV2Id') ? parseInt(urlParams.get('jobV2Id')!) : null;
  
  // Product data form fields
  const [productData, setProductData] = useState({
    productName: "",
    epaNumber: "",
    registrant: "",
    activeIngredients: "",
    // Crop Specific
    reEntryInterval: "",
    preharvestInterval: "",
    // Safety / PPE
    ppeInformation: "",
    labelSignalWord: "",
    // Notes
    genericConditions: "",
  });

  const extractProductMutation = trpc.products.extractFromScreenshot.useMutation({
    onSuccess: (data) => {
      if (data.success && data.extractedData) {
        // Merge extracted data with existing data (don't overwrite non-empty fields)
        setProductData(prev => {
          const merged = { ...prev };
          Object.entries(data.extractedData).forEach(([key, value]) => {
            if (value && (!prev[key as keyof typeof prev] || prev[key as keyof typeof prev] === "")) {
              (merged as any)[key] = value;
            }
          });
          return merged;
        });
        toast.success("Product details extracted! Review and edit as needed.");
      } else {
        toast.error(data.error || "Failed to extract product details");
      }
    },
    onError: (error) => {
      toast.error("Error extracting product details: " + error.message);
    },
  });

  const handleInputChange = (field: string, value: string) => {
    setProductData(prev => ({ ...prev, [field]: value }));
  };

  const handleOpenAgrian = () => {
    window.open("https://www.agrian.com/labelcenter/results.cfm", "_blank");
    toast.info("Agrian opened in new window. Take screenshots and upload them here.");
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) return;

    // Validate file types
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith("image/");
      const isPDF = file.type === "application/pdf";
      return isImage || isPDF;
    });

    if (validFiles.length === 0) {
      toast.error("Please upload image files (PNG, JPG, WebP) or PDF files");
      return;
    }

    // Validate file sizes (max 10MB each)
    const oversizedFiles = validFiles.filter(file => file.size > 10 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(`${oversizedFiles.length} file(s) exceed 10MB limit`);
      return;
    }

    // Process files
    const newFiles: Array<{file: File, preview: string, type: 'image' | 'pdf'}> = [];
    
    for (const file of validFiles) {
      const isPDF = file.type === "application/pdf";
      
      if (isPDF) {
        // For PDFs, just show a placeholder preview
        newFiles.push({
          file,
          preview: "", // No preview for PDF
          type: 'pdf'
        });
      } else {
        // For images, create preview
        const reader = new FileReader();
        const preview = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        newFiles.push({
          file,
          preview,
          type: 'image'
        });
      }
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    toast.success(`${validFiles.length} file(s) uploaded successfully`);
    
    // Clear the input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    toast.info("File removed");
  };

  const handleExtractFromFiles = async () => {
    if (uploadedFiles.length === 0) {
      toast.error("Please upload at least one file first");
      return;
    }

    setIsExtracting(true);
    toast.info(`Analyzing ${uploadedFiles.length} file(s) with AI...`);

    try {
      // Process each file
      for (let i = 0; i < uploadedFiles.length; i++) {
        const {file, preview, type} = uploadedFiles[i];
        
        if (type === 'pdf') {
          // For PDFs, convert to base64
          const reader = new FileReader();
          const base64 = await new Promise<string>((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });
          await extractProductMutation.mutateAsync({ imageData: base64 });
        } else {
          // For images, use the preview
          await extractProductMutation.mutateAsync({ imageData: preview });
        }
        
        if (i < uploadedFiles.length - 1) {
          // Small delay between requests
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      toast.success("Extraction complete! Review the extracted data below.");
    } catch (error: any) {
      toast.error("Error during extraction: " + error.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const updateJobMutation = trpc.jobs.update.useMutation();
  const linkProductV2Mutation = trpc.jobsV2.linkProduct.useMutation();
  
  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: (product: any) => {
      toast.success("Product saved successfully!");
      
      if (jobId) {
        // If we have a jobId (legacy), update the job with this product
        updateJobMutation.mutate(
          { id: jobId, productId: product.id },
          {
            onSuccess: () => {
              toast.success("Product linked to job!");
              navigate(`/jobs/${jobId}`);
            },
            onError: (error) => {
              toast.error(`Failed to link product: ${error.message}`);
              navigate(`/jobs/${jobId}`);
            }
          }
        );
      } else if (jobV2Id) {
        // If we have a jobV2Id, link product to Jobs V2
        linkProductV2Mutation.mutate(
          { jobId: jobV2Id, productId: product.id },
          {
            onSuccess: () => {
              toast.success("Product linked to job!");
              navigate(`/jobs/${jobV2Id}`);
            },
            onError: (error) => {
              toast.error(`Failed to link product: ${error.message}`);
              navigate(`/jobs/${jobV2Id}`);
            }
          }
        );
      } else {
        // No jobId, navigate to job form with product data
        const params = new URLSearchParams();
        params.set('productId', String(product.id || ''));
        params.set('productName', String(product.nickname || ''));
        params.set('epaNumber', String(product.epaNumber || ''));
        params.set('reEntryInterval', product.hoursReentry ? `${product.hoursReentry} hours` : '');
        params.set('preharvestInterval', product.daysPreharvest ? `${product.daysPreharvest} days` : '');
        navigate(`/jobs/new?${params.toString()}`);
      }
    },
    onError: (error) => {
      toast.error("Failed to save product: " + error.message);
    },
  });

  const handleSave = () => {
    // Validate required fields
    if (!productData.productName || !productData.epaNumber) {
      toast.error("Please fill in Product Name and EPA Registration Number");
      return;
    }

    if (!isValidEpaNumber(productData.epaNumber)) {
      toast.error("Invalid EPA Registration Number format. Expected: XXXXX-XXX or XXXXX-XXX-XXXXX");
      return;
    }

    // Save to database
    createProductMutation.mutate(productData);
  };

  const handleClear = () => {
    setProductData({
      productName: "",
      epaNumber: "",
      registrant: "",
      activeIngredients: "",
      reEntryInterval: "",
      preharvestInterval: "",
      ppeInformation: "",
      labelSignalWord: "",
      genericConditions: "",
    });
    setUploadedFiles([]);
    toast.info("Form cleared");
  };

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/jobs")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">EPA Product Lookup</h1>
          <p className="text-muted-foreground">Search Agrian Label Center and extract product details with AI</p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* Action Buttons */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Quick Actions
            </CardTitle>
            <CardDescription>
              Open Agrian to search products, take screenshots, then upload them here for AI extraction
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-3">
            <Button onClick={handleOpenAgrian} variant="default">
              <ExternalLink className="h-4 w-4 mr-2" />
              Open Agrian Label Center
            </Button>
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              variant="outline"
              disabled={isExtracting}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload Screenshots/PDFs
            </Button>
            {uploadedFiles.length > 0 && (
              <Button 
                onClick={handleExtractFromFiles} 
                variant="default"
                className="bg-gradient-to-r from-purple-600 to-blue-600"
                disabled={isExtracting}
              >
                {isExtracting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Extracting with AI...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Extract from {uploadedFiles.length} File{uploadedFiles.length > 1 ? 's' : ''}
                  </>
                )}
              </Button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,application/pdf"
              multiple
              onChange={handleFileUpload}
              className="hidden"
            />
          </CardContent>
        </Card>

        {/* Uploaded Files Preview Gallery */}
        {uploadedFiles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Uploaded Files ({uploadedFiles.length})</CardTitle>
              <CardDescription>
                Review your uploads. Click "Extract from Files" to analyze with AI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {uploadedFiles.map((item, index) => (
                  <div key={index} className="relative group">
                    {item.type === 'pdf' ? (
                      <div className="w-full h-48 flex items-center justify-center bg-muted rounded-lg border-2 border-border">
                        <div className="text-center">
                          <FileText className="h-16 w-16 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm font-medium">{item.file.name}</p>
                          <p className="text-xs text-muted-foreground">PDF Document</p>
                        </div>
                      </div>
                    ) : (
                      <img 
                        src={item.preview} 
                        alt={`Upload ${index + 1}`}
                        className="w-full h-48 object-cover rounded-lg border-2 border-border"
                      />
                    )}
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-sm">
                      {item.type === 'pdf' ? 'PDF' : 'Image'} {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>How to use:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Click "Open Agrian Label Center" to search for products in a new window</li>
              <li>Take screenshots of product details (General, Safety, Crop Specific tabs)</li>
              <li>Click "Upload Screenshots/PDFs" to upload your screenshots or PDF labels</li>
              <li>Click "Extract from Files" to automatically extract product details using AI</li>
              <li>Review and edit the extracted information as needed</li>
              <li>Click "Save & Return to Job Form" to add this product to your database</li>
            </ol>
          </AlertDescription>
        </Alert>

        {/* Product Information Form */}
        <Card>
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
            <CardDescription>
              AI-extracted or manually entered EPA-registered product details
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* General Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">General Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    placeholder="e.g., Roundup PowerMAX"
                    value={productData.productName}
                    onChange={(e) => handleInputChange("productName", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="epaNumber">EPA Registration Number *</Label>
                  <Input
                    id="epaNumber"
                    placeholder="e.g., 524-549"
                    value={productData.epaNumber}
                    onChange={(e) => handleInputChange("epaNumber", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="registrant">Registrant/Manufacturer</Label>
                  <Input
                    id="registrant"
                    placeholder="e.g., Bayer CropScience"
                    value={productData.registrant}
                    onChange={(e) => handleInputChange("registrant", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="activeIngredients">Active Ingredients</Label>
                  <Input
                    id="activeIngredients"
                    placeholder="e.g., Glyphosate 48.7%"
                    value={productData.activeIngredients}
                    onChange={(e) => handleInputChange("activeIngredients", e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Crop Specific Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Crop Specific Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="reEntryInterval">Re-Entry Interval (REI)</Label>
                  <Input
                    id="reEntryInterval"
                    placeholder="e.g., 4 hours"
                    value={productData.reEntryInterval}
                    onChange={(e) => handleInputChange("reEntryInterval", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="preharvestInterval">Pre-Harvest Interval (PHI)</Label>
                  <Input
                    id="preharvestInterval"
                    placeholder="e.g., 7 days"
                    value={productData.preharvestInterval}
                    onChange={(e) => handleInputChange("preharvestInterval", e.target.value)}
                  />
                </div>

              </div>
            </div>

            {/* Safety & PPE Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Safety & PPE Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="labelSignalWord">Label Signal Word</Label>
                  <Input
                    id="labelSignalWord"
                    placeholder="e.g., CAUTION, WARNING, DANGER"
                    value={productData.labelSignalWord}
                    onChange={(e) => handleInputChange("labelSignalWord", e.target.value)}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="ppeInformation">PPE Requirements</Label>
                  <Textarea
                    id="ppeInformation"
                    placeholder="e.g., Long pants, long-sleeved shirt, gloves, protective eyewear..."
                    value={productData.ppeInformation}
                    onChange={(e) => handleInputChange("ppeInformation", e.target.value)}
                    rows={8}
                    className="resize-y"
                  />
                </div>
              </div>
            </div>

            {/* Additional Notes */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Additional Notes</h3>
              <div>
                <Label htmlFor="genericConditions">Generic Conditions / Special Instructions</Label>
                <Textarea
                  id="genericConditions"
                  placeholder="Enter any additional notes, restrictions, or special instructions..."
                  value={productData.genericConditions}
                  onChange={(e) => handleInputChange("genericConditions", e.target.value)}
                  rows={8}
                  className="resize-y"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button onClick={handleSave} className="flex-1">
                <Save className="h-4 w-4 mr-2" />
                {(jobId || jobV2Id) ? 'Save & Link to Job' : 'Save & Return to Job Form'}
              </Button>
              <Button onClick={handleClear} variant="outline">
                Clear Form
              </Button>
              <Button onClick={() => navigate(jobId ? `/jobs/${jobId}` : jobV2Id ? `/jobs/${jobV2Id}` : "/jobs")} variant="ghost">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
