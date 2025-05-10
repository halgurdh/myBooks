'use client';

import React, { useState, useEffect } from 'react';
import Books from './books';

type Book = {
  id: string;
  title: string;
  authors?: string[];
  publishedYear?: number;
  cover?: string;
  rating?: number | null;
  categories?: string[];
  description?: string;
};

const PAGE_SIZE = 16;

const GENRES = [
  '',
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Romance',
  'Horror',
  'Biography',
  'History',
  'Children',
  'Young Adult',
  'Thriller',
  'Adventure',
  'Poetry',
  'Drama',
  'Comics',
  'Art',
  'Travel',
];

const fetchSynonyms = async (word: string): Promise<string[]> => {
  const res = await fetch(
    `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}`
  );
  const data = await res.json();
  return data.map((entry: { word: string }) => entry.word);
};


const fetchBooks = async (
  terms: string[],
  genre: string
): Promise<Book[]> => {
  // Fetch up to 40 books per term, merge & deduplicate
  let allBooks: Book[] = [];
  const seenIds = new Set<string>();

  for (const term of terms) {
    let query = encodeURIComponent(term);
    if (genre) query += `+subject:${encodeURIComponent(genre)}`;
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=40`;
    const res = await fetch(url);
    const data = await res.json();
    if (!data.items) continue;
    const books = data.items.map((item: any) => ({
      id: item.id,
      title: item.volumeInfo.title,
      authors: item.volumeInfo.authors,
      publishedYear: item.volumeInfo.publishedDate
        ? parseInt(item.volumeInfo.publishedDate.substring(0, 4))
        : undefined,
      cover: item.volumeInfo.imageLinks?.thumbnail,
      rating: item.volumeInfo.averageRating ?? null,
      categories: item.volumeInfo.categories,
      description: item.volumeInfo.description,
    }));
    // Deduplicate by book id
    for (const book of books) {
      if (!seenIds.has(book.id)) {
        allBooks.push(book);
        seenIds.add(book.id);
      }
    }
  }
  return allBooks;
};

export default function Page() {
  // Form state
  const [input, setInput] = useState('adventure');
  const [yearFrom, setYearFrom] = useState<string>('');
  const [yearTo, setYearTo] = useState<string>('');
  const [genre, setGenre] = useState<string>('');

  // Search state
  const [lastQuery, setLastQuery] = useState('adventure');
  const [lastFilters, setLastFilters] = useState({
    yearFrom: '',
    yearTo: '',
    genre: '',
  });

  const [books, setBooks] = useState<Book[]>([]);
  const [usedTerms, setUsedTerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  // Client-side filtered books and pagination
  const [filteredBooks, setFilteredBooks] = useState<Book[]>([]);

  useEffect(() => {
    const doSearch = async () => {
      setLoading(true);
      const synonyms = await fetchSynonyms(lastQuery);
      const terms = Array.from(new Set([lastQuery, ...synonyms])).slice(0, 5);
      setUsedTerms(terms);

      // Fetch books without year filter
      const fetchedBooks = await fetchBooks(
        terms,
        lastFilters.genre
      );

      // Client-side year range filtering
      const from = lastFilters.yearFrom ? parseInt(lastFilters.yearFrom, 10) : 1990;
      const to = lastFilters.yearTo ? parseInt(lastFilters.yearTo, 10) : new Date().getFullYear();
      const filtered = fetchedBooks.filter(
        (b) =>
          b.publishedYear &&
          b.publishedYear >= from &&
          b.publishedYear <= to
      );

      // Sort by rating, descending
      filtered.sort((a, b) => {
        if (a.rating == null && b.rating == null) return 0;
        if (a.rating == null) return 1;
        if (b.rating == null) return -1;
        return b.rating - a.rating;
      });

      setBooks(filtered);
      setFilteredBooks(filtered);
      setLoading(false);
    };
    doSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastQuery, lastFilters, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Always reset to first page
    setLastQuery(input);
    setLastFilters({
      yearFrom,
      yearTo,
      genre,
    });
  };

  // Paginate filteredBooks
  const totalPages = Math.ceil(filteredBooks.length / PAGE_SIZE);
  const paginatedBooks = filteredBooks.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <main className="max-w-7xl mx-auto p-4 font-sans">
      <h1 className="text-3xl font-semibold text-center mb-6">
        Book Recommendations (Google Books, Synonyms & Ratings)
      </h1>
      <form
        onSubmit={handleSearch}
        className="flex flex-wrap justify-center mb-8 gap-2"
        autoComplete="off"
      >
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter a topic or keyword..."
          className="w-full max-w-xs px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-400"
        />
        <input
          type="number"
          value={yearFrom}
          onChange={e => setYearFrom(e.target.value)}
          placeholder="Year from"
          className="w-28 px-4 py-2 border rounded-lg shadow-sm"
          min={0}
        />
        <input
          type="number"
          value={yearTo}
          onChange={e => setYearTo(e.target.value)}
          placeholder="Year to"
          className="w-28 px-4 py-2 border rounded-lg shadow-sm"
          min={0}
        />
        <select
          value={genre}
          onChange={e => setGenre(e.target.value)}
          className="w-40 px-4 py-2 border rounded-lg shadow-sm"
        >
          <option value="">All Genres</option>
          {GENRES.filter(g => g).map(g => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Search
        </button>
      </form>

      {usedTerms.length > 1 && (
        <div className="text-center mb-4 text-sm text-gray-600">
          Searching for: <span className="font-semibold">{usedTerms.join(', ')}</span>
        </div>
      )}

      <Books
        books={paginatedBooks}
        loading={loading}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />
    </main>
  );
}
