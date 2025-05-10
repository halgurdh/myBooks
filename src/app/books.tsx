'use client';

import React from 'react';

type Book = {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
  rating?: number | null;
};

type BooksProps = {
  books: Book[];
  loading: boolean;
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
};

export default function Books({ books, loading, page, totalPages, setPage }: BooksProps) {
  if (loading) {
    return <div className="text-center text-gray-500">Loading recommendations...</div>;
  }
  if (books.length === 0) {
    return <div className="text-center text-gray-500">No recommendations found.</div>;
  }
  return (
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
          onClick={() => setPage(Math.max(1, page - 1))}
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
          onClick={() => setPage(page + 1)}
          disabled={page === totalPages || books.length < 16}
          className={`px-4 py-2 rounded-lg border ${
            page === totalPages || books.length < 16
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`}
        >
          Next
        </button>
      </div>
    </>
  );
}
