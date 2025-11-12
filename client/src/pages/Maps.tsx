import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Upload, ExternalLink, Trash2, Copy } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Maps() {
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [mapName, setMapName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const { data: maps, isLoading } = trpc.maps.list.useQuery();
  const utils = trpc.useUtils();

  const uploadMapMutation = trpc.maps.upload.useMutation({
    onSuccess: () => {
      utils.maps.list.invalidate();
      setIsUploadDialogOpen(false);
      setMapName("");
      setSelectedFile(null);
      toast.success("Map uploaded successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to upload map: ${error.message}`);
    },
  });

  const deleteMapMutation = trpc.maps.delete.useMutation({
    onSuccess: () => {
      utils.maps.list.invalidate();
      toast.success("Map deleted successfully");
    },
    onError: (error: any) => {
      toast.error(`Failed to delete map: ${error.message}`);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const ext = file.name.split(".").pop()?.toLowerCase();
      if (ext === "kml" || ext === "gpx" || ext === "geojson") {
        setSelectedFile(file);
      } else {
        toast.error("Please select a KML, GPX, or GeoJSON file");
        e.target.value = "";
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !mapName) {
      toast.error("Please provide a map name and select a file");
      return;
    }

    // Convert file to base64
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      const fileType = selectedFile.name.split(".").pop()?.toLowerCase() as "kml" | "gpx" | "geojson";
      
      uploadMapMutation.mutate({
        name: mapName,
        fileData: base64,
        fileType,
        fileName: selectedFile.name,
      });
    };
    reader.readAsDataURL(selectedFile);
  };

  const copyPublicLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <MapPin className="h-8 w-8 text-green-600" />
            <h1 className="text-3xl font-bold tracking-tight">Map Manager</h1>
          </div>
          <p className="text-muted-foreground mt-1">
            Upload and manage field boundary maps for precise applications
          </p>
        </div>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-600 hover:bg-green-700">
              <Upload className="mr-2 h-4 w-4" />
              Upload Map
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Map File</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="map-name">Map Name *</Label>
                <Input
                  id="map-name"
                  placeholder="Enter map name"
                  value={mapName}
                  onChange={(e) => setMapName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="file">File *</Label>
                <div className="border-2 border-dashed rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground mb-4">
                    KML, GPX, or GeoJSON files
                  </p>
                  <Input
                    id="file"
                    type="file"
                    accept=".kml,.gpx,.geojson"
                    onChange={handleFileChange}
                    className="max-w-xs mx-auto"
                  />
                  {selectedFile && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected: {selectedFile.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsUploadDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleUpload}
                  disabled={uploadMapMutation.isPending || !selectedFile || !mapName}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {uploadMapMutation.isPending ? "Uploading..." : "Upload"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Map Files List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Map Files</h3>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : maps && maps.length > 0 ? (
          <div className="space-y-3">
            {maps.map((map: any) => (
              <div
                key={map.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">{map.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {map.fileType.toUpperCase()} • Uploaded{" "}
                      {new Date(map.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {map.publicUrl && (
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(map.publicUrl!, "_blank")}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyPublicLink(map.publicUrl!)}
                      >
                        <Copy className="h-4 w-4 mr-1" />
                        Copy Link
                      </Button>
                    </>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm("Are you sure you want to delete this map?")) {
                        deleteMapMutation.mutate({ id: map.id });
                      }
                    }}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No map files uploaded</p>
            <Button
              variant="outline"
              onClick={() => setIsUploadDialogOpen(true)}
            >
              Upload your first map
            </Button>
          </div>
        )}
      </Card>

      {/* Info Card */}
      <Card className="p-6 bg-muted/30">
        <h3 className="font-semibold mb-2">About Map Files</h3>
        <p className="text-sm text-muted-foreground">
          Upload KML, GPX, or GeoJSON files to define field boundaries for precise spray
          applications. Each uploaded map gets a public shareable link that you can use in
          other applications or share with team members.
        </p>
      </Card>
    </div>
  );
}
