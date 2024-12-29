import { useState } from "react";
import { Book, getCoverUrl, getBookDetails, getAuthorDetails } from "@/utils/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Loader2, Download, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { SearchInside } from "./BookSearch/SearchInside";

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(100);
  const [detailedBook, setDetailedBook] = useState<any>(null);
  const [authorDetails, setAuthorDetails] = useState<any>(null);

  const loadBookDetails = async () => {
    setLoading(true);
    setLoadingProgress(100);
    
    const interval = setInterval(() => {
      setLoadingProgress((prev) => Math.max(0, prev - 2));
    }, 50);

    try {
      const workId = book.key.replace('/works/', '');
      const [bookData, authorData] = await Promise.all([
        getBookDetails(workId),
        book.author_key?.[0] ? getAuthorDetails(book.author_key[0]) : null
      ]);

      setDetailedBook(bookData);
      setAuthorDetails(authorData);
    } catch (error) {
      toast.error("Failed to load book details");
    } finally {
      clearInterval(interval);
      setLoading(false);
      setLoadingProgress(0);
    }
  };

  const handleCardClick = () => {
    setShowDetails(true);
    if (!detailedBook) {
      loadBookDetails();
    }
  };

  return (
    <>
      <Card 
        className="h-full hover:shadow-lg transition-shadow cursor-pointer" 
        onClick={handleCardClick}
      >
        <CardContent className="p-4">
          <div className="aspect-[2/3] relative mb-4">
            {book.cover_i && (
              <img
                src={getCoverUrl(book.cover_i)}
                alt={book.title}
                className="w-full h-full object-cover rounded-md"
                loading="lazy"
              />
            )}
          </div>
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{book.title}</h3>
          {book.author_name && (
            <p className="text-sm text-gray-600 mb-2">{book.author_name[0]}</p>
          )}
          {book.first_publish_year && (
            <p className="text-sm text-gray-500">
              Published: {book.first_publish_year}
            </p>
          )}
        </CardContent>
      </Card>

      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden">
          {loading ? (
            <div className="p-8 space-y-4">
              <Progress value={loadingProgress} />
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <p>Loading book details...</p>
              </div>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>{book.title}</DialogTitle>
                {book.author_name && (
                  <DialogDescription>by {book.author_name.join(', ')}</DialogDescription>
                )}
              </DialogHeader>
              
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="description">Description</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="search">Search Inside</TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[60vh] mt-4">
                  <TabsContent value="details">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        {book.cover_i && (
                          <img
                            src={getCoverUrl(book.cover_i, 'L')}
                            alt={book.title}
                            className="w-full rounded-lg"
                          />
                        )}
                      </div>
                      <div className="space-y-4">
                        {detailedBook?.subjects && (
                          <div>
                            <h4 className="font-semibold">Subjects</h4>
                            <p className="text-sm">{detailedBook.subjects.join(', ')}</p>
                          </div>
                        )}
                        {book.publisher && (
                          <div>
                            <h4 className="font-semibold">Publisher</h4>
                            <p className="text-sm">{book.publisher.join(', ')}</p>
                          </div>
                        )}
                        {book.language && (
                          <div>
                            <h4 className="font-semibold">Languages</h4>
                            <p className="text-sm">{book.language.join(', ')}</p>
                          </div>
                        )}
                        {detailedBook?.availability && (
                          <div>
                            <h4 className="font-semibold">Availability</h4>
                            <p className="text-sm">
                              {detailedBook.availability.status}
                              {detailedBook.availability.available_to_borrow && 
                                " - Available to borrow"}
                            </p>
                          </div>
                        )}
                        <div className="pt-4 space-y-2">
                          <Button
                            className="w-full"
                            onClick={() => window.open(`https://openlibrary.org${book.key}`, '_blank')}
                          >
                            View on Open Library
                            <ExternalLink className="ml-2 h-4 w-4" />
                          </Button>
                          {detailedBook?.availability?.available_to_borrow && (
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => window.open(detailedBook.availability.borrow_url, '_blank')}
                            >
                              Download
                              <Download className="ml-2 h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="description">
                    <div className="prose max-w-none">
                      {detailedBook?.description ? (
                        typeof detailedBook.description === 'string' ? (
                          <p>{detailedBook.description}</p>
                        ) : (
                          <p>{detailedBook.description.value}</p>
                        )
                      ) : (
                        <p className="text-gray-500">No description available.</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="preview">
                    <div className="prose max-w-none">
                      {detailedBook?.excerpts ? (
                        detailedBook.excerpts.map((excerpt: any, index: number) => (
                          <div key={index} className="mb-4">
                            <h4 className="font-semibold">{excerpt.comment || `Excerpt ${index + 1}`}</h4>
                            <p>{excerpt.text}</p>
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-500">No preview available.</p>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="search">
                    {detailedBook?.ia ? (
                      <SearchInside itemId={detailedBook.ia[0]} />
                    ) : (
                      <p className="text-center text-gray-500">
                        Search inside feature is not available for this book.
                      </p>
                    )}
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
