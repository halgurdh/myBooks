'use client';

import React, { useState, useEffect } from 'react';

type Book = {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  work_key?: string;
  rating?: number | null;
};

const PAGE_SIZE = 16;

const fetchSynonyms = async (word: string): Promise<string[]> => {
  const res = await fetch(
    `https://api.datamuse.com/words?rel_syn=${encodeURIComponent(word)}`
  );
  const data = await res.json();
  return data.map((entry: { word: string }) => entry.word);
};

const fetchBooks = async (
  terms: string[],
  page: number
): Promise<{ books: Book[]; numFound: number }> => {
  const query = terms.map(encodeURIComponent).join('+OR+');
  const res = await fetch(
    `https://openlibrary.org/search.json?q=${query}&limit=${PAGE_SIZE}&page=${page}`
  );
  const data = await res.json();
  // Only books with covers
  const booksWithCovers: Book[] = data.docs
    .filter((b: Book) => b.cover_i && b.key)
    .map((b: any) => ({
      ...b,
      work_key: b.key.replace(/^\/works\//, ''),
    }));
  return { books: booksWithCovers, numFound: data.numFound };
};

const fetchRating = async (workKey: string): Promise<number | null> => {
  try {
    const res = await fetch(`https://openlibrary.org/works/${workKey}/ratings.json`);
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.summary?.average === 'number' ? data.summary.average : null;
  } catch {
    return null;
  }
};

export default function Page() {
  const [input, setInput] = useState('adventure');
  const [books, setBooks] = useState<Book[]>([]);
  const [usedTerms, setUsedTerms] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [numFound, setNumFound] = useState(0);
  const [lastQuery, setLastQuery] = useState('adventure');

  useEffect(() => {
    const doSearch = async () => {
      setLoading(true);
      // 1. Get synonyms
      const synonyms = await fetchSynonyms(lastQuery);
      const terms = Array.from(new Set([lastQuery, ...synonyms])).slice(0, 5);
      setUsedTerms(terms);

      // 2. Fetch books
      const { books, numFound } = await fetchBooks(terms, page);

      // 3. Fetch ratings for each book (in parallel)
      const booksWithRatings = await Promise.all(
        books.map(async (book) => {
          if (!book.work_key) return { ...book, rating: null };
          const rating = await fetchRating(book.work_key);
          return { ...book, rating };
        })
      );

      // 4. Sort by rating (highest first, unrated last)
      booksWithRatings.sort((a, b) => {
        if (a.rating == null && b.rating == null) return 0;
        if (a.rating == null) return 1;
        if (b.rating == null) return -1;
        return b.rating - a.rating;
      });

      setBooks(booksWithRatings);
      setNumFound(numFound);
      setLoading(false);
    };
    doSearch();
  }, [lastQuery, page]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setLastQuery(input);
  };

  const totalPages = Math.ceil(numFound / PAGE_SIZE);

  return (
    <main className="max-w-7xl mx-auto p-4 font-sans">
      <h1 className="text-3xl font-semibold text-center mb-6">
        Book Recommendations (with Synonyms & Ratings)
      </h1>
      <form onSubmit={handleSearch} className="flex justify-center mb-8 gap-2" autoComplete="off">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Enter a topic or keyword..."
          className="w-full max-w-xs px-4 py-2 border rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-400"
        />
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

      {loading ? (
        <div className="text-center text-gray-500">Loading recommendations...</div>
      ) : books.length === 0 ? (
        <div className="text-center text-gray-500">No recommendations found.</div>
      ) : (
        <>
          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {books.map((book) => (
              <li
                key={book.key}
                className="flex flex-col bg-white border rounded-lg shadow-sm p-4"
              >
                <img
                  src={`https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`}
                  alt={book.title}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
                <h2 className="text-lg font-medium mb-1">{book.title}</h2>
                <p className="text-sm mb-1">
                  <span className="font-semibold">Author(s): </span>
                  {book.author_name?.join(", ") || "Unknown"}
                </p>
                <p className="text-sm mb-1">
                  <span className="font-semibold">First Published: </span>
                  {book.first_publish_year || "N/A"}
                </p>
                <p className="text-sm mb-2">
                  <span className="font-semibold">Rating: </span>
                  {book.rating != null ? (
                    <span className="text-yellow-600 font-bold">{book.rating.toFixed(2)} / 5</span>
                  ) : (
                    <span className="text-gray-400">No rating</span>
                  )}
                </p>
                <a
                  href={`https://openlibrary.org${book.key}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-auto text-blue-600 hover:underline text-sm"
                >
                  View on Open Library
                </a>
              </li>
            ))}
          </ul>
          <div className="flex justify-center items-center gap-4 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`px-4 py-2 rounded-lg border ${
                page === 1
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Previous
            </button>
            <span className="text-sm">
              Page {page} of {totalPages || 1}
            </span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={page === totalPages || books.length < PAGE_SIZE}
              className={`px-4 py-2 rounded-lg border ${
                page === totalPages || books.length < PAGE_SIZE
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              Next
            </button>
          </div>
        </>
      )}
    </main>
  );
}
