/**
 * The daily post: one quote over one painting, shown where a removed feed used to be, with a way
 * back to the feed under it. All of it changes once a day, at local midnight, so refreshing never
 * brings a new one: a post that changed on every visit would become a feed of its own.
 *
 * Every quote is checked word for word against a public-domain translation, and every painting
 * is in the public domain. The images themselves live with each app (`public/posts/<id>.webp`
 * in the extension), cropped to 4:5 at 960×1200.
 */

export interface Quote {
  text: string;
  /** Shown under the quote: the author, or the Bible reference. */
  by: string;
  /** Where the wording comes from. */
  source: string;
}

export interface Painting {
  /** The image's file name, without the extension. */
  id: string;
  title: string;
  artist: string;
  year: string;
  /** The image's page on Wikimedia Commons, which records its public-domain status. */
  url: string;
}

export interface Post {
  quote: Quote;
  painting: Painting;
  /** The label of the way back to the feed. */
  giveIn: string;
}

const KJV = 'King James Version (1611)';
const SHORTNESS = (chapter: string) =>
  `On the Shortness of Life, ${chapter}, tr. Aubrey Stewart (1889)`;
const LETTERS = (letter: number) =>
  `Moral Letters to Lucilius, ${letter}, tr. Richard M. Gummere (1917)`;
const MEDITATIONS = (section: string) => `Meditations, ${section}, tr. George Long (1862)`;

