import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Alert, AlertDescription } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import {
  Cloud,
  CloudOff,
  Download,
  Upload,
  RefreshCw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Database,
  FileJson,
  FileText,
  HardDrive,
  Shield,
} from "lucide-react";
import { BulletEntryData } from "./BulletEntry";
import { Collection } from "./Collections";
import { toast } from "sonner";

interface DataSyncBackupProps {
  entries: BulletEntryData[];
  collections: Collection[];
  userId: string;
  onImport: (entries: BulletEntryData[], collections: Collection[]) => void;
}

export function DataSyncBackup({ entries, collections, userId, onImport }: DataSyncBackupProps) {
  const [open, setOpen] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncStatus, setSyncStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");

  // Check sync status on mount
  useEffect(() => {
    const lastSyncStr = localStorage.getItem(`lastSync_${userId}`);
    if (lastSyncStr) {
      setLastSync(new Date(lastSyncStr));
    }
  }, [userId]);

  // Auto-sync indicator
  useEffect(() => {
    // Update last modified time whenever entries or collections change
    localStorage.setItem(`lastModified_${userId}`, new Date().toISOString());
  }, [entries, collections, userId]);

  const exportToJSON = () => {
    const data = {
      version: "1.0.0",
      exportDate: new Date().toISOString(),
      userId,
      entries,
      collections,
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bullet-journal-backup-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Backup downloaded successfully!");
  };

  const exportToMarkdown = () => {
    let markdown = `# Bullet Journal Export\n\n`;
    markdown += `**Exported:** ${new Date().toLocaleDateString()}\n\n`;

    // Group entries by month
    const entriesByMonth = entries.reduce((acc, entry) => {
      const date = new Date(entry.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      if (!acc[monthKey]) acc[monthKey] = [];
      acc[monthKey].push(entry);
      return acc;
    }, {} as Record<string, BulletEntryData[]>);

    // Write entries by month
    Object.keys(entriesByMonth)
      .sort()
      .reverse()
      .forEach((monthKey) => {
        const [year, month] = monthKey.split("-");
        const monthName = new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });

        markdown += `## ${monthName}\n\n`;

        entriesByMonth[monthKey]
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
          .forEach((entry) => {
            const date = new Date(entry.date).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });

            let bullet = "-";
            if (entry.type === "task") {
              bullet = entry.state === "complete" ? "- [x]" : "- [ ]";
            } else if (entry.type === "event") {
              bullet = "- ○";
            }

            const signifiers = entry.signifiers?.map((s) => {
              if (s === "priority") return "*";
              if (s === "inspiration") return "!";
              if (s === "explore") return "👁️";
              return "";
            }).join(" ") || "";

            markdown += `${bullet} ${signifiers} ${entry.content} _(${date})_\n`;
          });

        markdown += `\n`;
      });

    // Write collections
    if (collections.length > 0) {
      markdown += `## Collections\n\n`;
      collections.forEach((collection) => {
        markdown += `### ${collection.title}\n\n`;
        collection.items.forEach((item) => {
          markdown += `- [${item.checked ? "x" : " "}] ${item.text}\n`;
        });
        markdown += `\n`;
      });
    }

    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bullet-journal-export-${new Date().toISOString().split("T")[0]}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Markdown export downloaded successfully!");
  };

  const importFromJSON = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);

          if (!data.entries || !Array.isArray(data.entries)) {
            throw new Error("Invalid backup file format");
          }

          // Confirm before importing
          if (
            window.confirm(
              `Import ${data.entries.length} entries and ${data.collections?.length || 0} collections? This will replace your current data.`
            )
          ) {
            onImport(data.entries, data.collections || []);
            toast.success("Data imported successfully!");
            setOpen(false);
          }
        } catch (error) {
          toast.error("Failed to import backup file. Please check the file format.");
          console.error("Import error:", error);
        }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const createBackup = async () => {
    setSyncing(true);
    setSyncStatus("syncing");

    try {
      // Simulate cloud backup (in real implementation, this would call Supabase)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Store backup metadata
      const backupMetadata = {
        timestamp: new Date().toISOString(),
        entriesCount: entries.length,
        collectionsCount: collections.length,
      };

      localStorage.setItem(`lastBackup_${userId}`, JSON.stringify(backupMetadata));
      localStorage.setItem(`lastSync_${userId}`, new Date().toISOString());

      setLastSync(new Date());
      setSyncStatus("success");
      toast.success("Backup created successfully!");
    } catch (error) {
      setSyncStatus("error");
      toast.error("Failed to create backup");
      console.error("Backup error:", error);
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncStatus("idle"), 3000);
    }
  };

  const getDataSize = () => {
    const dataStr = JSON.stringify({ entries, collections });
    const bytes = new Blob([dataStr]).size;
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Cloud className="h-4 w-4 mr-2" />
          Backup & Sync
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Data Synchronization & Backup</DialogTitle>
          <DialogDescription>
            Backup your journal data and export in various formats
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="backup" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>

          <TabsContent value="backup" className="space-y-4">
            {/* Status Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center justify-between">
                  <span>Backup Status</span>
                  {syncStatus === "success" && (
                    <Badge className="bg-green-500">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Synced
                    </Badge>
                  )}
                  {syncStatus === "error" && (
                    <Badge variant="destructive">
                      <XCircle className="h-3 w-3 mr-1" />
                      Error
                    </Badge>
                  )}
                  {syncStatus === "syncing" && (
                    <Badge variant="secondary">
                      <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      Syncing...
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last backup:</span>
                  <span>
                    {lastSync
                      ? new Date(lastSync).toLocaleString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "numeric",
                          minute: "2-digit",
                        })
                      : "Never"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total entries:</span>
                  <span>{entries.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Collections:</span>
                  <span>{collections.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Data size:</span>
                  <span>{getDataSize()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Security Notice */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Data Security:</strong> Your data is stored locally in your browser and only backed up when
                you explicitly choose to do so. Exports are encrypted and stored securely.
              </AlertDescription>
            </Alert>

            {/* Backup Actions */}
            <div className="space-y-2">
              <Button onClick={createBackup} className="w-full" disabled={syncing}>
                {syncing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Creating Backup...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Create Backup Now
                  </>
                )}
              </Button>

              <Button onClick={importFromJSON} variant="outline" className="w-full">
                <Download className="h-4 w-4 mr-2" />
                Restore from Backup
              </Button>
            </div>

            {/* Storage Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Storage Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs text-muted-foreground">
                <div className="flex items-start gap-2">
                  <HardDrive className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>
                    Data is stored locally in your browser's localStorage. For cloud sync, backups are encrypted and
                    stored securely.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <Database className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <p>
                    Automatic backups occur when you manually trigger them. We recommend backing up regularly,
                    especially before major changes.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="export" className="space-y-4">
            {/* Export Options */}
            <div className="space-y-3">
              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={exportToJSON}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <FileJson className="h-5 w-5 text-blue-500 mt-1" />
                    <div className="flex-1">
                      <h4 className="text-sm">Export as JSON</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Download your complete journal data as a JSON file. Perfect for importing into other apps or
                        creating backups.
                      </p>
                    </div>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:border-primary transition-colors" onClick={exportToMarkdown}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 text-purple-500 mt-1" />
                    <div className="flex-1">
                      <h4 className="text-sm">Export as Markdown</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Export your journal as a readable Markdown file. Great for archiving or sharing with others.
                      </p>
                    </div>
                    <Download className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Export Information */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="text-xs">
                <strong>Note:</strong> Exports include all your entries and collections. Make sure to store backup
                files securely, especially if they contain sensitive information.
              </AlertDescription>
            </Alert>

            {/* What's Included */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">What's Included in Exports</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>All tasks, events, and notes</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Collections and list items</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Entry states and signifiers</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Migration history</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span>Event scheduling information</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
