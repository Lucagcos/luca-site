export type Pack = 'classic' | 'grover' | 'mixed'
export type Answer = { name: string; points: number; aliases?: string[] }
export type Question = {
  id: string
  category: string
  pack: Exclude<Pack, 'mixed'>
  prompt: string
  detail: string
  answers: Answer[]
  source?: string
}

const answer = (name: string, points: number, aliases?: string[]): Answer => ({ name, points, aliases })
const residenceSource = 'https://www.gcc.edu/Home/Experience-the-Grove/Campus-Life/Residence-Life/Residence-Halls'

export const questions: Question[] = [
  {
    id: 'ese', category: 'Word nerd', pack: 'classic',
    prompt: 'Name a language ending in “-ese”.',
    detail: 'Use its English name. Dialects and regional languages count too.',
    answers: [
      answer('Chinese', 100), answer('Japanese', 150), answer('Portuguese', 250),
      answer('Vietnamese', 350), answer('Cantonese', 450), answer('Burmese', 550),
      answer('Nepalese', 600), answer('Sinhalese', 700), answer('Javanese', 750),
      answer('Sundanese', 850), answer('Balinese', 900), answer('Madurese', 950),
      answer('Buginese', 1000),
    ],
  },
  {
    id: 'am', category: 'Around the world', pack: 'classic',
    prompt: 'Name a country containing both “A” and “M”.',
    detail: 'Any order in its full or common English name. UN member states; familiar abbreviations count.',
    answers: [
      answer('United States of America', 100, ['USA', 'US', 'United States', 'America']),
      answer('Germany', 150), answer('Jamaica', 250),
      answer('Malaysia', 300), answer('Vietnam', 350, ['Viet Nam']),
      answer('Romania', 400), answer('Myanmar', 450, ['Burma']),
      answer('Panama', 450), answer('Guatemala', 500), answer('Armenia', 550),
      answer('Cameroon', 550), answer('Malta', 600), answer('Mozambique', 650),
      answer('Madagascar', 650), answer('Mali', 700), answer('Zambia', 700),
      answer('Namibia', 750), answer('Malawi', 750), answer('Maldives', 750),
      answer('The Bahamas', 800, ['Bahamas']), answer('The Gambia', 800, ['Gambia']),
      answer('Denmark', 500), answer('Oman', 650), answer('Somalia', 700),
      answer('Mauritania', 850), answer('Mauritius', 850), answer('Marshall Islands', 900),
      answer('San Marino', 900), answer('Turkmenistan', 900),
      answer('North Macedonia', 850, ['Macedonia']), answer('Dominica', 950),
      answer('Dominican Republic', 450), answer('Democratic Republic of the Congo', 650, ['DR Congo', 'DRC']),
      answer('Monaco', 600), answer('Cambodia', 600), answer('Samoa', 900),
      answer('United Arab Emirates', 550, ['UAE']),
      answer('Zimbabwe', 650), answer('Suriname', 950),
      answer('Federated States of Micronesia', 1000, ['Micronesia']),
    ],
  },
  {
    id: 'land', category: 'Around the world', pack: 'classic',
    prompt: 'Name a country ending in “-land”.',
    detail: 'Use the common English name of a current UN member state.',
    answers: [answer('Thailand', 100), answer('Ireland', 200), answer('New Zealand', 300),
      answer('Switzerland', 400), answer('Iceland', 550), answer('Finland', 700),
      answer('Poland', 800)],
  },
  {
    id: 'planets', category: 'Out of this world', pack: 'classic',
    prompt: 'Name a moon of a planet in our solar system.',
    detail: 'A named natural satellite. Earth’s Moon counts; dwarf-planet moons do not.',
    answers: [answer('Moon', 100, ['The Moon', 'Luna']), answer('Titan', 250),
      answer('Europa', 300), answer('Io', 350), answer('Ganymede', 450),
      answer('Callisto', 500), answer('Phobos', 550), answer('Deimos', 600),
      answer('Enceladus', 650), answer('Triton', 700), answer('Rhea', 750),
      answer('Titania', 800), answer('Oberon', 850), answer('Mimas', 850),
      answer('Iapetus', 900), answer('Dione', 900), answer('Tethys', 950),
      answer('Miranda', 950), answer('Ariel', 950), answer('Umbriel', 1000),
      answer('Hyperion', 1000), answer('Nereid', 1000)],
  },
  {
    id: 'instruments', category: 'Good vibrations', pack: 'classic',
    prompt: 'Name a musical instrument with strings.',
    detail: 'Plucked, bowed, or struck: all three count.',
    answers: [answer('Guitar', 100), answer('Violin', 150), answer('Piano', 200),
      answer('Cello', 300, ['Violoncello']), answer('Harp', 350), answer('Ukulele', 400, ['Ukelele']),
      answer('Banjo', 450), answer('Viola', 500), answer('Double bass', 550, ['Upright bass', 'Contrabass']),
      answer('Mandolin', 600), answer('Sitar', 650), answer('Lute', 700), answer('Dulcimer', 750),
      answer('Zither', 800), answer('Koto', 850), answer('Oud', 900),
      answer('Erhu', 950), answer('Guzheng', 1000), answer('Nyckelharpa', 1000)],
  },
  {
    id: 'halls', category: 'Campus life', pack: 'grover',
    prompt: 'Name a Grove City College residence hall.',
    detail: 'A current residence hall or Colonial Hall Apartments. Short names count.',
    source: residenceSource,
    answers: [
      answer('Hicks Hall', 150, ['Hicks']), answer('MAP North', 200, ['North Hall', 'Mary Anderson Pew North', 'MAP North Hall']),
      answer('Memorial Hall', 300, ['Memorial']), answer('MAP West', 400, ['West Hall', 'Mary Anderson Pew West', 'MAP West Hall']),
      answer('MAP South', 450, ['South Hall', 'Mary Anderson Pew South', 'MAP South Hall']),
      answer('MEP Hall', 500, ['MEP', 'Mary Ethel Pew', 'Mary Ethel Pew Hall']),
      answer('Ketler Hall', 600, ['Ketler']), answer('Harker Hall', 650, ['Harker']),
      answer('Hopeman Hall', 750, ['Hopeman']), answer('Lincoln Hall', 800, ['Lincoln']),
      answer('Alumni Hall', 900, ['Alumni']), answer('Colonial Hall Apartments', 1000, ['Colonial', 'Colonial Hall']),
    ],
  },
  {
    id: 'presidents', category: 'Grove lore', pack: 'grover',
    prompt: 'Name a past president of Grove City College.',
    detail: 'A president who completed their term by 2025. Surnames count, except the two Ketlers.',
    source: 'https://www.gcc.edu/Home/Our-Story/History/Past-Presidents',
    answers: [
      answer('Paul J. McNulty', 150, ['Paul McNulty', 'McNulty']),
      answer('Isaac Conrad Ketler', 250, ['Isaac Ketler']),
      answer('Richard G. Jewell', 450, ['Richard Jewell', 'Jewell']),
      answer('Weir Carlyle Ketler', 550, ['Weir Ketler']),
      answer('Charles Sherrard MacKenzie', 650, ['Charles MacKenzie', 'MacKenzie']),
      answer('John Stanley Harker', 750, ['John Harker', 'Harker']),
      answer('John H. Moore', 850, ['John Moore', 'Moore']),
      answer('Jerry H. Combee', 950, ['Jerry Combee', 'Combee']),
      answer('Alexander T. Ormond', 1000, ['Alexander Ormond', 'Ormond']),
    ],
  },
  {
    id: 'values', category: 'Faith & purpose', pack: 'grover',
    prompt: 'Name one of GCC’s five founding principles.',
    detail: 'Use one of the five values named on the College’s official history page.',
    source: 'https://www.gcc.edu/Home/Our-Story/History',
    answers: [answer('Faithfulness', 200), answer('Excellence', 350),
      answer('Community', 500), answer('Independence', 750), answer('Stewardship', 1000)],
  },
  {
    id: 'mens-halls', category: 'Campus life', pack: 'grover',
    prompt: 'Name an upperclassmen’s male residence hall at GCC.',
    detail: 'One of the four halls listed under “Male Residence Halls” on GCC’s website.',
    source: residenceSource,
    answers: [answer('Ketler Hall', 200, ['Ketler']), answer('Hopeman Hall', 450, ['Hopeman']),
      answer('Lincoln Hall', 700, ['Lincoln']), answer('Alumni Hall', 1000, ['Alumni'])],
  },
  {
    id: 'womens-halls', category: 'Campus life', pack: 'grover',
    prompt: 'Name an upperclasswomen’s residence hall at GCC.',
    detail: 'One of the four halls listed under “Female Residence Halls” on GCC’s website.',
    source: residenceSource,
    answers: [answer('MAP South', 200, ['South Hall', 'Mary Anderson Pew South', 'MAP South Hall']),
      answer('MAP West', 450, ['West Hall', 'Mary Anderson Pew West', 'MAP West Hall']),
      answer('MEP Hall', 700, ['MEP', 'Mary Ethel Pew', 'Mary Ethel Pew Hall']),
      answer('Harker Hall', 1000, ['Harker'])],
  },
]

export function normalizeAnswer(value: string): string {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]/g, '')
}

export function findAnswer(question: Question, input: string): Answer | undefined {
  const normalized = normalizeAnswer(input)
  if (!normalized) return undefined
  return question.answers.find(({ name, aliases = [] }) =>
    [name, ...aliases].some((value) => normalizeAnswer(value) === normalized))
}

export function rarity(points: number): string {
  if (points >= 900) return 'Legendary'
  if (points >= 650) return 'Rare'
  if (points >= 350) return 'Uncommon'
  return 'Common'
}

export function makeDeck(pack: Pack, random = Math.random): Question[] {
  const pool = questions.filter((question) => pack === 'mixed' || question.pack === pack)
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  // Keep the first game approachable, without making every replay identical.
  if (pack === 'classic') {
    const first = pool.findIndex((question) => question.id === 'ese')
    ;[pool[0], pool[first]] = [pool[first], pool[0]]
  }
  return pool.slice(0, 5)
}
