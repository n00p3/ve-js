class Word {

  tokens = [];

  constructor(
    read,
    pronunciation,
    grammar,
    basic,
    partOfSpeech,
    nodeStr,
    token
  ) {
    this.reading = read;
    this.transcription = pronunciation;
    this.grammar = grammar;
    this.lemma = basic;
    this.partOfSpeech = partOfSpeech;
    this.word = nodeStr;

    this.tokens.push(token);
  }

  appendToWord(suffix) {
    if (this.word === null)
      this.word = '_'.concat(suffix);
    else
      this.word = this.word.concat(suffix);
  }

  appendToReading(suffix) {
    if (this.reading === null)
      this.reading = '_'.concat(suffix);
    else
      this.reading = this.word.concat(suffix);
  }

  appendToTranscription(suffix) {
    if (this.transcription === null)
      this.transcription = '_'.concat(suffix);
    else
      this.transcription = this.transcription.concat(suffix);
  }

  appendToLemma(suffix) {
    if (this.lemma === null)
      this.lemma = '_'.concat(suffix);
    else
      this.lemma = this.lemma.concat(suffix);
  }
}

module.exports = Word;