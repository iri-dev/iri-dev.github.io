# Browser guitar recordings

These recordings are guitar instrument samples, not recordings of Iris playing.
Both collections are dedicated to the public domain under CC0 1.0.

- Acoustic: **Meta Steel Guitar**, Meta Creative Audio, from [Meta Open Sound](https://github.com/facebookincubator/Meta-open-sound/tree/main/systems/instruments/meta-steel-guitar). Eighteen medium-velocity samples: open, fifth, and twelfth frets on each of six strings. Original sample names and mappings are in the upstream manifest. License: `CC0-1.0.txt`.
- Electric: **Electric Guitar FSBS (clean) #1**, FreePats, version 2026-08-07, bridge pickup, small SFZ+FLAC collection. [Source and downloads](https://freepats.zenvoid.org/ElectricGuitar/clean-electric-guitar.html). Ten sampled notes from F2 through D5, following the SFZ root-note mapping. License: `FreePats-CC0.txt`.

Preparation: mono mix, leading-silence trim, peak normalization, maximum five-second duration with a gentle tail fade, and Ogg Vorbis encoding. Playback transposes the nearest recorded note. Acoustic samples retain their string zones. Each new note damps the previous voice on that string.

The two JavaScript packs contain base64 Ogg data so the site works over `file://` as well as HTTP. Only the instrument first played is loaded. No samples or visitor interactions are sent to outside services.
