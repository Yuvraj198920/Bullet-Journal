import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Checkbox } from "./ui/checkbox";
import { Plus, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Label } from "./ui/label";

export interface Collection {
  id: string;
  title: string;
  items: CollectionItem[];
}

export interface CollectionItem {
  id: string;
  text: string;
  checked: boolean;
}

interface CollectionsProps {
  collections: Collection[];
  onAddCollection: (title: string) => void;
  onDeleteCollection: (id: string) => void;
  onAddItem: (collectionId: string, text: string) => void;
  onToggleItem: (collectionId: string, itemId: string) => void;
  onDeleteItem: (collectionId: string, itemId: string) => void;
}

export function Collections({
  collections,
  onAddCollection,
  onDeleteCollection,
  onAddItem,
  onToggleItem,
  onDeleteItem,
}: CollectionsProps) {
  const [newCollectionTitle, setNewCollectionTitle] = useState("");
  const [newItemTexts, setNewItemTexts] = useState<Record<string, string>>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddCollection = () => {
    if (newCollectionTitle.trim()) {
      onAddCollection(newCollectionTitle);
      setNewCollectionTitle("");
      setDialogOpen(false);
    }
  };

  const handleAddItem = (collectionId: string) => {
    const text = newItemTexts[collectionId];
    if (text?.trim()) {
      onAddItem(collectionId, text);
      setNewItemTexts({ ...newItemTexts, [collectionId]: "" });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2>Collections</h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Collection
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Collection</DialogTitle>
              <DialogDescription>
                Collections help you organize specific themes or topics in your journal.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Collection Title</Label>
                <Input
                  value={newCollectionTitle}
                  onChange={(e) => setNewCollectionTitle(e.target.value)}
                  placeholder="e.g., Habit Tracker, Goals, Reading List..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleAddCollection();
                    }
                  }}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCollection} disabled={!newCollectionTitle.trim()}>
                Create
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {collections.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center text-muted-foreground">
              <p>No collections yet.</p>
              <p className="mt-2">
                Create collections to track habits, goals, or custom lists.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {collections.map((collection) => (
            <Card key={collection.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{collection.title}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteCollection(collection.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {collection.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 group">
                    <Checkbox
                      checked={item.checked}
                      onCheckedChange={() => onToggleItem(collection.id, item.id)}
                    />
                    <span
                      className={`flex-1 ${
                        item.checked ? "line-through text-muted-foreground" : ""
                      }`}
                    >
                      {item.text}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => onDeleteItem(collection.id, item.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}

                <div className="flex gap-2 pt-2">
                  <Input
                    value={newItemTexts[collection.id] || ""}
                    onChange={(e) =>
                      setNewItemTexts({
                        ...newItemTexts,
                        [collection.id]: e.target.value,
                      })
                    }
                    placeholder="Add new item..."
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleAddItem(collection.id);
                      }
                    }}
                  />
                  <Button
                    size="icon"
                    onClick={() => handleAddItem(collection.id)}
                    disabled={!newItemTexts[collection.id]?.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
