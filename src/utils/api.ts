import { toast } from "sonner";

export interface Book {
  key: string;
  title: string;
  author_name?: string[];
  author_key?: string[];
  first_publish_year?: number;
  cover_i?: number;
  isbn?: string[];
  language?: string[];
  publisher?: string[];
  number_of_pages?: number;
  preview?: string;
  availability?: {
    status: string;
    available_to_borrow: boolean;
    available_to_waitlist: boolean;
  };
}

export interface SearchResponse {
  docs: Book[];
  numFound: number;
}

const BASE_URL = "https://openlibrary.org";

// Book Search API
export const searchBooks = async (query: string): Promise<SearchResponse> => {
  try {
    const response = await fetch(
      `${BASE_URL}/search.json?q=${encodeURIComponent(query)}&fields=*,availability&limit=20`
    );
    if (!response.ok) throw new Error('Failed to fetch books');
    return await response.json();
  } catch (error) {
    console.error('Error fetching books:', error);
    toast.error("Failed to fetch books. Please try again.");
    return { docs: [], numFound: 0 };
  }
};

// Works API
export const getBookDetails = async (workId: string) => {
  try {
    const [workResponse, editionsResponse] = await Promise.all([
      fetch(`${BASE_URL}/works/${workId}.json`),
      fetch(`${BASE_URL}/works/${workId}/editions.json`)
    ]);
    
    if (!workResponse.ok || !editionsResponse.ok) {
      throw new Error('Failed to fetch book details');
    }

    const workData = await workResponse.json();
    const editionsData = await editionsResponse.json();

    return {
      ...workData,
      editions: editionsData.entries
    };
  } catch (error) {
    console.error('Error fetching book details:', error);
    toast.error("Failed to fetch book details. Please try again.");
    return null;
  }
};

// Authors API
export const getAuthorDetails = async (authorKey: string) => {
  if (!authorKey?.startsWith('/authors/')) {
    console.error('Invalid author key format:', authorKey);
    return null;
  }

  try {
    const authorId = authorKey.replace('/authors/', '');
    const response = await fetch(`${BASE_URL}/authors/${authorId}.json`);
    if (!response.ok) throw new Error('Failed to fetch author details');
    return await response.json();
  } catch (error) {
    console.error('Error fetching author details:', error);
    return null;
  }
};

// Subjects API
export const getSubjectBooks = async (subject: string) => {
  try {
    const response = await fetch(`${BASE_URL}/subjects/${encodeURIComponent(subject)}.json`);
    if (!response.ok) throw new Error('Failed to fetch subject books');
    return await response.json();
  } catch (error) {
    console.error('Error fetching subject books:', error);
    return null;
  }
};

// ISBN API
export const getBookByISBN = async (isbn: string) => {
  try {
    const response = await fetch(`${BASE_URL}/isbn/${isbn}.json`);
    if (!response.ok) throw new Error('Failed to fetch book by ISBN');
    return await response.json();
  } catch (error) {
    console.error('Error fetching book by ISBN:', error);
    return null;
  }
};

// Covers API
export const getCoverUrl = (coverId: number, size: 'S' | 'M' | 'L' = 'M') => {
  return `https://covers.openlibrary.org/b/id/${coverId}-${size}.jpg`;
};

// Search Inside API
export const searchInsideBook = async (query: string, itemId: string) => {
  try {
    // First, get the metadata to find the correct host
    const metadataResponse = await fetch(`https://archive.org/metadata/${itemId}`);
    if (!metadataResponse.ok) throw new Error('Failed to fetch metadata');
    const metadata = await metadataResponse.json();
    
    const d1 = metadata.d1;
    const dir = metadata.dir;
    
    if (!d1 || !dir) throw new Error('Required metadata missing');

    const searchUrl = `https://${d1}.us.archive.org/fulltext/inside.php?item_id=${itemId}&doc=${itemId}&path=${dir}&q=${encodeURIComponent(query)}`;
    
    const response = await fetch(searchUrl);
    if (!response.ok) throw new Error('Failed to search inside book');
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching inside book:', error);
    return null;
  }
};

// My Books API (reading log)
export const getReadingLog = async (username: string, shelf: 'want-to-read' | 'currently-reading' | 'already-read') => {
  try {
    const response = await fetch(`${BASE_URL}/people/${username}/books/${shelf}.json`);
    if (!response.ok) throw new Error('Failed to fetch reading log');
    return await response.json();
  } catch (error) {
    console.error('Error fetching reading log:', error);
    return null;
  }
};

// Partner API (Read API)
export const getBookByIdentifier = async (type: 'isbn' | 'oclc' | 'lccn', id: string) => {
  try {
    const response = await fetch(`${BASE_URL}/api/books?bibkeys=${type}:${id}&format=json&jscmd=data`);
    if (!response.ok) throw new Error('Failed to fetch book by identifier');
    return await response.json();
  } catch (error) {
    console.error('Error fetching book by identifier:', error);
    return null;
  }
};
