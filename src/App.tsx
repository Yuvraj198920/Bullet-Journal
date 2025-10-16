import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { DailyLog } from "./components/DailyLog";
import { MonthlyLog } from "./components/MonthlyLog";
import { FutureLog } from "./components/FutureLog";
import { Collections, Collection } from "./components/Collections";
import { IndexNavigation } from "./components/IndexNavigation";
import { BulletEntryData, EntryType, EventCategory } from "./components/BulletEntry";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import { PasswordResetForm } from "./components/auth/PasswordResetForm";
import { Button } from "./components/ui/button";
import { BookOpen, LogOut } from "lucide-react";
import { signIn, signUp, signOut, getSession, requestPasswordReset, onAuthStateChange, User } from "./lib/auth";

type AuthView = "login" | "register" | "reset";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authView, setAuthView] = useState<AuthView>("login");
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<BulletEntryData[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [dailyDate, setDailyDate] = useState(new Date());
  const [monthlyDate, setMonthlyDate] = useState(new Date());
  const [futureYear, setFutureYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState("daily");

  const inactivityTimerRef = useRef<number | null>(null);

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const session = await getSession();
        if (session) {
          setUser(session.user);
          setAccessToken(session.accessToken);
          loadUserData(session.user.id);
        }
      } catch (error) {
        console.error("Failed to get session:", error);
      } finally {
        setLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      if (!user) {
        setAccessToken(null);
        setEntries([]);
        setCollections([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Auto-logout after inactivity
  useEffect(() => {
    if (!user) return;

    const resetTimer = () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }

      inactivityTimerRef.current = window.setTimeout(async () => {
        console.log("Auto-logout due to inactivity");
        await handleSignOut();
      }, INACTIVITY_TIMEOUT);
    };

    const events = ["mousedown", "keydown", "scroll", "touchstart", "click"];
    
    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    resetTimer();

    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [user]);

  // Load user data from localStorage
  const loadUserData = (userId: string) => {
    const savedEntries = localStorage.getItem(`bulletJournalEntries_${userId}`);
    const savedCollections = localStorage.getItem(`bulletJournalCollections_${userId}`);
    
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
    if (savedCollections) {
      setCollections(JSON.parse(savedCollections));
    }
  };

  // Save entries to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`bulletJournalEntries_${user.id}`, JSON.stringify(entries));
    }
  }, [entries, user]);

  // Save collections to localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem(`bulletJournalCollections_${user.id}`, JSON.stringify(collections));
    }
  }, [collections, user]);

  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn(email, password);
    setUser(result.user);
    setAccessToken(result.accessToken);
    loadUserData(result.user.id);
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    await signUp(email, password, name);
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setAccessToken(null);
    setEntries([]);
    setCollections([]);
  };

  const handlePasswordReset = async (email: string) => {
    await requestPasswordReset(email);
  };

  const addEntry = (content: string, type: EntryType, date: Date) => {
    const newEntry: BulletEntryData = {
      id: crypto.randomUUID(),
      date: date.toISOString(),
      type,
      content,
      // Only tasks have state management, events and notes use "complete" as a neutral state
      state: "incomplete",
    };
    setEntries([...entries, newEntry]);
  };

  const addEvent = (
    content: string,
    date: Date,
    eventTime?: string,
    eventEndTime?: string,
    isAllDay?: boolean,
    eventCategory?: EventCategory,
    isRecurring?: boolean,
    recurringPattern?: string
  ) => {
    const newEntry: BulletEntryData = {
      id: crypto.randomUUID(),
      date: date.toISOString(),
      type: "event",
      content,
      state: "incomplete",
      eventState: "upcoming",
      eventTime,
      eventEndTime,
      isAllDay,
      eventCategory,
      isRecurring,
      recurringPattern,
    };
    setEntries([...entries, newEntry]);
  };

  const updateEntry = (id: string, updates: Partial<BulletEntryData>) => {
    setEntries(entries.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry)));
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  const getDailyEntries = () => {
    return entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate.toDateString() === dailyDate.toDateString();
    });
  };

  const getMonthlyEntries = () => {
    return entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return (
        entryDate.getMonth() === monthlyDate.getMonth() &&
        entryDate.getFullYear() === monthlyDate.getFullYear()
      );
    });
  };

  const getFutureEntries = () => {
    return entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate.getFullYear() === futureYear;
    });
  };

  const handleDayClickFromMonthly = (date: Date) => {
    setDailyDate(date);
    setActiveTab("daily");
  };

  const handleNavigateToDate = (date: Date, view: "daily" | "monthly") => {
    if (view === "daily") {
      setDailyDate(date);
      setActiveTab("daily");
    } else {
      setMonthlyDate(date);
      setActiveTab("monthly");
    }
  };

  const handleNavigateToCollection = (collectionId: string) => {
    setActiveTab("collections");
    // Optionally scroll to the collection
  };

  // Collection handlers
  const addCollection = (title: string) => {
    const newCollection: Collection = {
      id: crypto.randomUUID(),
      title,
      items: [],
    };
    setCollections([...collections, newCollection]);
  };

  const deleteCollection = (id: string) => {
    setCollections(collections.filter((c) => c.id !== id));
  };

  const addCollectionItem = (collectionId: string, text: string) => {
    setCollections(
      collections.map((c) =>
        c.id === collectionId
          ? {
              ...c,
              items: [
                ...c.items,
                { id: crypto.randomUUID(), text, checked: false },
              ],
            }
          : c
      )
    );
  };

  const toggleCollectionItem = (collectionId: string, itemId: string) => {
    setCollections(
      collections.map((c) =>
        c.id === collectionId
          ? {
              ...c,
              items: c.items.map((item) =>
                item.id === itemId ? { ...item, checked: !item.checked } : item
              ),
            }
          : c
      )
    );
  };

  const deleteCollectionItem = (collectionId: string, itemId: string) => {
    setCollections(
      collections.map((c) =>
        c.id === collectionId
          ? { ...c, items: c.items.filter((item) => item.id !== itemId) }
          : c
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-2">
              <BookOpen className="h-10 w-10" />
              <h1>Bullet Journal</h1>
            </div>
            <p className="text-muted-foreground">
              Your personal organizational system
            </p>
          </div>

          {authView === "login" && (
            <LoginForm
              onLogin={handleSignIn}
              onSwitchToRegister={() => setAuthView("register")}
              onSwitchToReset={() => setAuthView("reset")}
            />
          )}

          {authView === "register" && (
            <RegisterForm
              onRegister={handleSignUp}
              onSwitchToLogin={() => setAuthView("login")}
            />
          )}

          {authView === "reset" && (
            <PasswordResetForm
              onRequestReset={handlePasswordReset}
              onSwitchToLogin={() => setAuthView("login")}
            />
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4 max-w-6xl">
        <header className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-8 w-8" />
              <div>
                <h1>Bullet Journal</h1>
                <p className="text-sm text-muted-foreground">
                  Welcome back, {user.name || user.email}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="daily">Daily Log</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Log</TabsTrigger>
            <TabsTrigger value="future">Future Log</TabsTrigger>
            <TabsTrigger value="collections">Collections</TabsTrigger>
            <TabsTrigger value="index">Index</TabsTrigger>
          </TabsList>

          <TabsContent value="daily">
            <DailyLog
              entries={getDailyEntries()}
              currentDate={dailyDate}
              onDateChange={setDailyDate}
              onAddEntry={addEntry}
              onAddEvent={addEvent}
              onUpdateEntry={updateEntry}
              onDeleteEntry={deleteEntry}
            />
          </TabsContent>

          <TabsContent value="monthly">
            <MonthlyLog
              entries={getMonthlyEntries()}
              currentDate={monthlyDate}
              onDateChange={setMonthlyDate}
              onAddEntry={addEntry}
              onDayClick={handleDayClickFromMonthly}
              onUpdateEntry={updateEntry}
              onDeleteEntry={deleteEntry}
            />
          </TabsContent>

          <TabsContent value="future">
            <FutureLog
              entries={getFutureEntries()}
              currentYear={futureYear}
              onYearChange={setFutureYear}
              onAddEntry={addEntry}
              onUpdateEntry={updateEntry}
              onDeleteEntry={deleteEntry}
            />
          </TabsContent>

          <TabsContent value="collections">
            <Collections
              collections={collections}
              onAddCollection={addCollection}
              onDeleteCollection={deleteCollection}
              onAddItem={addCollectionItem}
              onToggleItem={toggleCollectionItem}
              onDeleteItem={deleteCollectionItem}
            />
          </TabsContent>

          <TabsContent value="index">
            <IndexNavigation
              entries={entries}
              collections={collections}
              onNavigateToDate={handleNavigateToDate}
              onNavigateToCollection={handleNavigateToCollection}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
