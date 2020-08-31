/**
 * This project is a translation of https://github.com/Kimtaro/ve
 */

const Grammar = require('./grammar')
const Pos = require('./pos');
const Word = require('./Word');
const path = require('path');
const kuromojin = require('kuromojin');

module.exports = class Ve {
  tokenArray = [];

  static get NO_DATA() {
    return '*';
  };

  // POS1
  static get MEISHI() {
    return '名詞';
  };

  static get KOYUUMEISHI() {
    return '固有名詞';
  };

  static get DAIMEISHI() {
    return '代名詞';
  };

  static get JODOUSHI() {
    return '助動詞';
  };

  static get KAZU() {
    return '数';
  };

  static get JOSHI() {
    return '助詞';
  };

  static get SETTOUSHI() {
    return '接頭詞';
  };

  static get DOUSHI() {
    return '動詞';
  };

  static get KIGOU() {
    return '記号';
  };

  static get FIRAA() {
    return 'フィラー';
  };

  static get SONOTA() {
    return 'その他';
  };

  static get KANDOUSHI() {
    return '感動詞';
  };

  static get RENTAISHI() {
    return '連体詞';
  };

  static get SETSUZOKUSHI() {
    return '接続詞';
  };

  static get FUKUSHI() {
    return '副詞';
  };

  static get SETSUZOKUJOSHI() {
    return '接続助詞';
  };

  static get KEIYOUSHI() {
    return '形容詞';
  };

  static get MICHIGO() {
    return '未知語';
  };

  // POS2_BLACKLIST and inflection types
  static get HIJIRITSU() {
    return '非自立';
  };

  static get FUKUSHIKANOU() {
    return '副詞可能';
  };

  static get SAHENSETSUZOKU() {
    return 'サ変接続';
  };

  static get KEIYOUDOUSHIGOKAN() {
    return '形容動詞語幹';
  };

  static get NAIKEIYOUSHIGOKAN() {
    return 'ナイ形容詞語幹';
  };

  static get JODOUSHIGOKAN() {
    return '助動詞語幹';
  };

  static get FUKUSHIKA() {
    return '副詞化';
  };

  static get TAIGENSETSUZOKU() {
    return '体言接続';
  };

  static get RENTAIKA() {
    return '連体化';
  };

  static get TOKUSHU() {
    return '特殊';
  };

  static get SETSUBI() {
    return '接尾';
  };

  static get SETSUZOKUSHITEKI() {
    return '接続詞的';
  };

  static get DOUSHIHIJIRITSUTEKI() {
    return '動詞非自立的';
  };

  static get SAHEN_SURU() {
    return 'サ変・スル';
  };

  static get TOKUSHU_TA() {
    return '特殊・タ';
  };

  static get TOKUSHU_NAI() {
    return '特殊・ナイ';
  };

  static get TOKUSHU_TAI() {
    return '特殊・タイ';
  };

  static get TOKUSHU_DESU() {
    return '特殊・デス';
  };

  static get TOKUSHU_DA() {
    return '特殊・ダ';
  };

  static get TOKUSHU_MASU() {
    return '特殊・マス';
  };

  static get TOKUSHU_NU() {
    return '特殊・ヌ';
  };

  static get FUHENKAGATA() {
    return '不変化型';
  };

  static get JINMEI() {
    return '人名';
  };

  static get MEIREI_I() {
    return '命令ｉ';
  };

  static get KAKARIJOSHI() {
    return '係助詞';
  };

  static get KAKUJOSHI() {
    return '格助詞';
  };

  // etc
  static get NA() {
    return 'な';
  };

  static get NI() {
    return 'に';
  };

  static get TE() {
    return 'て';
  };

  static get DE() {
    return 'で';
  };

  static get BA() {
    return 'ば';
  };

  static get NN() {
    return 'ん';
  };

  static get SA() {
    return 'さ';
  };

  // constructor(sentence, dicPath = (path.join(__dirname, 'lib'))) {
  //   return (async () => {
  //     const tokenArray = await kuromojin.tokenize(sentence,      { dicPath });
  //     if (tokenArray.length === 0)
  //       throw new Error('Cannot parse an empty array of tokens.');
  //
  //     this.tokenArray = tokenArray;
  //
  //     return this;
  //   })();
  // }

  constructor(dicPath = (path.join(__dirname, 'lib'))) {
    this.dicPath = dicPath;
  }

  /**
   * @return List of all words in the instance's tokenArray, or an empty list if tokenArray was empty.
   *         Ve returns an asterisk if no word was recognised.
   */
  async words(sentence) {
    this.tokenArray = await kuromojin.tokenize(
        sentence,
        {
          dicPath: this.dicPath,
        });
    if (this.tokenArray.length === 0)
      throw new Error('Cannot parse an empty array of tokens.');

    /**
     * @type {Word[]}
     */
    const wordList = [];
    let current = null;
    let previous = null;
    let following = null;

    for (let i = 0; i < this.tokenArray.length; i++) {
      const finalSlot = wordList.length - 1;
      current = this.tokenArray[i];
      let pos = null;
      let grammar = Grammar.Unassigned;

      let eatNext = false;
      let eatLemma = false;
      let attachToPrevious = false;
      let alsoAttachToLemma = false;
      let updatePos = false;

      let currentPOSArray = current; // await kuromojin.tokenize(current);

      if (Object.keys(currentPOSArray).length === 0 || currentPOSArray.pos === Ve.NO_DATA)
        throw new Error('No Pos data found for token.');

      switch (currentPOSArray.pos) {
        case Ve.MEISHI:
          pos = Pos.Noun;
          if (currentPOSArray.pos_detail_1 === Ve.NO_DATA)
            break;
          switch (currentPOSArray.pos_detail_1) {
            case Ve.KOYUUMEISHI:
              pos = Pos.ProperNoun;
              break;
            case Ve.DAIMEISHI:
              pos = Pos.Pronoun;
              break;
            case Ve.FUKUSHI:
            case Ve.SAHENSETSUZOKU:
            case Ve.KEIYOUDOUSHIGOKAN:
            case Ve.NAIKEIYOUSHIGOKAN:
              if (currentPOSArray.pos_detail_2 === Ve.NO_DATA)
                break;
              if (i === this.tokenArray.length - 1)
                break;

              following = this.tokenArray[i + 1];
              switch (following.conjugated_type) {
                case Ve.SAHEN_SURU:
                  pos = Pos.Verb;
                  eatNext = true;
                  break;
                case Ve.TOKUSHU_DA:
                  pos = Pos.Adjective;
                  if (following.pos_detail_1 === Ve.TAIGENSETSUZOKU) {
                    eatNext = true;
                    eatLemma = false;
                  }
                  break;
                case Ve.TOKUSHU_NAI:
                  pos = Pos.Adjective;
                  eatNext = true;
                  break;
                default:
                  if (following.pos === Ve.JOSHI && following.surface_form === Ve.NI)
                    pos = Pos.Adverb;
                  break;
              }
              break;
            case Ve.HIJIRITSU:
            case Ve.TOKUSHU:
              if (currentPOSArray.pos_detail_2 === Ve.NO_DATA)
                break;
              if (i === this.tokenArray.length - 1)
                break;
              following = this.tokenArray[i + 1];

              switch (currentPOSArray.pos_detail_2){
                case Ve.FUKUSHIKANOU:
                  if (following.pos === Ve.JOSHI && following.surface_form === Ve.NI) {
                    pos = Pos.Adverb;
                    eatNext = false;
                  }
                  break;
                case Ve.JODOUSHIGOKAN:
                  if (following.conjugated_type === Ve.TOKUSHU_DA) {
                    pos = Pos.Verb;
                    grammar = Grammar.Auxiliary;
                    if (following.conjugated_form === Ve.TAIGENSETSUZOKU)
                      eatNext = true;
                  } else if (following.pos === Ve.JOSHI && following.pos_detail_2 === Ve.FUKUSHIKA) {
                    pos = Pos.Adverb;
                    eatNext = true;
                  }
                  break;
                case Ve.KEIYOUDOUSHIGOKAN:
                  pos = Pos.Adjective;
                  if (
                    following.conjugated_type === Ve.TOKUSHU_DA &&
                    following.conjugated_type === Ve.TAIGENSETSUZOKU ||
                    following.pos_detail_1 === Ve.RENTAIKA
                  )
                    eatNext = true;
                  break;
                default:
                  break;
              }
              break;
            case Ve.KAZU:
              pos = Pos.Number;
              if (wordList.length > 0 && wordList[finalSlot].pos === Ve.KAZU) {
                attachToPrevious = true;
                alsoAttachToLemma = true;
              }
              break;
            case Ve.SETSUBI:
              if (currentPOSArray.pos_detail_2 === Ve.JINMEI)
                pos = Pos.Suffix;
              else {
                if (currentPOSArray.pos_detail_2 === Ve.TOKUSHU && currentPOSArray.basic_form === Ve.SA) {
                  updatePos = true;
                  pos = Pos.Noun;
                } else
                  alsoAttachToLemma = true;
                attachToPrevious = true;
              }
              break;
            case Ve.SETSUZOKUSHITEKI:
              pos = Pos.Conjunction;
              break;
            case Ve.DOUSHIHIJIRITSUTEKI:
              pos = Pos.Verb;
              grammar = Grammar.Nominal;
              break;
            default:
              break;
          }
          break;
        case Ve.SETTOUSHI:
          pos = Pos.Prefix;
          break;
        case Ve.JODOUSHI:
          pos = Pos.Postposition;
          const qualifyingList1 = [
            Ve.TOKUSHU_TA,
            Ve.TOKUSHU_NAI,
            Ve.TOKUSHU_TAI,
            Ve.TOKUSHU_MASU,
            Ve.TOKUSHU_NU
          ];
          if (
            previous === null ||
            previous.pos_detail_1 !== Ve.KAKARIJOSHI &&
            qualifyingList1.includes(current.conjugated_type)
          )
            attachToPrevious = true;
          else if (current.conjugated_type === Ve.FUHENKAGATA && current.basic_form === Ve.NN)
            attachToPrevious = true;
          else if (
            current.conjugated_type === Ve.TOKUSHU_DA ||
            current.basic_form === Ve.TOKUSHU_DESU &&
            current.surface_form !== Ve.NA
          )
            pos = Pos.Verb;
          break;
        case Ve.DOUSHI:
          pos = Pos.Verb;
          switch (currentPOSArray.pos_detail_1) {
            case Ve.SETSUBI:
              attachToPrevious = true;
              break;
            case Ve.HIJIRITSU:
              if (current.conjugated_form !== Ve.MEIREI_I)
                attachToPrevious = true;
            default:
              break;
          }
          break;
        case Ve.KEIYOUSHI:
          pos = Pos.Adjective;
          break;
        case Ve.JOSHI:
          pos = Pos.Postposition;
          const qualifyingList2 = [Ve.TE, Ve.DE, Ve.BA];
          if (
            currentPOSArray.pos_detail_1 === Ve.SETSUZOKUJOSHI &&
            qualifyingList2.includes(currentPOSArray.surface_form) ||
            current.surface_form === Ve.NI
          )
            attachToPrevious = true;
          break;
        case Ve.RENTAISHI:
          pos = Pos.Determiner;
          break;
        case Ve.SETSUZOKUJOSHI:
          pos = Pos.Conjunction;
          break;
        case Ve.FUKUSHI:
          pos = Pos.Adverb;
          break;
        case Ve.KIGOU:
          pos = Pos.Symbol;
          break;
        case Ve.FIRAA:
        case Ve.KANDOUSHI:
          pos = Pos.Interjection;
          break;
        case Ve.SONOTA:
          pos = Pos.Other;
          break;
        default:
          pos = Pos.TBD;
      }

      if (attachToPrevious && wordList.length > 0) {
        wordList[finalSlot].tokens.push(current);
        wordList[finalSlot].appendToWord(current.surface_form);
        wordList[finalSlot].appendToReading(this.getFeatureSafely(current, 'reading'));
        wordList[finalSlot].appendToTranscription(this.getFeatureSafely(current, 'pronunciation'));
        if (alsoAttachToLemma)
          wordList[finalSlot].appendToLemma(current.basic_form);
        if (updatePos)
          wordList[finalSlot].partOfSpeech = pos;
      } else {
        let word = new Word(
          current.reading,
          this.getFeatureSafely(current, 'pronunciation'),
          grammar,
          current.basic_form,
          pos,
          current.surface_form,
          current,
        );
        if (eatNext) {
          if (i === this.tokenArray.length - 1)
            throw new Error("There's a path that allows array overshooting.");
          following = this.tokenArray[i+1];
          word.tokens.push(following);
          word.appendToWord(following.surface_form);
          word.appendToReading(following.reading);
          word.appendToTranscription(this.getFeatureSafely(following, 'pronunciation'));
          if (eatLemma)
            word.appendToLemma(following.basic_form);
        }
        wordList.push(word);
      }
      previous = current;
    }
    return wordList;
  }

  /**
   * Return an asterisk if pronunciation field isn't in array (READING and PRONUNCIATION fields are left undefined,
   * rather than as "*" by MeCab). Other feature fields are guaranteed to be safe, however.
   */
  getFeatureSafely(token, feature) {
    return token[feature] ? token[feature] : '*';
  }
}


