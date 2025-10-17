import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { DailyLog } from "./components/DailyLog";
import { MonthlyLog } from "./components/MonthlyLog";
import { FutureLog } from "./components/FutureLog";
import { Collections, Collection } from "./components/Collections";
import { IndexNavigation } from "./components/IndexNavigation";
import { HabitsTracker, Habit, HabitFrequency, HabitCategory } from "./components/HabitsTracker";
import { BulletEntryData, EntryType, EventCategory } from "./components/BulletEntry";
import { LoginForm } from "./components/auth/LoginForm";
import { RegisterForm } from "./components/auth/RegisterForm";
import { PasswordResetForm } from "./components/auth/PasswordResetForm";
import { DataSyncBackup } from "./components/DataSyncBackup";
import { MobileNavigation } from "./components/MobileNavigation";
import { PullToRefreshIndicator } from "./components/PullToRefreshIndicator";
import { ThemeCustomizer } from "./components/ThemeCustomizer";
import { Button } from "./components/ui/button";
import { Toaster } from "./components/ui/sonner";
import { BookOpen, LogOut, Menu } from "lucide-react";
import { useIsMobile } from "./components/ui/use-mobile";
import { usePullToRefresh } from "./hooks/usePullToRefresh";
import { Sheet, SheetContent, SheetTrigger } from "./components/ui/sheet";
import { toast } from "sonner";
import { signIn, signUp, signOut, getSession, requestPasswordReset, onAuthStateChange, User } from "./lib/auth";
import { 
  getUserHabits, 
  createHabit, 
  deleteHabit as deleteHabitDB, 
  toggleHabitCompletion as toggleHabitCompletionDB,
  getAllUserHabitCompletions,
  getUserEntries,
  createEntry,
  updateEntry,
  deleteEntry,
  getUserCollections,
  createCollection,
  deleteCollection,
  createCollectionItem,
  getAllUserCollectionItems,
  toggleCollectionItem,
  deleteCollectionItem
} from "./utils/supabase/database";


