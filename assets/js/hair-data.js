/* Hair references feature other models. Photo metadata and licenses stay with each source. */
(function () {
  var newPhotos = [
    { id: '2736553', title: 'violet hiding in the dark', by: 'Maria Geller', page: 'https://www.pexels.com/photo/women-s-black-top-and-purple-hair-2736553/', alt: 'A model with dark hair and deep violet sections through the lengths', caption: "This is the violet-in-the-shadows idea I keep coming back to. I'd ask for a subtle, near-black version.", groups: ['colour', 'dream'] },
    { id: '15873078', title: 'black-cherry depth', by: 'sebita gatica', page: 'https://www.pexels.com/photo/woman-posing-for-portrait-15873078/', alt: 'A model outdoors with long, deep cherry-red hair and dark roots', caption: "That dark cherry depth is making a very persuasive argument. I'm listening.", groups: ['colour', 'dream'] },
    { id: '8233662', title: 'wine-red curls', by: 'Simay Akça', page: 'https://www.pexels.com/photo/a-woman-with-curly-hair-and-tattooed-body-8233662/', alt: 'A model with rich burgundy curls and dark roots', caption: "Wine-red curls and a little drama. I'd keep the richness and the shine.", groups: ['colour', 'curls', 'dream'] },
    { id: '13722646', title: 'inky blue', by: 'Connor Scott McManus', page: 'https://www.pexels.com/photo/portrait-of-a-woman-with-blue-hair-13722646/', alt: 'A model with deep blue hair and bangs in soft indoor light', caption: "I'm saving the inky blue depth, rather than the bangs. I'd ask for a blacker base and a quieter blue reflection.", groups: ['colour', 'dream'] },
    { id: 'lavender', title: 'silver-lavender daydream', by: 'Kareya Saleh', page: 'https://unsplash.com/photos/purple-haired-woman-in-black-top-leaning-on-wall-tLKOj6cNwe0', source: 'Unsplash', alt: 'A model with long, softly waved silver-lavender hair and darker roots', caption: "Silver-lavender waves. Completely gorgeous, completely a fantasy for now.", groups: ['colour', 'curls', 'dream'] },
    { id: '13865070', title: 'the claw-clip situation', by: 'İlknur Çelik', page: 'https://www.pexels.com/photo/woman-in-striped-long-sleeve-shirt-near-the-sideboard-13865070/', alt: 'A model seen from the side and back with dark hair twisted up in a claw clip', caption: "A claw clip, a few loose pieces, and my hair out of the way. I respect a practical little solution.", groups: ['styling'] },
    { id: '19829520', title: 'up and out of my way', by: 'Oz Art', page: 'https://www.pexels.com/photo/portrait-of-brunette-woman-in-shadow-19829520/', alt: 'A model holding a high dark brunette ponytail in a shadowy studio', caption: "A high ponytail with attitude. I'd like this energy for a busy day.", groups: ['styling', 'brunette'] }
  ];
  newPhotos.forEach(function (p) {
    p.tab = 'hair'; p.group = p.groups[0];
    p.src = 'assets/img/hair/' + p.id + '.webp';
    p.thumb = 'assets/img/hair/' + p.id + '-sm.webp';
  });
  var captions = {
    '4584409': ["I love the movement in these long waves. I'd borrow the softness for my own shorter layers.", ['brunette', 'curls']],
    '18968720': ["Glossy dark waves, face-framing pieces, and a very good reason to wear silver jewelry.", ['brunette', 'curls', 'layers', 'dream']],
    '38651013': ["The shine. The movement. This is the back-view reference I'd take to a salon, with the length adapted for me.", ['brunette', 'curls', 'dream']],
    '1850585': ["Soft waves catching the sunlight. My idea of a pretty, low-key finish.", ['brunette', 'curls']],
    '6100178': ["Big curls and absolutely no apology for the volume. I'd happily take up a little extra space.", ['brunette', 'curls', 'dream']],
    '19963062': ["A cloud of beautiful natural curls. I'm saving the volume and texture, not pretending mine behaves exactly like this.", ['curls']],
    '17163786': ["I love this smooth, nearly straight finish and the soft bend at the ends. Every strand has a plan.", ['brunette', 'layers']],
    '17164030': ["This bouncy brunette blowout is the assignment. I'd ask my stylist to adapt the layers to my current length.", ['brunette', 'layers', 'dream']],
    '5157580': ["A loose braid that still looks lovely from the back. I'm saving this for an unhurried morning.", ['styling']],
    '8467968': ["A little black ribbon makes a simple braid feel dressed up. I love that.", ['styling']],
    '3065208': ["Pinned-back waves and curls: pretty, romantic, and out of my face. I'd borrow the styling, not the lighter color.", ['styling', 'curls']],
    '15212472': ["Purple AND blue. My sensible brunette plans are suddenly very quiet.", ['colour', 'dream']],
    '30313423': ["A bright orange-red bob with bangs. I admire the commitment; I'd need a long conversation before trying this.", ['colour', 'layers', 'dream']]
  };
  if (window.BEAUTY) {
    window.BEAUTY.groups.hair = [['brunette','Brunette'], ['curls','Waves & curls'], ['layers','Haircuts & layers'], ['styling','Updos & braids'], ['colour','Color experiments'], ['dream','Dream looks']];
    window.BEAUTY.photos.forEach(function (p) { if (p.tab === 'hair' && captions[p.id]) { p.caption = captions[p.id][0]; p.groups = captions[p.id][1]; } });
    window.BEAUTY.photos = window.BEAUTY.photos.concat(newPhotos);
  }
  window.HAIR_DIARY = {
    looks: [
      {photo:'18968720',name:'face-framing layers',note:"I'd borrow these soft pieces around the face."},
      {photo:'17164030',name:'a glossy blowout',note:'I want this bounce. All of it.'},
      {photo:'6100178',name:'big romantic curls',note:'My feelings about volume are very serious.'},
      {photo:'1850585',name:'soft, easy waves',note:'Good hair day energy.'}
    ],
    colors: [
      {photo:'2736553',name:'Midnight purple',shade:'#42244f',note:"Dark until the light catches it. I'm in danger.",reference:"I'd ask for a subtler, near-black version of these violet sections."},
      {photo:'15873078',name:'Black cherry',shade:'#6b243d',note:'Basically the hair version of my black-cherry nails. Yes, please.'},
      {photo:'13722646',name:'Blue-black',shade:'#1c304d',note:'With silver jewelry? I love the idea.',reference:"This photo is bluer than my goal. I'd want a black base with a quiet blue sheen."},
      {photo:'8233662',name:'Burgundy wine',shade:'#75324e',note:"A little dramatic. I'd be unbearable about the shine."}
    ],
    thoughts: ['Purple will always tempt me.','I love bangs in theory.','Volume is basically mandatory.','I want it soft enough to run my fingers through.','Some days, the claw clip wins.']
  };
})();