/** Alternates between the Stoics and the Bible, so consecutive days differ in voice. */
export const QUOTES: readonly Quote[] = [
  {
    text: 'Postponement is the greatest waste of life: it wrings day after day from us, and takes away the present by promising something hereafter.',
    by: 'Seneca',
    source: SHORTNESS('IX'),
  },
  {
    text: 'How long wilt thou sleep, O sluggard? when wilt thou arise out of thy sleep?',
    by: 'Proverbs 6:9',
    source: KJV,
  },
  {
    text: 'No longer talk at all about the kind of man that a good man ought to be, but be such.',
    by: 'Marcus Aurelius',
    source: MEDITATIONS('X.16'),
  },
  {
    text: 'Whatsoever thy hand findeth to do, do it with thy might.',
    by: 'Ecclesiastes 9:10',
    source: KJV,
  },
  {
    text: 'Hold every hour in your grasp. Lay hold of to-day’s task, and you will not need to depend so much upon to-morrow’s.',
    by: 'Seneca',
    source: LETTERS(1),
  },
  {
    text: 'Let thine eyes look right on, and let thine eyelids look straight before thee.',
    by: 'Proverbs 4:25',
    source: KJV,
  },
  {
    text: 'How long will you then still defer thinking yourself worthy of the best things?',
    by: 'Epictetus',
    source: 'Enchiridion, 51, tr. George Long (1877)',
  },
  {
    text: 'Seest thou a man diligent in his business? he shall stand before kings.',
    by: 'Proverbs 22:29',
    source: KJV,
  },
  {
    text: 'Do not act as if thou wert going to live ten thousand years. Death hangs over thee. While thou livest, while it is in thy power, be good.',
    by: 'Marcus Aurelius',
    source: MEDITATIONS('IV.17'),
  },
  {
    text: 'He that observeth the wind shall not sow; and he that regardeth the clouds shall not reap.',
    by: 'Ecclesiastes 11:4',
    source: KJV,
  },
  {
    text: 'Everywhere means nowhere.',
    by: 'Seneca',
    source: LETTERS(2),
  },
  {
    text: 'Watch ye, stand fast in the faith, quit you like men, be strong.',
    by: '1 Corinthians 16:13',
    source: KJV,
  },
  {
    text: 'In the morning when thou risest unwillingly, let this thought be present — I am rising to the work of a human being.',
    by: 'Marcus Aurelius',
    source: MEDITATIONS('V.1'),
  },
  {
    text: 'Yet a little sleep, a little slumber, a little folding of the hands to sleep: so shall thy poverty come as one that travelleth, and thy want as an armed man.',
    by: 'Proverbs 6:10–11',
    source: KJV,
  },
  {
    text: 'We do not receive a short life, but we make it a short one, and we are not poor in days, but wasteful of them.',
    by: 'Seneca',
    source: SHORTNESS('I'),
  },
  {
    text: 'So teach us to number our days, that we may apply our hearts unto wisdom.',
    by: 'Psalm 90:12',
    source: KJV,
  },
  {
    text: 'First say to yourself, what you would be; and then do, what you have to do.',
    by: 'Epictetus',
    source: 'Discourses, III.23, tr. Elizabeth Carter (1758)',
  },
  {
    text: 'He that is slow to anger is better than the mighty; and he that ruleth his spirit than he that taketh a city.',
    by: 'Proverbs 16:32',
    source: KJV,
  },
  {
    text: 'Remember how long thou hast been putting off these things, and how often thou hast received an opportunity from the gods, and yet dost not use it.',
    by: 'Marcus Aurelius',
    source: MEDITATIONS('II.4'),
  },
  {
    text: 'Know ye not that they which run in a race run all, but one receiveth the prize? So run, that ye may obtain.',
    by: '1 Corinthians 9:24',
    source: KJV,
  },
  {
    text: 'While we are postponing, life speeds by.',
    by: 'Seneca',
    source: LETTERS(1),
  },
  {
    text: 'Therefore to him that knoweth to do good, and doeth it not, to him it is sin.',
    by: 'James 4:17',
    source: KJV,
  },
  {
    text: 'Such as are thy habitual thoughts, such also will be the character of thy mind; for the soul is dyed by the thoughts.',
    by: 'Marcus Aurelius',
    source: MEDITATIONS('V.16'),
  },
  {
    text: 'I have fought a good fight, I have finished my course, I have kept the faith.',
    by: '2 Timothy 4:7',
    source: KJV,
  },
  {
    text: 'When a man does not know what harbour he is making for, no wind is the right wind.',
    by: 'Seneca',
    source: LETTERS(71),
  },
  {
    text: 'He that hath no rule over his own spirit is like a city that is broken down, and without walls.',
    by: 'Proverbs 25:28',
    source: KJV,
  },
  {
    text: 'Every habit and faculty is maintained and increased by the corresponding actions: the habit of walking by walking, the habit of running by running.',
    by: 'Epictetus',
    source: 'Discourses, II.18, tr. George Long (1877)',
  },
  {
    text: 'I must work the works of him that sent me, while it is day: the night cometh, when no man can work.',
    by: 'John 9:4',
    source: KJV,
  },
  {
    text: 'Occupy thyself with few things, says the philosopher, if thou wouldst be tranquil.',
    by: 'Marcus Aurelius',
    source: MEDITATIONS('IV.24'),
  },
  {
    text: 'Boast not thyself of to morrow; for thou knowest not what a day may bring forth.',
    by: 'Proverbs 27:1',
    source: KJV,
  },
  {
    text: 'There is no such obstacle to true living as waiting, which loses to-day while it is depending on the morrow.',
    by: 'Seneca',
    source: SHORTNESS('IX'),
  },
  {
    text: 'Forgetting those things which are behind, and reaching forth unto those things which are before, I press toward the mark.',
    by: 'Philippians 3:13–14',
    source: KJV,
  },
  {
    text: 'Look within. Within is the fountain of good, and it will ever bubble up, if thou wilt ever dig.',
    by: 'Marcus Aurelius',
    source: MEDITATIONS('VII.59'),
  },
  {
    text: 'The hand of the diligent shall bear rule: but the slothful shall be under tribute.',
    by: 'Proverbs 12:24',
    source: KJV,
  },
  {
    text: 'Nothing, Lucilius, is ours, except time.',
    by: 'Seneca',
    source: LETTERS(1),
  },
  {
    text: 'Let us run with patience the race that is set before us.',
    by: 'Hebrews 12:1',
    source: KJV,
  },
  {
    text: 'Every moment think steadily as a Roman and a man to do what thou hast in hand with perfect and simple dignity.',
    by: 'Marcus Aurelius',
    source: MEDITATIONS('II.5'),
  },
  {
    text: 'See then that ye walk circumspectly, not as fools, but as wise, redeeming the time, because the days are evil.',
    by: 'Ephesians 5:15–16',
    source: KJV,
  },
  {
    text: 'We suffer more often in imagination than in reality.',
    by: 'Seneca',
    source: LETTERS(13),
  },
  {
    text: 'And let us not be weary in well doing: for in due season we shall reap, if we faint not.',
    by: 'Galatians 6:9',
    source: KJV,
  },
];

const commons = (file: string) => `https://commons.wikimedia.org/wiki/File:${file}`;

