// pages/index.tsx
import React from "react";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";

// Define TypeScript types for the API response
type Book = {
  key: string;
  title: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
};

type OpenLibraryResponse = {
  docs: Book[];
};

export const getServerSideProps: GetServerSideProps<{
  books: Book[];
}> = async () => {
  const res = await fetch(
    "https://openlibrary.org/search.json?q=the+lord+of+the+rings"
  );
  const data: OpenLibraryResponse = await res.json();

  // Limit to first 10 results for simplicity
  const books = data.docs.slice(0, 10);

  return { props: { books } };
};

const Home = ({
  books,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <main style={{ fontFamily: "sans-serif", padding: "2rem" }}>
      <h1>The Lord of the Rings - Book Overview</h1>
      <ul style={{ listStyle: "none", padding: 0 }}>
        {books.map((book) => (
          <li
            key={book.key}
            style={{
              marginBottom: "2rem",
              padding: "1rem",
              border: "1px solid #ddd",
              borderRadius: "8px",
              display: "flex",
              alignItems: "flex-start",
              gap: "1rem",
            }}
          >
            {/* Book Cover */}
            <img
              src={
                book.cover_i
                  ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
                  : "https://via.placeholder.com/100x150?text=No+Cover"
              }
              alt={book.title}
              style={{ width: 100, height: 150, objectFit: "cover" }}
            />
            {/* Book Info */}
            <div>
              <h2 style={{ margin: "0 0 0.5rem 0" }}>{book.title}</h2>
              <p style={{ margin: "0 0 0.5rem 0" }}>
                <strong>Author(s):</strong>{" "}
                {book.author_name?.join(", ") || "Unknown"}
              </p>
              <p style={{ margin: "0 0 0.5rem 0" }}>
                <strong>First Published:</strong>{" "}
                {book.first_publish_year || "N/A"}
              </p>
              <a
                href={`https://openlibrary.org${book.key}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#0070f3" }}
              >
                View on Open Library
              </a>
            </div>
          </li>
        ))}
      </ul>
    </main>
  );
};

export default Home;
