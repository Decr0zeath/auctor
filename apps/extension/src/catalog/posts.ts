/**
 * The post: one quote over one painting, shown where a removed feed used to be, with a way back to
 * the feed under it. All of it, the prompt included, changes every POST_MINUTES minutes, on the
 * same clock everywhere, and each change brings a new quote and a new painting. Refreshing never
 * brings one sooner: a post that changed on every visit would become a feed of its own.
 *
 * Every quote is checked word for word against a public-domain translation, and every painting
 * is in the public domain. So is the one statue, Marcus Aurelius, whose photographer released the
 * photo under CC0. The images themselves live with each app (`public/posts/<id>.webp` in the
 * extension), cropped to 4:5 at 960×1200.
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

/** The way back to the feed: its label, and the prompt it opens. */
export interface GiveIn {
  label: string;
  /** A statement, not a question. */
  title: string;
  message: string;
}

export interface Post {
  quote: Quote;
  painting: Painting;
  giveIn: GiveIn;
}

const KJV = 'King James Version (1611)';
const SHORTNESS = (chapter: string) =>
  `On the Shortness of Life, ${chapter}, tr. Aubrey Stewart (1889)`;
const LETTERS = (letter: number) =>
  `Moral Letters to Lucilius, ${letter}, tr. Richard M. Gummere (1917)`;
const MEDITATIONS = (section: string) => `Meditations, ${section}, tr. George Long (1862)`;

/** Alternates between the Stoics and the Bible, so consecutive posts differ in voice. */
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

/** Mounted and standing figures take turns, so a horse seldom shows two posts in a row. */
export const PAINTINGS: readonly Painting[] = [
  {
    id: 'marcus-aurelius',
    title: 'Equestrian Statue of Marcus Aurelius',
    artist: 'Unknown Roman sculptor',
    year: 'c. 175 AD',
    url: commons('Gilded_bronze_equestrian_statue_of_Marcus_Aurelius,_Musei_Capitolini.jpg'),
  },
  {
    id: 'golden-helmet',
    title: 'The Man with the Golden Helmet',
    artist: 'Circle of Rembrandt',
    year: 'c. 1650',
    url: commons('Rembrandt_(circle)_-_The_Man_with_the_Golden_Helmet_-_Google_Art_Project.jpg'),
  },
  {
    id: 'charging-chasseur',
    title: 'The Charging Chasseur',
    artist: 'Théodore Géricault',
    year: '1812',
    url: commons('GericaultHorseman.jpg'),
  },
  {
    id: 'thor',
    title: 'Thor’s Fight with the Giants',
    artist: 'Mårten Eskil Winge',
    year: '1872',
    url: commons(
      'M%C3%A5rten_Eskil_Winge_-_Tor%27s_Fight_with_the_Giants_-_Google_Art_Project.jpg',
    ),
  },
  {
    id: 'crossroads',
    title: 'The Knight at the Crossroads',
    artist: 'Viktor Vasnetsov',
    year: '1882',
    url: commons('Victor_Vasnetsov_-_Knight_at_the_Crossroads_-_Google_Art_Project.jpg'),
  },
  {
    id: 'horatii',
    title: 'The Oath of the Horatii',
    artist: 'Jacques-Louis David',
    year: '1784',
    url: commons('%22Oath_of_the_Horatii%22_by_Jacques-Louis_David.jpg'),
  },
  {
    id: 'napoleon',
    title: 'Napoleon Crossing the Alps',
    artist: 'Jacques-Louis David',
    year: '1801–1803',
    url: commons(
      'Napoleon_at_the_Great_St._Bernard_-_Jacques-Louis_David_-_Google_Cultural_Institute.jpg',
    ),
  },
  {
    id: 'moses',
    title: 'Moses with the Ten Commandments',
    artist: 'Rembrandt',
    year: '1659',
    url: commons('Rembrandt_-_Moses_with_the_Ten_Commandments_-_Google_Art_Project.jpg'),
  },
  {
    id: 'knight-death-devil',
    title: 'Knight, Death and the Devil',
    artist: 'Albrecht Dürer',
    year: '1513',
    url: commons('Albrecht_D%C3%BCrer,_Knight,_Death_and_Devil,_1513,_NGA_598.jpg'),
  },
  {
    id: 'wignacourt',
    title: 'Portrait of Alof de Wignacourt',
    artist: 'Caravaggio',
    year: 'c. 1608',
    url: commons('Portrait_of_Alof_de_Wignacourt_and_his_Page-Caravaggio_(1607-1608).jpg'),
  },
  {
    id: 'saint-george',
    title: 'Saint George and the Dragon',
    artist: 'Peter Paul Rubens',
    year: '1606–1608',
    url: commons('Rubens_-_San_Jorge_y_el_Drag%C3%B3n_(Museo_del_Prado,_1605).jpg'),
  },
  {
    id: 'hercules',
    title: 'Hercules and Cerberus',
    artist: 'Francisco de Zurbarán',
    year: '1634',
    url: commons('H%C3%A9rcules_y_el_Cancerbero,_por_Zurbar%C3%A1n.jpg'),
  },
  {
    id: 'charles-v',
    title: 'Charles V at Mühlberg',
    artist: 'Titian',
    year: '1548',
    url: commons('Carlos_V_en_M%C3%BChlberg,_by_Titian,_from_Prado_in_Google_Earth.jpg'),
  },
  {
    id: 'wanderer',
    title: 'Wanderer above the Sea of Fog',
    artist: 'Caspar David Friedrich',
    year: 'c. 1817',
    url: commons('Caspar_David_Friedrich_-_Wanderer_above_the_Sea_of_Fog.jpeg'),
  },
  {
    id: 'king-arthur',
    title: 'King Arthur',
    artist: 'Charles Ernest Butler',
    year: '1903',
    url: commons('Charles_Ernest_Butler_-_King_Arthur.jpg'),
  },
  {
    id: 'man-in-armour',
    title: 'A Man in Armour',
    artist: 'Rembrandt',
    year: '1655',
    url: commons('Rembrandt_Man_in_Armour.jpg'),
  },
];

