Sure! Here's a concise and clear README.md you can use for your GitHub repository:

```markdown
# Book Recommendations Web App

A simple, mobile-friendly Next.js 13+ web app that recommends books based on user search queries. It enhances search results by fetching synonyms using the Datamuse API and displays books with cover images from the Open Library API. Results are paginated and sorted by average user ratings fetched from Open Library.

## Features

- Search for books by keyword or topic.
- Automatically fetches synonyms to broaden search results.
- Displays only books with cover images.
- Pagination to browse results in pages of 16 books.
- Books sorted by average rating (highest first).
- Responsive design with Tailwind CSS.
- Links to detailed book pages on Open Library.

## Technologies Used

- [Next.js 13+](https://nextjs.org/) with the `/app` directory and server/client components.
- [Tailwind CSS](https://tailwindcss.com/) for styling.
- [Datamuse API](https://www.datamuse.com/api/) for fetching synonyms (no API key required).
- [Open Library API](https://openlibrary.org/developers/api) for book data and ratings.

## Getting Started

### Prerequisites

- Node.js (v16 or later recommended)
- npm or yarn

### Installation

1. Clone the repo:

   ```
   git clone https://github.com/your-username/book-recommendations.git
   cd book-recommendations
   ```

2. Install dependencies:

   ```
   npm install
   # or
   yarn
   ```

3. Run the development server:

   ```
   npm run dev
   # or
   yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

- Enter a keyword or topic in the search bar.
- Click "Search" to see book recommendations.
- Use the "Previous" and "Next" buttons to navigate through pages.
- Click on a book’s link to view more details on Open Library.

## Notes

- The app fetches ratings for displayed books individually; this may cause slight delays on page load.
- The Datamuse API is free and does not require an API key.
- Open Library API does not guarantee ratings for all books.

## License

This project is licensed under the MIT License.

---

Feel free to open issues or submit pull requests!

```

---