export const PAINTINGS: readonly Painting[] = [
  {
    id: 'golden-helmet',
    title: 'The Man with the Golden Helmet',
    artist: 'Circle of Rembrandt',
    year: 'c. 1650',
    url: commons('Rembrandt_(circle)_-_The_Man_with_the_Golden_Helmet_-_Google_Art_Project.jpg'),
  },
  {
    id: 'vigil',
    title: 'The Vigil',
    artist: 'John Pettie',
    year: '1884',
    url: commons('John_Pettie_(1839-1893)_-_A_knight%27s_vigil_(1884).jpg'),
  },
  {
    id: 'saint-paul',
    title: 'Saint Paul in Prison',
    artist: 'Rembrandt',
    year: '1627',
    url: commons('1627_Rembrandt_Paulus_im_Gef%C3%A4ngnis_Staatsgalerie_Stuttgart_anagoria.JPG'),
  },
  {
    id: 'crossroads',
    title: 'The Knight at the Crossroads',
    artist: 'Viktor Vasnetsov',
    year: '1882',
    url: commons('Victor_Vasnetsov_-_Knight_at_the_Crossroads_-_Google_Art_Project.jpg'),
  },
  {
    id: 'wignacourt',
    title: 'Portrait of Alof de Wignacourt',
    artist: 'Caravaggio',
    year: 'c. 1608',
    url: commons('Portrait_of_Alof_de_Wignacourt_and_his_Page-Caravaggio_(1607-1608).jpg'),
  },
  {
    id: 'wanderer',
    title: 'Wanderer above the Sea of Fog',
    artist: 'Caspar David Friedrich',
    year: 'c. 1817',
    url: commons('Caspar_David_Friedrich_-_Wanderer_above_the_Sea_of_Fog.jpeg'),
  },
  {
    id: 'knight-death-devil',
    title: 'Knight, Death and the Devil',
    artist: 'Albrecht Dürer',
    year: '1513',
    url: commons('Albrecht_D%C3%BCrer,_Knight,_Death_and_Devil,_1513,_NGA_598.jpg'),
  },
  {
    id: 'saint-jerome',
    title: 'Saint Jerome Writing',
    artist: 'Caravaggio',
    year: 'c. 1606',
    url: commons('Saint_Jerome_Writing-Caravaggio_(1605-6).jpg'),
  },
  {
    id: 'man-in-armour',
    title: 'A Man in Armour',
    artist: 'Rembrandt',
    year: '1655',
    url: commons('Rembrandt_Man_in_Armour.jpg'),
  },
  {
    id: 'daniel',
    title: 'Daniel’s Answer to the King',
    artist: 'Briton Rivière',
    year: '1890',
    url: commons('Briton_Riviere_-_Daniel%27s_Answer_to_the_King_(Manchester_Art_Gallery).jpg'),
  },
  {
    id: 'polish-rider',
    title: 'The Polish Rider',
    artist: 'Rembrandt',
    year: 'c. 1655',
    url: commons('Rembrandt_-_De_Poolse_ruiter,_c.1655_(Frick_Collection).jpg'),
  },
];

/**
 * The way back to the feed, under the post. It's the only thing to click there, so its wording
 * makes you think twice, and it still goes through the prompt.
 */
export const GIVE_IN: readonly string[] = [
  'Succumb to temptation',
  'Abandon the vigil',
  'Surrender to the feed',
  'Lay down your sword',
  'Fold your hands a little longer',
  'Waste another hour',
  'Desert your post',
  'Choose the easy road',
  'Put it off again',
  'Kneel to the algorithm',
  'Let the day slip away',
  'Yield, just this once',
];

/** Days since 1970-01-01 by the local calendar, so the post changes at local midnight. */
export function dayNumber(date: Date): number {
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000);
}

/** The post for a given day. Everyone sees the same post on the same date, on every device. */
export function postFor(date: Date): Post {
  const day = dayNumber(date);
  const quote = day % QUOTES.length;
  // Each time the quotes start over, the paintings shift one step, so over time every quote
  // meets every painting, whatever the two list lengths are.
  const cycle = Math.floor(day / QUOTES.length);
  return {
    quote: QUOTES[quote]!,
    painting: PAINTINGS[(quote + cycle) % PAINTINGS.length]!,
    giveIn: GIVE_IN[day % GIVE_IN.length]!,
  };
}