/**
 * The way back to the feed, under the post, and the prompt it opens. It's the only thing to click
 * there, so its wording makes you think twice. The prompt then says something rather than asking,
 * following research on how such messages land (see the README's "Wording" research):
 *
 * - It speaks to you as "you", and to who you are rather than what you're doing.
 * - The guilt stays implicit. It never calls you lazy or weak: shame makes people defensive.
 * - It grants that the pull is human, and that rest is not weakness.
 * - It names something better to do, out in the real world.
 * - It ends by leaving the choice with you, so it doesn't read as an order.
 */
export const GIVE_IN: readonly GiveIn[] = [
  {
    label: 'Succumb to temptation',
    title: 'You are meant for more, not for this.',
    message:
      'The pull you feel is real, and everyone feels it. But indulging it never settles the craving; it only feeds the next one. The feed is built to never end, and your day is not. Spend the next hour on something you’ll be glad you did tonight. The choice is yours.',
  },
  {
    label: 'Abandon the vigil',
    title: 'You set this watch for a reason.',
    message:
      'On a clearer day, you decided this feed wasn’t worth your time. Nothing has changed since then but the craving, and cravings pass. Hold your post a little longer: stand up, take a breath, and turn to what’s in front of you. It’s your call.',
  },
  {
    label: 'Surrender to the feed',
    title: 'The feed has nothing you came here for.',
    message:
      'It was made by people paid to keep you scrolling, and it’s very good at its job. You can be better at yours. Close this tab and give your attention to something that gives something back. You’re free to choose.',
  },
  {
    label: 'Lay down your sword',
    title: 'Your strength is not for this.',
    message:
      'Discipline isn’t punishment. It’s choosing what you want most over what you want now, and what you want most isn’t in this feed. Pick up the thing you’ve been putting off and give it ten minutes. The choice is yours.',
  },
  {
    label: 'Fold your hands a little longer',
    title: 'Small surrenders add up.',
    message:
      'No one wastes a life in one sitting. It goes ten minutes at a time, exactly like this. You know what you’d rather do with these minutes. Go and do it, while the day is still yours. It’s your call.',
  },
  {
    label: 'Waste another hour',
    title: 'This hour will not come back.',
    message:
      'You can’t get back the hours already spent here, and that’s all right. You can still decide about this one. Spend it on something you’ll remember: a walk, a call, a page of real work. You decide.',
  },
  {
    label: 'Desert your post',
    title: 'Someone is counting on the best of you.',
    message:
      'Maybe it’s your family, your work, your health, or the person you’re trying to become. They won’t find you in this feed. Show up for them instead, even in a small way: one message, one page, one walk. The choice is yours.',
  },
  {
    label: 'Choose the easy road',
    title: 'The easy road leads nowhere you want to go.',
    message:
      'Needing rest isn’t weakness. But this isn’t rest: it leaves you more tired than it found you. If you need a break, take a real one, with water, fresh air, and a few slow breaths. It’s up to you.',
  },
  {
    label: 'Put it off again',
    title: 'Tomorrow is not promised.',
    message:
      'Putting things off feels harmless because the cost arrives later. It still arrives. Take the smallest piece of what you’re avoiding and give it five minutes. If you still want this afterwards, it will be here.',
  },
  {
    label: 'Kneel to the algorithm',
    title: 'You bow to no algorithm.',
    message:
      'Every scroll teaches it what will hold you a little longer. You decide what holds you. Choose one thing worth your attention today, and give it your best hour. You’re free to choose.',
  },
  {
    label: 'Let the day slip away',
    title: 'Your days are numbered. That is what makes them precious.',
    message:
      'Remembering that time runs out isn’t morbid. It’s how people find what matters to them, and this feed won’t be on that list. Picture today well spent, and take the first step toward it. The choice is yours.',
  },
  {
    label: 'Yield, just this once',
    title: 'It is never just once.',
    message:
      'Habits are built from choices that felt too small to matter. This one counts too. Turn back now, and the next time gets easier. Either way, the choice is yours.',
  },
];

/** How long each post stays up. */
export const POST_MINUTES = 10;
const POST_MS = POST_MINUTES * 60_000;

/** Which post is up: the number of turns since 1970, so every device shows the same one. */
export function postNumber(date: Date): number {
  return Math.floor(date.getTime() / POST_MS);
}

/** When the post up at `date` gives way to the next one, in milliseconds since 1970. */
export function nextPostAt(date: Date): number {
  return (postNumber(date) + 1) * POST_MS;
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));

/**
 * The post up at a given time. The quotes and the paintings each go round in order, so a new post
 * never keeps the last one's quote or painting, and every quote shows before any comes back. Each
 * time the two lists line up again, the paintings skip one, so over time every quote meets every
 * painting, whatever the two list lengths are.
 */
export function postFor(date: Date): Post {
  const turn = postNumber(date);
  const lineUp = (QUOTES.length * PAINTINGS.length) / gcd(QUOTES.length, PAINTINGS.length);
  return {
    quote: QUOTES[turn % QUOTES.length]!,
    painting: PAINTINGS[(turn + Math.floor(turn / lineUp)) % PAINTINGS.length]!,
    giveIn: GIVE_IN[turn % GIVE_IN.length]!,
  };
}
