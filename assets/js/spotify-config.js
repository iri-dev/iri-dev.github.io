/* Iri's Spotify links, shared by the music corner (music.html) and My World (world.html#music).
   Everything here is typed in by hand from public Spotify pages. The site never reads live listening activity,
   and nothing contacts Spotify until a visitor presses play. */
window.SPOTIFY = {
  profileUrl: 'https://open.spotify.com/user/31u5fupicagi457xulprhu3s7674',

  /* FEATURED PLAYLIST on My World: the id of one playlist from the list below. Full Force is the one I keep pinned. */
  featured: { id: '6jKaUCC8JqKC2pecF1q1m1' },

  /* Current favorites, ranked by hand. */
  onRepeat: [
    { title: 'Haunt Me', artist: 'Blindlove' },
    { title: 'Mamacita', artist: 'VOILÀ' },
    { title: 'Deathwish', artist: 'Three Days Grace' },
    { title: 'Bad for Me', artist: 'VOILÀ', honorable: true }
  ],

  /* A few songs copied from the public Iri Approved playlist (24 October 2026). Swap them for real favourites any time. */
  picks: {
    from: 'Iri Approved',
    songs: [
      ['The Search', 'NF'],
      ['Legendary', 'Skillet'],
      ['DArkSide', 'Bring Me The Horizon'],
      ['INFECTED', 'STARSET'],
      ['Broken Halo', 'Smash Into Pieces'],
      ['Make Believe', 'Memphis May Fire']
    ]
  },

  /* Names that turn up again and again across the playlists below. My World shows the first six. */
  artists: ['Skillet', 'Bring Me The Horizon', 'Smash Into Pieces', 'Three Days Grace', 'STARSET', 'BABYMETAL', 'Thousand Foot Krutch',
    'Memphis May Fire', 'NF', 'Rustage', 'NEFFEX', 'Blacklite District', 'Sabrina Carpenter', 'Destiny Rogers', 'Ed Sheeran', 'Joji',
    'Cigarettes After Sex', 'Mr.Kitty', 'Warriyo'],

  /* The tape rack. id is the part after /playlist/ in a share link. Labels and artist picks are kept here by hand. */
  playlists: [
    { id: '4LGq9sJ4BndIwcdN3jQb9o', name: 'Iri Approved', tag: 'rock · rap · everything', shell: '#c58be6',
      desc: 'The best of everything in one place. If a song lives here, it passed the vibe check.',
      artists: ['Smash Into Pieces', 'Skillet', 'NEFFEX', 'Rustage', 'Blacklite District'] },
    { id: '6jKaUCC8JqKC2pecF1q1m1', name: 'Full Force', tag: 'rock & metal', shell: '#6b3f8e',
      desc: 'Rock and metal at full volume. The big one, and the playlist I keep pinned.',
      artists: ['Skillet', 'Bring Me The Horizon', 'Three Days Grace', 'STARSET', 'BABYMETAL'] },
    { id: '3D3jukcOoLq3kLIiep3Lb8', name: 'Talk My Shit (Rap)', tag: 'rap', shell: '#d13a87',
      desc: 'Main-character energy, for when I need to feel completely unstoppable.',
      artists: ['NF', 'Rustage', 'NEFFEX', 'JT Music'] },
    { id: '4RA3ENrJ5EBJAmKAMdzZqS', name: 'Overclocked', tag: 'electronic', shell: '#7f8fe6',
      desc: 'Fast electronic energy for when my brain is running at full speed.',
      artists: ['Warriyo', 'Laura Brehm', 'Lost Sky', 'Tyson Yen'] },
    { id: '6oZDFeqpt55LHGt30xmWv1', name: 'Highly Caffeinated', tag: 'hyperpop', shell: '#f6b84a',
      desc: 'Pure energy. About as caffeinated as I usually am.',
      artists: ['Charli xcx', 'SVEA'] },
    { id: '2SjfRlUUrF2RPARgwSkfx6', name: 'Dopamine (Pop)', tag: 'pop', shell: '#f29bc8',
      desc: 'An instant mood boost, no matter what kind of day it is.',
      artists: ['Destiny Rogers', 'Ed Sheeran', 'AViVA'] },
    { id: '4QpxNbOSpBedM94Zwqsozf', name: 'A Little Too Pretty', tag: 'pop', shell: '#f7b6d5',
      desc: 'Songs that feel like a really good outfit.',
      artists: ['Sabrina Carpenter', 'salem ilese', 'Storm Henshaw'] },
    { id: '2g70PF9dsQlu693Ibl1mbP', name: 'All My Heart', tag: 'love songs', shell: '#e889b5',
      desc: 'The soft ones. All the feelings, none of the shame.',
      artists: ['Stephen Sanchez', 'Ed Sheeran'] },
    { id: '2wEJs4uLnVSYCGWDSW0pzb', name: 'Off the Clock (Chill)', tag: 'chill', shell: '#8fd0ae',
      desc: 'Switch-off music for the end of the day, slowed and reverbed.',
      artists: ['Cigarettes After Sex', 'NBSPLV'] },
    { id: '1iZrc759h1LHCMYERVZHSX', name: 'Staying Up Too Late... Again', tag: 'late night', shell: '#4a3570',
      desc: 'The night owl soundtrack. You know exactly what time it is when this comes on.',
      artists: ['Mr.Kitty', 'NBSPLV'] },
    { id: '1Qa1dRcjdGSylkJ4ZP4hVb', name: 'The Things I Dont Say', tag: 'feelings', shell: '#9d86c4',
      desc: 'The quieter, heavier-hearted ones.',
      artists: ['Joji', 'Blacklite District', 'NEFFEX'] },
    { id: '7btCxap4zqo6pzXo5fv56c', name: 'Other Worlds', tag: 'game music', shell: '#9fc8ff',
      desc: 'Music from the worlds I get lost in, like Wuthering Waves.',
      artists: ['Wuthering Waves', 'TheFatRat'] }
  ]
};
