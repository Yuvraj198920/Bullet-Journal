import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Palette, Sun, Moon, Monitor, Check } from "lucide-react";
import { cn } from "./ui/utils";

type ThemeMode = "light" | "dark" | "system";
type ThemeStyle = "default" | "warm" | "cool" | "high-contrast";

interface ThemeCustomizerProps {
  onThemeChange?: (theme: { mode: ThemeMode; style: ThemeStyle }) => void;
}

const THEME_STYLES = [
  {
    id: "default" as const,
    name: "Default",
    description: "Clean and modern",
    colors: {
      light: { bg: "#ffffff", accent: "#030213", muted: "#ececf0" },
      dark: { bg: "#0a0a0a", accent: "#fcfcfc", muted: "#292929" },
    },
  },
  {
    id: "warm" as const,
    name: "Warm",
    description: "Cozy and inviting",
    colors: {
      light: { bg: "#fef7ed", accent: "#ea580c", muted: "#fed7aa" },
      dark: { bg: "#1c1917", accent: "#fb923c", muted: "#44403c" },
    },
  },
  {
    id: "cool" as const,
    name: "Cool",
    description: "Calm and focused",
    colors: {
      light: { bg: "#f0f9ff", accent: "#0284c7", muted: "#bae6fd" },
      dark: { bg: "#0c1222", accent: "#38bdf8", muted: "#1e293b" },
    },
  },
  {
    id: "high-contrast" as const,
    name: "High Contrast",
    description: "Maximum readability",
    colors: {
      light: { bg: "#ffffff", accent: "#000000", muted: "#e5e5e5" },
      dark: { bg: "#000000", accent: "#ffffff", muted: "#404040" },
    },
  },
];

export function ThemeCustomizer({ onThemeChange }: ThemeCustomizerProps) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ThemeMode>("system");
  const [style, setStyle] = useState<ThemeStyle>("default");
  const [actualMode, setActualMode] = useState<"light" | "dark">("light");

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("themeMode") as ThemeMode;
    const savedStyle = localStorage.getItem("themeStyle") as ThemeStyle;
    
    if (savedMode) setMode(savedMode);
    if (savedStyle) setStyle(savedStyle);
  }, []);

  // Apply theme changes
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Determine actual mode
    let currentMode: "light" | "dark" = "light";
    if (mode === "system") {
      currentMode = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    } else {
      currentMode = mode;
    }
    setActualMode(currentMode);

    // Remove previous theme classes
    root.classList.remove("light", "dark", "theme-default", "theme-warm", "theme-cool", "theme-high-contrast");
    
    // Add new theme classes
    root.classList.add(currentMode);
    root.classList.add(`theme-${style}`);

    // Save to localStorage
    localStorage.setItem("themeMode", mode);
    localStorage.setItem("themeStyle", style);

    // Notify parent
    onThemeChange?.({ mode, style });
  }, [mode, style, onThemeChange]);

  // Listen for system theme changes
  useEffect(() => {
    if (mode !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      const currentMode = mediaQuery.matches ? "dark" : "light";
      setActualMode(currentMode);
      const root = window.document.documentElement;
      root.classList.remove("light", "dark");
      root.classList.add(currentMode);
    };

    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, [mode]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Palette className="h-4 w-4 mr-2" />
          Theme
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Customize Theme</DialogTitle>
          <DialogDescription>
            Choose your preferred color scheme and appearance
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="mode" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="mode">Mode</TabsTrigger>
            <TabsTrigger value="style">Style</TabsTrigger>
          </TabsList>

          <TabsContent value="mode" className="space-y-4 mt-4">
            <div className="space-y-3">
              {/* Light Mode */}
              <Card
                className={cn(
                  "cursor-pointer transition-all",
                  mode === "light" && "ring-2 ring-primary"
                )}
                onClick={() => setMode("light")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-amber-100">
                        <Sun className="h-5 w-5 text-amber-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">Light Mode</h4>
                        <p className="text-sm text-muted-foreground">
                          Bright and clear appearance
                        </p>
                      </div>
                    </div>
                    {mode === "light" && <Check className="h-5 w-5 text-primary" />}
                  </div>
                </CardContent>
              </Card>

              {/* Dark Mode */}
              <Card
                className={cn(
                  "cursor-pointer transition-all",
                  mode === "dark" && "ring-2 ring-primary"
                )}
                onClick={() => setMode("dark")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-slate-800">
                        <Moon className="h-5 w-5 text-slate-200" />
                      </div>
                      <div>
                        <h4 className="font-medium">Dark Mode</h4>
                        <p className="text-sm text-muted-foreground">
                          Easier on the eyes in low light
                        </p>
                      </div>
                    </div>
                    {mode === "dark" && <Check className="h-5 w-5 text-primary" />}
                  </div>
                </CardContent>
              </Card>

              {/* System Mode */}
              <Card
                className={cn(
                  "cursor-pointer transition-all",
                  mode === "system" && "ring-2 ring-primary"
                )}
                onClick={() => setMode("system")}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-blue-100 dark:bg-blue-900">
                        <Monitor className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <h4 className="font-medium">System</h4>
                        <p className="text-sm text-muted-foreground">
                          Follow system preference
                        </p>
                      </div>
                    </div>
                    {mode === "system" && <Check className="h-5 w-5 text-primary" />}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="p-3 bg-muted/50 rounded-md text-xs text-muted-foreground">
              Current: <strong className="capitalize">{actualMode} mode</strong>
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-4 mt-4">
            <div className="grid gap-3">
              {THEME_STYLES.map((themeStyle) => {
                const colors = themeStyle.colors[actualMode];
                
                return (
                  <Card
                    key={themeStyle.id}
                    className={cn(
                      "cursor-pointer transition-all",
                      style === themeStyle.id && "ring-2 ring-primary"
                    )}
                    onClick={() => setStyle(themeStyle.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1">
                          {/* Color preview */}
                          <div className="flex gap-1">
                            <div
                              className="h-8 w-8 rounded-md border"
                              style={{ backgroundColor: colors.bg }}
                            />
                            <div
                              className="h-8 w-8 rounded-md border"
                              style={{ backgroundColor: colors.accent }}
                            />
                            <div
                              className="h-8 w-8 rounded-md border"
                              style={{ backgroundColor: colors.muted }}
                            />
                          </div>
                          
                          <div className="flex-1">
                            <h4 className="font-medium">{themeStyle.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {themeStyle.description}
                            </p>
                          </div>
                        </div>
                        {style === themeStyle.id && <Check className="h-5 w-5 text-primary" />}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="p-3 bg-muted/50 rounded-md text-xs text-muted-foreground">
              💡 <strong>Tip:</strong> Theme styles adapt to both light and dark modes
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
