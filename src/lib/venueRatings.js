// Frontend-only mock store shaped like the Laravel public endpoint:
// GET /api/venues/{venueId}/ratings -> { status, data: { average_rating, ratings_count, ratings[] } }

const venueRatingsMock = {
  status: "success",
  data: {
    average_rating: 4.3,
    ratings_count: 12,
    ratings: [
      {
        rating: 5,
        comment: "Excellent venue and very professional service.",
        customer_name: "Ahmad Khaled",
        created_at: "2026-08-15T14:30:00.000000Z",
      },
      {
        rating: 4,
        comment: "Beautiful hall, but parking was a little limited.",
        customer_name: "Sara Mahmoud",
        created_at: "2026-08-14T12:20:00.000000Z",
      },
      {
        rating: 4,
        comment: null,
        customer_name: "Omar Hassan",
        created_at: "2026-08-13T10:10:00.000000Z",
      },
    ],
  },
};

export function getVenueRatings(venueId) {
  // In the future this will call GET /api/venues/{venueId}/ratings.
  // For now every venue shares the same mock response.
  return venueRatingsMock;
}

export function formatRatingDate(iso, ar) {
  try {
    return new Date(iso).toLocaleDateString(ar ? "ar-EG" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso;
  }
}
