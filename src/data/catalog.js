// =====================================================================
// The catalogue: movie genres and video categories.
// Each entry maps a human label to an Internet Archive search query.
// Queries lean on a mix of curated collections and subject terms so they
// stay populated even when a single collection is sparse.
// =====================================================================

export const MOVIE_GENRES = [
  {
    id: 'all',
    label: 'Feature Films',
    emoji: '🎬',
    blurb: 'Full-length classics in the public domain.',
    query: 'collection:(feature_films) AND mediatype:(movies)',
  },
  {
    id: 'noir',
    label: 'Film Noir',
    emoji: '🕵️',
    blurb: 'Shadows, detectives & double-crosses.',
    query: 'collection:(film_noir) OR (mediatype:(movies) AND subject:(film noir))',
  },
  {
    id: 'scifi-horror',
    label: 'Sci-Fi & Horror',
    emoji: '👽',
    blurb: 'Monsters, rockets and midnight chills.',
    query: 'collection:(SciFi_Horror) OR (mediatype:(movies) AND subject:(horror OR science fiction))',
  },
  {
    id: 'comedy',
    label: 'Comedy',
    emoji: '🤡',
    blurb: 'Slapstick, screwball and laughs.',
    query: 'mediatype:(movies) AND subject:(comedy)',
  },
  {
    id: 'drama',
    label: 'Drama',
    emoji: '🎭',
    blurb: 'Tales of love, loss and ambition.',
    query: 'mediatype:(movies) AND subject:(drama)',
  },
  {
    id: 'western',
    label: 'Westerns',
    emoji: '🤠',
    blurb: 'Gunslingers and the wide frontier.',
    query: 'mediatype:(movies) AND subject:(western)',
  },
  {
    id: 'silent',
    label: 'Silent Era',
    emoji: '🎻',
    blurb: 'Title cards and live-score classics.',
    query: 'collection:(silent_films) OR (mediatype:(movies) AND subject:(silent film))',
  },
  {
    id: 'animation',
    label: 'Animation',
    emoji: '✏️',
    blurb: 'Hand-drawn cartoons & cel artistry.',
    query: 'collection:(classic_cartoons) OR (mediatype:(movies) AND subject:(animation OR cartoon))',
  },
]

export const VIDEO_CATEGORIES = [
  {
    id: 'newsreels',
    label: 'Newsreels',
    emoji: '📰',
    blurb: 'The world as it was reported, reel by reel.',
    query: 'mediatype:(movies) AND subject:(newsreel OR news)',
  },
  {
    id: 'educational',
    label: 'Educational',
    emoji: '🏫',
    blurb: 'Classroom films and instructional shorts.',
    query: 'collection:(academic_films) OR (mediatype:(movies) AND subject:(educational))',
  },
  {
    id: 'ephemeral',
    label: 'Ephemeral & Home Movies',
    emoji: '🎞️',
    blurb: 'The Prelinger Archives of everyday life.',
    query: 'collection:(prelinger)',
  },
  {
    id: 'advertising',
    label: 'Advertising',
    emoji: '📺',
    blurb: 'Vintage commercials and sponsored films.',
    query: 'collection:(classic_tv_commercials) OR (mediatype:(movies) AND subject:(advertising OR commercial))',
  },
  {
    id: 'television',
    label: 'Television',
    emoji: '📡',
    blurb: 'Public-domain TV broadcasts & shows.',
    query: 'collection:(classic_tv) OR (mediatype:(movies) AND subject:(television))',
  },
  {
    id: 'documentary',
    label: 'Documentary',
    emoji: '🌍',
    blurb: 'Real stories and historical record.',
    query: 'mediatype:(movies) AND subject:(documentary)',
  },
  {
    id: 'travel',
    label: 'Travelogues',
    emoji: '🧳',
    blurb: 'Journeys to faraway places on film.',
    query: 'mediatype:(movies) AND subject:(travel OR travelogue)',
  },
  {
    id: 'music',
    label: 'Music & Performance',
    emoji: '🎷',
    blurb: 'Soundies, concerts and stage acts.',
    query: 'mediatype:(movies) AND subject:(music OR soundie OR performance)',
  },
]

export function findGenre(id) {
  return MOVIE_GENRES.find((g) => g.id === id)
}
export function findCategory(id) {
  return VIDEO_CATEGORIES.find((c) => c.id === id)
}
