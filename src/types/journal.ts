export interface JournalEntry {
  id?: string;              // unique ID (optional since JSON doesn't have it)
  date: string;            // MM/DD/YYYY format "05/08/2025"
  imgUrl: string;          // thumbnail or image (matches JSON data)
  rating: number;          // 1-5 stars
  categories: string[];    // e.g. ["Deep Conditioning", "Moisture"]
  description: string;     // journal text
}