type AuthView = "login" | "register" | "reset";

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [authView, setAuthView] = useState<AuthView>("login");
  const [loading, setLoading] = useState(true);
  const [entries, setEntries] = useState<BulletEntryData[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [dailyDate, setDailyDate] = useState(new Date());
  const [monthlyDate, setMonthlyDate] = useState(new Date());
  const [futureYear, setFutureYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState("daily");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const inactivityTimerRef = useRef<number | null>(null);
  const isMobile = useIsMobile();

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

  // Load user data from Supabase database
  const loadUserData = async (userId: string) => {
    try {
      // Load habits from database
      const habitsData = await getUserHabits();
      const completionsData = await getAllUserHabitCompletions();

      // Transform habits to app's format
      const transformedHabits: Habit[] = habitsData.map((h) => ({
        id: h.id,
        name: h.name,
        description: h.description || undefined,
        frequency: h.frequency as HabitFrequency,
        category: h.category as HabitCategory,
        color: h.color,
        createdAt: h.created_at,
        targetDays: h.target_days || undefined,
        icon: h.icon || undefined,
        completions: completionsData
          .filter((c) => c.habit_id === h.id)
          .map((c) => ({
            date: c.completion_date,
            completed: c.completed,
          })),
      }));

      setHabits(transformedHabits);

      // Load entries from database
      const entriesData = await getUserEntries();
      const transformedEntries: BulletEntryData[] = entriesData.map((e) => ({
        id: e.id,
        date: e.entry_date,
        type: e.entry_type as EntryType,
        content: e.content,
        state: e.state as TaskState,
        migrationCount: e.migration_count || undefined,
        signifiers: e.signifiers as any || undefined,
        eventState: e.event_state as any || undefined,
        eventTime: e.event_time || undefined,
        eventEndTime: e.event_end_time || undefined,
        isAllDay: e.is_all_day || undefined,
        eventCategory: e.event_category as EventCategory || undefined,
        isRecurring: e.is_recurring || undefined,
        recurringPattern: e.recurring_pattern || undefined,
      }));

      setEntries(transformedEntries);

      // Load collections from database
      const collectionsData = await getUserCollections();
      const collectionItemsData = await getAllUserCollectionItems();

      const transformedCollections: Collection[] = collectionsData.map((c) => ({
        id: c.id,
        title: c.title,
        items: collectionItemsData
          .filter((item) => item.collection_id === c.id)
          .map((item) => ({
            id: item.id,
            text: item.text,
            checked: item.checked,
          })),
      }));

      setCollections(transformedCollections);

    } catch (error) {
      console.error("Error loading user data:", error);
      toast.error("Failed to load your data. Please refresh the page.");
    }
  };

  // All data now saved to Supabase (no localStorage needed)

  const handleSignIn = async (email: string, password: string) => {
    const result = await signIn(email, password);
    setUser(result.user);
    setAccessToken(result.accessToken);
    loadUserData(result.user.id);
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    await signUp(email, password, name);
    // Automatically sign in after successful signup
    const result = await signIn(email, password);
    setUser(result.user);
    setAccessToken(result.accessToken);
    loadUserData(result.user.id);
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

  const addEntry = async (content: string, type: EntryType, date: Date) => {
    try {
      const newEntry = await createEntry({
        date: date.toISOString().split('T')[0],
        type,
        content,
        state: "incomplete",
      });

      setEntries([...entries, {
        id: newEntry.id,
        date: newEntry.entry_date,
        type: newEntry.entry_type as EntryType,
        content: newEntry.content,
        state: newEntry.state as any,
      }]);

      toast.success("Entry added successfully!");
    } catch (error) {
      console.error("Error adding entry:", error);
      toast.error("Failed to add entry. Please try again.");
    }
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

  const updateEntryLocal = async (id: string, updates: Partial<BulletEntryData>) => {
    try {
      await updateEntry(id, updates as any);
      setEntries(entries.map((entry) => (entry.id === id ? { ...entry, ...updates } : entry)));
    } catch (error) {
      console.error("Error updating entry:", error);
      toast.error("Failed to update entry.");
    }
  };

  const deleteEntryLocal = async (id: string) => {
    try {
      await deleteEntry(id);
      setEntries(entries.filter((entry) => entry.id !== id));
      toast.success("Entry deleted successfully!");
    } catch (error) {
      console.error("Error deleting entry:", error);
      toast.error("Failed to delete entry.");
    }
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

  // Collection handlers (now using Supabase)
  const addCollectionLocal = async (title: string) => {
    try {
      const newCollection = await createCollection(title);
      setCollections([...collections, {
        id: newCollection.id,
        title: newCollection.title,
        items: [],
      }]);
      toast.success("Collection created successfully!");
    } catch (error) {
      console.error("Error creating collection:", error);
      toast.error("Failed to create collection.");
    }
  };

  const deleteCollectionLocal = async (id: string) => {
    try {
      await deleteCollection(id);
      setCollections(collections.filter((c) => c.id !== id));
      toast.success("Collection deleted successfully!");
    } catch (error) {
      console.error("Error deleting collection:", error);
      toast.error("Failed to delete collection.");
    }
  };

  const addCollectionItemLocal = async (collectionId: string, text: string) => {
    try {
      const newItem = await createCollectionItem(collectionId, text);
      setCollections(
        collections.map((c) =>
          c.id === collectionId
            ? {
                ...c,
                items: [
                  ...c.items,
                  { id: newItem.id, text: newItem.text, checked: newItem.checked },
                ],
              }
            : c
        )
      );
    } catch (error) {
      console.error("Error adding collection item:", error);
      toast.error("Failed to add item.");
    }
  };

  const toggleCollectionItemLocal = async (collectionId: string, itemId: string) => {
    try {
      const newCheckedState = await toggleCollectionItem(itemId);
      setCollections(
        collections.map((c) =>
          c.id === collectionId
            ? {
                ...c,
                items: c.items.map((item) =>
                  item.id === itemId ? { ...item, checked: newCheckedState } : item
                ),
              }
            : c
        )
      );
    } catch (error) {
      console.error("Error toggling collection item:", error);
      toast.error("Failed to update item.");
    }
  };

  const deleteCollectionItemLocal = async (collectionId: string, itemId: string) => {
    try {
      await deleteCollectionItem(itemId);
      setCollections(
        collections.map((c) =>
          c.id === collectionId
            ? { ...c, items: c.items.filter((item) => item.id !== itemId) }
            : c
        )
      );
    } catch (error) {
      console.error("Error deleting collection item:", error);
      toast.error("Failed to delete item.");
    }
  };

  // Habit handlers (now using Supabase)
  const addHabit = async (habitData: Omit<Habit, "id" | "createdAt" | "completions">) => {
    try {
      const newHabit = await createHabit({
        name: habitData.name,
        description: habitData.description,
        frequency: habitData.frequency,
        category: habitData.category,
        color: habitData.color,
        targetDays: habitData.targetDays,
        icon: habitData.icon,
      });

      // Add to local state with proper format
      setHabits([
        ...habits,
        {
          id: newHabit.id,
          name: newHabit.name,
          description: newHabit.description || undefined,
          frequency: newHabit.frequency as HabitFrequency,
          category: newHabit.category as HabitCategory,
          color: newHabit.color,
          createdAt: newHabit.created_at,
          targetDays: newHabit.target_days || undefined,
          icon: newHabit.icon || undefined,
          completions: [],
        },
      ]);

      toast.success("Habit created successfully!");
    } catch (error) {
      console.error("Error creating habit:", error);
      toast.error("Failed to create habit. Please try again.");
    }
  };

  const deleteHabit = async (id: string) => {
    try {
      await deleteHabitDB(id);
      setHabits(habits.filter((h) => h.id !== id));
      toast.success("Habit deleted successfully!");
    } catch (error) {
      console.error("Error deleting habit:", error);
      toast.error("Failed to delete habit. Please try again.");
    }
  };

  const toggleHabitCompletion = async (habitId: string, date: string) => {
    try {
      const newCompletedState = await toggleHabitCompletionDB(habitId, date);

      // Update local state
      setHabits(
        habits.map((habit) => {
          if (habit.id === habitId) {
            const existingCompletion = habit.completions.find((c) => c.date === date);
            if (existingCompletion) {
              return {
                ...habit,
                completions: habit.completions.map((c) =>
                  c.date === date ? { ...c, completed: newCompletedState } : c
                ),
              };
            } else {
              return {
                ...habit,
                completions: [...habit.completions, { date, completed: newCompletedState }],
              };
            }
          }
          return habit;
        })
      );
    } catch (error) {
      console.error("Error toggling habit completion:", error);
      toast.error("Failed to update habit. Please try again.");
    }
  };

  // Import data from backup
  const handleImportData = (importedEntries: BulletEntryData[], importedCollections: Collection[]) => {
    setEntries(importedEntries);
    setCollections(importedCollections);
  };

  // Pull to refresh
  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success("Data refreshed!");
  };

  const { pulling, refreshing, pullDistance, progress } = usePullToRefresh({
    onRefresh: handleRefresh,
    disabled: !isMobile || !user,
  });

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
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Pull to Refresh Indicator */}
      <PullToRefreshIndicator
        pulling={pulling}
        refreshing={refreshing}
        progress={progress}
        pullDistance={pullDistance}
      />

      <div className="container mx-auto p-4 max-w-6xl">
        <header className="mb-4 md:mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 md:h-8 md:w-8" />
              <div>
                <h1 className="text-lg md:text-2xl">Bullet Journal</h1>
                <p className="text-xs md:text-sm text-muted-foreground hidden sm:block">
                  Welcome back, {user.name || user.email}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Desktop Actions */}
              {!isMobile && (
                <>
                  <ThemeCustomizer />
                  <DataSyncBackup
                    entries={entries}
                    collections={collections}
                    userId={user.id}
                    onImport={handleImportData}
                  />
                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </>
              )}

              {/* Mobile Menu */}
              {isMobile && (
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right">
                    <div className="flex flex-col gap-4 mt-8">
                      <div className="pb-4 border-b">
                        <p className="text-sm text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                      <ThemeCustomizer />
                      <DataSyncBackup
                        entries={entries}
                        collections={collections}
                        userId={user.id}
                        onImport={handleImportData}
                      />
                      <Button variant="outline" onClick={handleSignOut} className="justify-start">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </SheetContent>
                </Sheet>
              )}
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          {/* Desktop Tabs */}
          <TabsList className="hidden md:grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="daily">Daily Log</TabsTrigger>
            <TabsTrigger value="monthly">Monthly Log</TabsTrigger>
            <TabsTrigger value="future">Future Log</TabsTrigger>
            <TabsTrigger value="habits">Habits</TabsTrigger>
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
              onUpdateEntry={updateEntryLocal}
              onDeleteEntry={deleteEntryLocal}
            />
          </TabsContent>

          <TabsContent value="monthly">
            <MonthlyLog
              entries={getMonthlyEntries()}
              currentDate={monthlyDate}
              onDateChange={setMonthlyDate}
              onAddEntry={addEntry}
              onDayClick={handleDayClickFromMonthly}
              onUpdateEntry={updateEntryLocal}
              onDeleteEntry={deleteEntryLocal}
            />
          </TabsContent>

          <TabsContent value="future">
            <FutureLog
              entries={getFutureEntries()}
              currentYear={futureYear}
              onYearChange={setFutureYear}
              onAddEntry={addEntry}
              onUpdateEntry={updateEntryLocal}
              onDeleteEntry={deleteEntryLocal}
            />
          </TabsContent>

          <TabsContent value="habits">
            <HabitsTracker
              habits={habits}
              onAddHabit={addHabit}
              onDeleteHabit={deleteHabit}
              onToggleCompletion={toggleHabitCompletion}
              currentDate={dailyDate}
            />
          </TabsContent>

          <TabsContent value="collections">
            <Collections
              collections={collections}
              onAddCollection={addCollectionLocal}
              onDeleteCollection={deleteCollectionLocal}
              onAddItem={addCollectionItemLocal}
              onToggleItem={toggleCollectionItemLocal}
              onDeleteItem={deleteCollectionItemLocal}
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

      {/* Mobile Bottom Navigation */}
      {isMobile && user && (
        <MobileNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      )}

      <Toaster />
    </div>
  );
}
