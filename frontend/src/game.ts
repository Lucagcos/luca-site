export type Pack = 'classic' | 'grover'
export type Answer = { name: string; points: number; aliases?: string[] }
export type Question = {
  id: string
  category: string
  pack: Pack
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
      answer('Chinese', 10), answer('Japanese', 15), answer('Portuguese', 25),
      answer('Vietnamese', 35), answer('Cantonese', 45), answer('Burmese', 55),
      answer('Nepalese', 60), answer('Sinhalese', 70), answer('Javanese', 75),
      answer('Sundanese', 85), answer('Balinese', 90), answer('Madurese', 95),
      answer('Buginese', 100),
    ],
  },
  {
    id: 'am', category: 'Around the world', pack: 'classic',
    prompt: 'Name a country containing both “A” and “M”.',
    detail: 'Any order in its full or common English name. UN member states; familiar abbreviations count.',
    answers: [
      answer('United States of America', 10, ['USA', 'US', 'United States', 'America']),
      answer('Germany', 15), answer('Jamaica', 25),
      answer('Malaysia', 30), answer('Vietnam', 35, ['Viet Nam']),
      answer('Romania', 40), answer('Myanmar', 45, ['Burma']),
      answer('Panama', 45), answer('Guatemala', 50), answer('Armenia', 55),
      answer('Cameroon', 55), answer('Malta', 60), answer('Mozambique', 65),
      answer('Madagascar', 65), answer('Mali', 70), answer('Zambia', 70),
      answer('Namibia', 75), answer('Malawi', 75), answer('Maldives', 75),
      answer('The Bahamas', 80, ['Bahamas']), answer('The Gambia', 80, ['Gambia']),
      answer('Denmark', 50), answer('Oman', 65), answer('Somalia', 70),
      answer('Mauritania', 85), answer('Mauritius', 85), answer('Marshall Islands', 90),
      answer('San Marino', 90), answer('Turkmenistan', 90),
      answer('North Macedonia', 85, ['Macedonia']), answer('Dominica', 95),
      answer('Dominican Republic', 45), answer('Democratic Republic of the Congo', 65, ['DR Congo', 'DRC']),
      answer('Monaco', 60), answer('Cambodia', 60), answer('Samoa', 90),
      answer('United Arab Emirates', 55, ['UAE']),
      answer('Zimbabwe', 65), answer('Suriname', 95),
      answer('Federated States of Micronesia', 100, ['Micronesia']),
    ],
  },
  {
    id: 'land', category: 'Around the world', pack: 'classic',
    prompt: 'Name a country ending in “-land”.',
    detail: 'Use the common English name of a current UN member state.',
    answers: [answer('Thailand', 10), answer('Ireland', 20), answer('New Zealand', 30),
      answer('Switzerland', 40), answer('Iceland', 55), answer('Finland', 70),
      answer('Poland', 80)],
  },
  {
    id: 'planets', category: 'Out of this world', pack: 'classic',
    prompt: 'Name a moon of a planet in our solar system.',
    detail: 'A named natural satellite. Earth’s Moon counts; dwarf-planet moons do not.',
    answers: [answer('Moon', 10, ['The Moon', 'Luna']), answer('Titan', 25),
      answer('Europa', 30), answer('Io', 35), answer('Ganymede', 45),
      answer('Callisto', 50), answer('Phobos', 55), answer('Deimos', 60),
      answer('Enceladus', 65), answer('Triton', 70), answer('Rhea', 75),
      answer('Titania', 80), answer('Oberon', 85), answer('Mimas', 85),
      answer('Iapetus', 90), answer('Dione', 90), answer('Tethys', 95),
      answer('Miranda', 95), answer('Ariel', 95), answer('Umbriel', 100),
      answer('Hyperion', 100), answer('Nereid', 100)],
  },
  {
    id: 'instruments', category: 'Good vibrations', pack: 'classic',
    prompt: 'Name a musical instrument with strings.',
    detail: 'Plucked, bowed, or struck: all three count.',
    answers: [answer('Guitar', 10), answer('Violin', 15), answer('Piano', 20),
      answer('Cello', 30, ['Violoncello']), answer('Harp', 35), answer('Ukulele', 40, ['Ukelele']),
      answer('Banjo', 45), answer('Viola', 50), answer('Double bass', 55, ['Upright bass', 'Contrabass']),
      answer('Mandolin', 60), answer('Sitar', 65), answer('Lute', 70), answer('Dulcimer', 75),
      answer('Zither', 80), answer('Koto', 85), answer('Oud', 90),
      answer('Erhu', 95), answer('Guzheng', 100), answer('Nyckelharpa', 100)],
  },
  {
    id: 'halls', category: 'Campus life', pack: 'grover',
    prompt: 'Name a Grove City College residence hall.',
    detail: 'A current residence hall or Colonial Hall Apartments. Short names count.',
    source: residenceSource,
    answers: [
      answer('Hicks Hall', 15, ['Hicks']), answer('MAP North', 20, ['North Hall', 'Mary Anderson Pew North', 'MAP North Hall']),
      answer('Memorial Hall', 30, ['Memorial']), answer('MAP West', 40, ['West Hall', 'Mary Anderson Pew West', 'MAP West Hall']),
      answer('MAP South', 45, ['South Hall', 'Mary Anderson Pew South', 'MAP South Hall']),
      answer('MEP Hall', 50, ['MEP', 'Mary Ethel Pew', 'Mary Ethel Pew Hall']),
      answer('Ketler Hall', 60, ['Ketler']), answer('Harker Hall', 65, ['Harker']),
      answer('Hopeman Hall', 75, ['Hopeman']), answer('Lincoln Hall', 80, ['Lincoln']),
      answer('Alumni Hall', 90, ['Alumni']), answer('Colonial Hall Apartments', 100, ['Colonial', 'Colonial Hall']),
    ],
  },
  {
    id: 'presidents', category: 'Grove lore', pack: 'grover',
    prompt: 'Name a past president of Grove City College.',
    detail: 'A president who completed their term by 2025. Surnames count, except the two Ketlers.',
    source: 'https://www.gcc.edu/Home/Our-Story/History/Past-Presidents',
    answers: [
      answer('Paul J. McNulty', 15, ['Paul McNulty', 'McNulty']),
      answer('Isaac Conrad Ketler', 25, ['Isaac Ketler']),
      answer('Richard G. Jewell', 45, ['Richard Jewell', 'Jewell']),
      answer('Weir Carlyle Ketler', 55, ['Weir Ketler']),
      answer('Charles Sherrard MacKenzie', 65, ['Charles MacKenzie', 'MacKenzie']),
      answer('John Stanley Harker', 75, ['John Harker', 'Harker']),
      answer('John H. Moore', 85, ['John Moore', 'Moore']),
      answer('Jerry H. Combee', 95, ['Jerry Combee', 'Combee']),
      answer('Alexander T. Ormond', 100, ['Alexander Ormond', 'Ormond']),
    ],
  },
  {
    id: 'values', category: 'Faith & purpose', pack: 'grover',
    prompt: 'Name one of GCC’s five founding principles.',
    detail: 'Use one of the five values named on the College’s official history page.',
    source: 'https://www.gcc.edu/Home/Our-Story/History',
    answers: [answer('Faithfulness', 20), answer('Excellence', 35),
      answer('Community', 50), answer('Independence', 75), answer('Stewardship', 100)],
  },
  {
    id: 'mens-halls', category: 'Campus life', pack: 'grover',
    prompt: 'Name an upperclassmen’s male residence hall at GCC.',
    detail: 'One of the four halls listed under “Male Residence Halls” on GCC’s website.',
    source: residenceSource,
    answers: [answer('Ketler Hall', 20, ['Ketler']), answer('Hopeman Hall', 45, ['Hopeman']),
      answer('Lincoln Hall', 70, ['Lincoln']), answer('Alumni Hall', 100, ['Alumni'])],
  },
  {
    id: 'womens-halls', category: 'Campus life', pack: 'grover',
    prompt: 'Name an upperclasswomen’s residence hall at GCC.',
    detail: 'One of the four halls listed under “Female Residence Halls” on GCC’s website.',
    source: residenceSource,
    answers: [answer('MAP South', 20, ['South Hall', 'Mary Anderson Pew South', 'MAP South Hall']),
      answer('MAP West', 45, ['West Hall', 'Mary Anderson Pew West', 'MAP West Hall']),
      answer('MEP Hall', 70, ['MEP', 'Mary Ethel Pew', 'Mary Ethel Pew Hall']),
      answer('Harker Hall', 100, ['Harker'])],
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

function editDistance(left: string, right: string): number {
  let previous = Array.from({ length: right.length + 1 }, (_, i) => i)
  for (let i = 1; i <= left.length; i++) {
    const current = [i]
    for (let j = 1; j <= right.length; j++) {
      current[j] = Math.min(
        current[j - 1] + 1,
        previous[j] + 1,
        previous[j - 1] + (left[i - 1] === right[j - 1] ? 0 : 1),
      )
    }
    previous = current
  }
  return previous[right.length]
}

export type AnswerMatch =
  | { kind: 'exact'; answer: Answer }
  | { kind: 'correction'; answer: Answer }
  | { kind: 'ambiguous' }
  | { kind: 'missing' }

export function matchAnswer(question: Question, input: string): AnswerMatch {
  const normalized = normalizeAnswer(input)
  if (!normalized) return { kind: 'missing' }
  const exact = findAnswer(question, input)
  if (exact) {
    return { kind: normalizeAnswer(exact.name) === normalized ? 'exact' : 'correction', answer: exact }
  }
  let closest: Answer[] = []
  let bestDistance = 3
  for (const answer of question.answers) {
    const distance = Math.min(...[answer.name, ...(answer.aliases ?? [])].map((name) => {
      const candidate = normalizeAnswer(name)
      return Math.abs(candidate.length - normalized.length) > 2 ? 3 : editDistance(normalized, candidate)
    }))
    if (distance < bestDistance) {
      bestDistance = distance
      closest = [answer]
    } else if (distance === bestDistance && distance <= 2) {
      closest.push(answer)
    }
  }
  if (closest.length > 1) return { kind: 'ambiguous' }
  return closest.length === 1 ? { kind: 'correction', answer: closest[0] } : { kind: 'missing' }
}

export function rarity(points: number): string {
  if (points >= 90) return 'Legendary'
  if (points >= 65) return 'Rare'
  if (points >= 35) return 'Uncommon'
  return 'Common'
}

export function makeDeck(pack: Pack, random = Math.random, bank: Question[] = questions, customBank: Question[] = []): Question[] {
  const packCustom = customBank.filter((question) => question.pack === pack)
  const pool = [...bank, ...customBank].filter((question) => question.pack === pack)
  const shuffle = (items: Question[]) => {
    for (let i = items.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1))
      ;[items[i], items[j]] = [items[j], items[i]]
    }
    return items
  }
  if (pack === 'grover') {
    return shuffle(packCustom.length > 0 ? packCustom : bank.filter((question) => question.pack === pack)).slice(0, 5)
  }
  const custom = shuffle(pool.filter((question) => question.id.startsWith('custom-')))
  const builtIn = shuffle(pool.filter((question) => !question.id.startsWith('custom-')))
  const deck = [...custom.slice(0, 5), ...builtIn.slice(0, Math.max(0, 5 - custom.length))]
  return shuffle(deck)
}
