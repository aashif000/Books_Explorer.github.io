import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { searchInsideBook } from "@/utils/api";
import { Loader2 } from "lucide-react";

interface SearchInsideProps {
  itemId: string;
}

interface SearchMatch {
  text: string;
  par: Array<{
    page: number;
    page_width: number;
    page_height: number;
    boxes: Array<{
      r: number;
      b: number;
      t: number;
      l: number;
    }>;
  }>;
}

export function SearchInside({ itemId }: SearchInsideProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<SearchMatch[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const results = await searchInsideBook(query, itemId);
      if (results?.matches) {
        setMatches(results.matches);
      }
    } catch (error) {
      console.error("Error searching inside book:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <Input
          type="text"
          placeholder="Search inside this book..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" disabled={loading}>
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>
      </form>

      <ScrollArea className="h-[400px] rounded-md border p-4">
        {matches.length > 0 ? (
          <div className="space-y-4">
            {matches.map((match, index) => (
              <div key={index} className="space-y-2">
                <p className="text-sm text-gray-700">{match.text}</p>
                <p className="text-xs text-gray-500">
                  Page {match.par[0]?.page || "N/A"}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">
            {loading ? "Searching..." : "No results found"}
          </p>
        )}
      </ScrollArea>
    </div>
  );
}