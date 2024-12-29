import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { BookCard } from "@/components/BookCard";
import { searchBooks } from "@/utils/api";
import { Loader2 } from "lucide-react";

const POPULAR_BOOKS = [
  "The Lord of the Rings",
  "1984",
  "Pride and Prejudice",
  "The Great Gatsby",
  "To Kill a Mockingbird",
];

const Index = () => {
  const [query, setQuery] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["books", searchTerm],
    queryFn: () => searchBooks(searchTerm || POPULAR_BOOKS[0]),
    enabled: true,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTerm(query);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">Book Explorer</h1>
        
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="Search for books..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Search"
              )}
            </Button>
          </div>
        </form>

        {!searchTerm && (
          <div className="flex flex-wrap gap-2 justify-center mb-8">
            {POPULAR_BOOKS.map((book) => (
              <Button
                key={book}
                variant="outline"
                onClick={() => {
                  setQuery(book);
                  setSearchTerm(book);
                }}
              >
                {book}
              </Button>
            ))}
          </div>
        )}

        {isError && (
          <div className="text-center text-red-500 mb-8">
            Failed to fetch books. Please try again.
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {data?.docs.map((book) => (
            <BookCard key={book.key} book={book} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;