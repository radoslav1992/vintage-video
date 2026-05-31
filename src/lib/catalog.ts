// =====================================================================
// The catalogue: movie genres and video categories.
// Each maps a human label to an Internet Archive search query, blending
// curated collections with subject terms so results stay populated.
// =====================================================================

export interface Group {
  id: string
  label: string
  emoji: string
  blurb: string
  query: string
}

export const MOVIE_GENRES: Group[] = [
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
    query:
      'collection:(SciFi_Horror) OR (mediatype:(movies) AND subject:(horror OR science fiction))',
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
    query:
      'collection:(classic_cartoons) OR (mediatype:(movies) AND subject:(animation OR cartoon))',
  },
]

export const VIDEO_CATEGORIES: Group[] = [
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
    query:
      'collection:(classic_tv_commercials) OR (mediatype:(movies) AND subject:(advertising OR commercial))',
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

export function findGroup(groups: Group[], id: string | null): Group {
  return groups.find((g) => g.id === id) || groups[0]
}
