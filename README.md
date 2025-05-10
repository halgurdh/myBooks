```markdown
# Book Recommendations Web App

A simple, mobile-friendly Next.js 13+ web app that recommends books based on user search queries. It enhances search results by fetching synonyms using the Datamuse API and displays books with cover images and ratings from the Google Books API. Results are paginated, sorted by average user ratings (when available), and can be filtered by publication year and genre.

## Features

- **Search** for books by keyword or topic.
- **Synonym Expansion:** Automatically fetches synonyms to broaden search results.
- **Filter by Publication Year:** Specify a year range (from–to) to narrow results.
- **Filter by Genre/Subject:** Choose from popular genres to refine your search.
- **Cover Images:** Displays only books with cover images.
- **Pagination:** Browse results in pages of 16 books.
- **Sort by Rating:** Books sorted by average rating (highest first, when available).
- **Responsive Design:** Built with Tailwind CSS for mobile and desktop.
- **Book Details:** Links to detailed book pages on Google Books.

## Technologies Used

- [Next.js 13+](https://nextjs.org/) with the `/app` directory and server/client components.
- [Tailwind CSS](https://tailwindcss.com/) for styling.
- [Datamuse API](https://www.datamuse.com/api/) for fetching synonyms (no API key required).
- [Google Books API](https://developers.google.com/books/docs/v1/using) for book data, covers, and ratings.

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
- (Optional) Enter a year range and/or select a genre to filter results.
- Click "Search" to see book recommendations.
- Use the "Previous" and "Next" buttons to navigate through pages.
- Click on a book’s link to view more details on Google Books.

## Notes

- The app broadens your search using synonyms from Datamuse, then merges results from Google Books for each term.
- Filtering by year and genre is performed client-side after retrieving results.
- The Datamuse API is free and does not require an API key.
- The Google Books API is free for moderate use and does not require an API key for basic search. For high-volume or production use, you may [register for a key](https://developers.google.com/books/docs/v1/using#APIKey).
- Not all books have ratings or cover images; the app gracefully handles missing data.

## License

This project is licensed under the MIT License.

---

Feel free to open issues or submit pull requests!
```
