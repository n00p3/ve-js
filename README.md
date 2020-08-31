# ve-js
>A linguistic framework for anyone. No degree required.

Port of [ve](https://github.com/Kimtaro/ve) to JavaScript.

It uses kuromoji as it's backend. All required dictionaries are included in ./lib directory.

# How to use
``` js
const Ve = require('./ve-js');

// As a first argument you can pass a path to directory with dictionaries.
const ve = new Ve();
const words = await ve.words('答えてくれるはず');

/*
[
  Word {
    tokens: [ [Object], [Object], [Object] ],
    reading: 'コタエテクレル',
    transcription: 'コタエテクレル',
    grammar: 'Unassigned',
    lemma: '答える',
    partOfSpeech: 'Verb',
    word: '答えてくれる'
  },
  Word {
    tokens: [ [Object] ],
    reading: 'ハズ',
    transcription: 'ハズ',
    grammar: 'Unassigned',
    lemma: 'はず',
    partOfSpeech: 'Noun',
    word: 'はず'
  }
]
*/
```