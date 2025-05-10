'use client';

import React, { useState, useEffect } from 'react';
import Books from './books';

type Book = {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  work_key?: string;
  rating?: number | null;
  subject?: string[];
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
  page: number,
  yearFrom: string,
  yearTo: string,
  genre: string
): Promise<{ books: Book[]; numFound: number }> => {
  let query = terms.map(encodeURIComponent).join('+OR+');
  let url = `https://openlibrary.org/search.json?q=${query}&limit=${PAGE_SIZE}&page=${page}`;
  if (yearFrom) url += `&first_publish_year=${yearFrom}`;
  if (yearTo) url += `&first_publish_year=${yearTo}`;
  if (genre) url += `&subject=${encodeURIComponent(genre)}`;

  const res = await fetch(url);
  const data = await res.json();
  const booksWithCovers: Book[] = data.docs
    .filter((b: Book) => b.cover_i && b.key)
    .map((b: any) => ({
      ...b,
      work_key: b.key.replace(/^\/works\//, ''),
      subject: b.subject,
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
  // Form state (what the user is editing)
  const [input, setInput] = useState('adventure');
  const [yearFrom, setYearFrom] = useState<string>('');
  const [yearTo, setYearTo] = useState<string>('');
  const [genre, setGenre] = useState<string>('');

  // Search state (what is actually searched)
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
  const [numFound, setNumFound] = useState(0);

  useEffect(() => {
    const doSearch = async () => {
      setLoading(true);
      const synonyms = await fetchSynonyms(lastQuery);
      const terms = Array.from(new Set([lastQuery, ...synonyms])).slice(0, 5);
      setUsedTerms(terms);

      const { books, numFound } = await fetchBooks(
        terms,
        page,
        lastFilters.yearFrom,
        lastFilters.yearTo,
        lastFilters.genre
      );

      const booksWithRatings = await Promise.all(
        books.map(async (book) => {
          if (!book.work_key) return { ...book, rating: null };
          const rating = await fetchRating(book.work_key);
          return { ...book, rating };
        })
      );

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastQuery, lastFilters, page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // <-- Always reset to first page
    setLastQuery(input);
    setLastFilters({
      yearFrom,
      yearTo,
      genre,
    });
  };
  

  const totalPages = Math.ceil(numFound / PAGE_SIZE);

  return (
    <main className="max-w-7xl mx-auto p-4 font-sans">
      <h1 className="text-3xl font-semibold text-center mb-6">
        Book Recommendations (with Synonyms & Ratings)
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
        books={books}
        loading={loading}
        page={page}
        totalPages={totalPages}
        setPage={setPage}
      />
    </main>
  );
}
