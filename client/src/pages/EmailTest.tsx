import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, CheckCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function EmailTest() {
  const [testEmail, setTestEmail] = useState("");

  const sendTestMutation = trpc.email.sendTest.useMutation({
    onSuccess: () => {
      toast.success("Test email sent successfully! Check your inbox.");
      setTestEmail("");
    },
    onError: (error: any) => {
      toast.error(`Failed to send test email: ${error.message}`);
    },
  });

  const handleSendTest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmail) {
      toast.error("Please enter an email address");
      return;
    }
    sendTestMutation.mutate({ email: testEmail });
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Mail className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Email Notifications</h1>
        </div>
        <p className="text-muted-foreground">
          Test email delivery and configure notification settings
        </p>
      </div>

      {/* Test Email Card */}
      <Card>
        <CardHeader>
          <CardTitle>Test Email Delivery</CardTitle>
          <CardDescription>
            Send a test email to verify your Mailgun integration is working correctly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSendTest} className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="testEmail">Recipient Email Address</Label>
              <Input
                id="testEmail"
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
              />
              <p className="text-sm text-muted-foreground">
                Enter an email address to receive a test notification
              </p>
            </div>

            <Button type="submit" disabled={sendTestMutation.isPending}>
              {sendTestMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send Test Email
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Email Configuration Info */}
      <Card>
        <CardHeader>
          <CardTitle>Email Configuration</CardTitle>
          <CardDescription>
            Current email service settings (configured via environment variables)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <p className="font-medium">Mailgun Integration</p>
                <p className="text-sm text-muted-foreground">
                  Email service is configured and ready to send notifications
                </p>
              </div>
            </div>

            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
              <h4 className="font-semibold text-blue-900 mb-2">Automated Notifications</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Service reminders sent 24 hours before scheduled jobs</li>
                <li>• Job completion confirmations sent when jobs are marked complete</li>
                <li>• Notifications include job details, location, and technician info</li>
              </ul>
            </div>

            <div className="border-l-4 border-amber-500 bg-amber-50 p-4 rounded">
              <h4 className="font-semibold text-amber-900 mb-2">Email Triggers</h4>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• <strong>Service Reminder:</strong> Automatically sent when a job is scheduled for tomorrow</li>
                <li>• <strong>Job Completion:</strong> Sent when job status changes to "Completed"</li>
                <li>• <strong>Service Plan Jobs:</strong> Customers notified when recurring jobs are auto-generated</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Future Enhancements Card */}
      <Card>
        <CardHeader>
          <CardTitle>Future Enhancements</CardTitle>
          <CardDescription>
            Planned email notification features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>• Customizable email templates with organization branding</li>
            <li>• Email notification preferences per customer</li>
            <li>• SMS notifications via Twilio integration</li>
            <li>• Weekly service summary emails for customers</li>
            <li>• Payment receipt emails with invoice attachments</li>
            <li>• Weather delay notifications</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
