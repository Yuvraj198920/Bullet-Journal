import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import {
  Search,
  Calendar,
  BookOpen,
  Star,
  Clock,
  Hash,
  ChevronRight,
  Bookmark,
} from "lucide-react";
import { BulletEntryData } from "./BulletEntry";
import { Collection } from "./Collections";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface IndexNavigationProps {
  entries: BulletEntryData[];
  collections: Collection[];
  onNavigateToDate: (date: Date, view: "daily" | "monthly") => void;
  onNavigateToCollection: (collectionId: string) => void;
}

export function IndexNavigation({
  entries,
  collections,
  onNavigateToDate,
  onNavigateToCollection,
}: IndexNavigationProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [bookmarkedDates, setBookmarkedDates] = useState<string[]>([]);

  // Search across all entries
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return entries
      .filter((entry) => entry.content.toLowerCase().includes(query))
      .slice(0, 20); // Limit to 20 results
  }, [searchQuery, entries]);

  // Recent entries (last 10)
  const recentEntries = useMemo(() => {
    return [...entries]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 10);
  }, [entries]);

  // Priority entries (with priority signifier)
  const priorityEntries = useMemo(() => {
    return entries.filter((e) => e.signifiers?.includes("priority"));
  }, [entries]);

  // Entries by date (grouped)
  const entriesByDate = useMemo(() => {
    const grouped = new Map<string, BulletEntryData[]>();
    entries.forEach((entry) => {
      const dateStr = new Date(entry.date).toDateString();
      if (!grouped.has(dateStr)) {
        grouped.set(dateStr, []);
      }
      grouped.get(dateStr)!.push(entry);
    });
    return Array.from(grouped.entries())
      .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime())
      .slice(0, 30); // Last 30 days with entries
  }, [entries]);

  // Extract tags from entries (words starting with #)
  const tags = useMemo(() => {
    const tagSet = new Set<string>();
    entries.forEach((entry) => {
      const matches = entry.content.match(/#\w+/g);
      if (matches) {
        matches.forEach((tag) => tagSet.add(tag.toLowerCase()));
      }
    });
    return Array.from(tagSet);
  }, [entries]);

  const toggleBookmark = (dateStr: string) => {
    setBookmarkedDates((prev) =>
      prev.includes(dateStr) ? prev.filter((d) => d !== dateStr) : [...prev, dateStr]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Index & Navigation
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Global Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search all entries, collections, and tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {searchResults.length > 0 && (
              <Card className="mt-2">
                <CardContent className="pt-4">
                  <ScrollArea className="h-64">
                    <div className="space-y-2">
                      {searchResults.map((entry) => (
                        <button
                          key={entry.id}
                          onClick={() => onNavigateToDate(new Date(entry.date), "daily")}
                          className="w-full text-left p-2 rounded hover:bg-accent transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="text-sm flex-1 line-clamp-2">{entry.content}</p>
                            <Badge variant="secondary" className="text-xs flex-shrink-0">
                              {new Date(entry.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </Badge>
                          </div>
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            )}
          </div>

          <Tabs defaultValue="recent" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="dates">Dates</TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
              <TabsTrigger value="tags">Tags</TabsTrigger>
              <TabsTrigger value="bookmarks">
                <Star className="h-3 w-3" />
              </TabsTrigger>
            </TabsList>

            {/* Recent Entries */}
            <TabsContent value="recent">
              <ScrollArea className="h-96">
                {recentEntries.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No recent entries</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentEntries.map((entry) => (
                      <button
                        key={entry.id}
                        onClick={() => onNavigateToDate(new Date(entry.date), "daily")}
                        className="w-full text-left p-3 rounded border hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {entry.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(entry.date)}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-2">{entry.content}</p>
                        {entry.signifiers && entry.signifiers.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {entry.signifiers.includes("priority") && (
                              <Badge variant="secondary" className="text-xs">
                                Priority
                              </Badge>
                            )}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Dates Index */}
            <TabsContent value="dates">
              <ScrollArea className="h-96">
                <div className="space-y-1">
                  {entriesByDate.map(([dateStr, dateEntries]) => {
                    const isBookmarked = bookmarkedDates.includes(dateStr);
                    return (
                      <div key={dateStr} className="group">
                        <div className="flex items-center gap-2 p-2 rounded hover:bg-accent">
                          <button
                            onClick={() => toggleBookmark(dateStr)}
                            className={`flex-shrink-0 ${
                              isBookmarked ? "text-yellow-500" : "text-muted-foreground"
                            }`}
                          >
                            <Star className={`h-3 w-3 ${isBookmarked ? "fill-current" : ""}`} />
                          </button>
                          <button
                            onClick={() => onNavigateToDate(new Date(dateStr), "daily")}
                            className="flex-1 text-left flex items-center justify-between"
                          >
                            <span className="text-sm">{formatDate(dateStr)}</span>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{dateEntries.length}</Badge>
                              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Collections Index */}
            <TabsContent value="collections">
              <ScrollArea className="h-96">
                {collections.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No collections yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {collections.map((collection) => (
                      <button
                        key={collection.id}
                        onClick={() => onNavigateToCollection(collection.id)}
                        className="w-full text-left p-3 rounded border hover:bg-accent transition-colors group"
                      >
                        <div className="flex items-center justify-between">
                          <h4>{collection.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">{collection.items.length} items</Badge>
                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Tags */}
            <TabsContent value="tags">
              <ScrollArea className="h-96">
                {tags.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Hash className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No tags found</p>
                    <p className="text-xs mt-2">Use #tags in your entries</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => {
                      const tagEntries = entries.filter((e) =>
                        e.content.toLowerCase().includes(tag)
                      );
                      return (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => setSearchQuery(tag)}
                        >
                          {tag} ({tagEntries.length})
                        </Badge>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>

            {/* Bookmarks */}
            <TabsContent value="bookmarks">
              <ScrollArea className="h-96">
                {bookmarkedDates.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Bookmark className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No bookmarks yet</p>
                    <p className="text-xs mt-2">Click the star icon on dates to bookmark them</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {bookmarkedDates.map((dateStr) => {
                      const dateEntries = entries.filter(
                        (e) => new Date(e.date).toDateString() === dateStr
                      );
                      return (
                        <button
                          key={dateStr}
                          onClick={() => onNavigateToDate(new Date(dateStr), "daily")}
                          className="w-full text-left p-3 rounded border hover:bg-accent transition-colors group"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm">{formatDate(dateStr)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{dateEntries.length}</Badge>
                              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>

          {/* Priority Entries Quick Access */}
          {priorityEntries.length > 0 && (
            <>
              <Separator className="my-6" />
              <div>
                <h3 className="flex items-center gap-2 mb-3">
                  <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                  Priority Items
                </h3>
                <ScrollArea className="h-48">
                  <div className="space-y-2">
                    {priorityEntries.slice(0, 5).map((entry) => (
                      <button
                        key={entry.id}
                        onClick={() => onNavigateToDate(new Date(entry.date), "daily")}
                        className="w-full text-left p-2 rounded border border-amber-200 dark:border-amber-900 hover:bg-accent transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <Badge variant="outline" className="text-xs">
                            {entry.type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {new Date(entry.date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <p className="text-sm line-clamp-2">{entry.content}</p>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
