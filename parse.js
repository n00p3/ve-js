const kuromojin = require('kuromojin');
const Grammar = require('./grammar')
const Pos = require('./pos');

module.exports = class Parse {
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

  constructor(tokenArray) {
    if (this.tokenArray.length === 0)
      throw new Error('Cannot parse an empty array of tokens.');

    this.tokenArray = tokenArray;
  }

  /**
   * @return List of all words in the instance's tokenArray, or an empty list if tokenArray was empty.
   *         Ve returns an asterisk if no word was recognised.
   */
  async words() {
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

      let currentPOSArray = await kuromojin.tokenize(current);

      if (Object.keys(currentPOSArray).length === 0 || currentPOSArray.pos === Parse.NO_DATA)
        throw new Error('No Pos data found for token.');

      switch (currentPOSArray.pos) {
        case Parse.MEISHI:
          pos = Pos.Noun;
          if (currentPOSArray.pos_detail_1 === Parse.NO_DATA)
            break;
          switch (currentPOSArray.pos_detail_1) {
            case Parse.KOYUUMEISHI:
              pos = Pos.ProperNoun;
              break;
            case Parse.DAIMEISHI:
              pos = Pos.Pronoun;
              break;
            case Parse.FUKUSHI:
            case Parse.SAHENSETSUZOKU:
            case Parse.KEIYOUDOUSHIGOKAN:
            case Parse.NAIKEIYOUSHIGOKAN:
              if (currentPOSArray.pos_detail_2 === Parse.NO_DATA)
                break;
              if (i === this.tokenArray.length - 1)
                break;

              following = this.tokenArray[i + 1];
              switch (following.conjugated_type) {
                case Parse.SAHEN_SURU:
                  pos = Pos.Verb;
                  eatNext = true;
                  break;
                case Parse.TOKUSHU_DA:
                  pos = Pos.Adjective;
                  if (following.pos_detail_1 === Parse.TAIGENSETSUZOKU) {
                    eatNext = true;
                    eatLemma = false;
                  }
                  break;
                case Parse.TOKUSHU_NAI:
                  pos = Pos.Adjective;
                  eatNext = true;
                  break;
                default:
                  if (following.pos === Parse.JOSHI && following.surface_form === Parse.NI)
                    pos = Pos.Adverb;
                  break;
              }
              break;
            case Parse.HIJIRITSU:
            case Parse.TOKUSHU:
              if (currentPOSArray.pos_detail_2 === Parse.NO_DATA)
                break;
              if (i === this.tokenArray.length - 1)
                break;
              following = this.tokenArray[i + 1];

              switch (currentPOSArray.pos_detail_2){
                case Parse.FUKUSHIKANOU:
                  if (following.pos === Parse.JOSHI && following.surface_form === Parse.NI) {
                    pos = Pos.Adverb;
                    eatNext = false;
                  }
                  break;
                case Parse.JODOUSHIGOKAN:
                  if (following.conjugated_type === Parse.TOKUSHU_DA) {
                    pos = Pos.Verb;
                    grammar = Grammar.Auxiliary;
                    if (following.conjugated_form === Parse.TAIGENSETSUZOKU)
                      eatNext = true;
                  } else if (following.pos === Parse.JOSHI && following.pos_detail_2 === Parse.FUKUSHIKA) {
                    pos = Pos.Adverb;
                    eatNext = true;
                  }
                  break;
                case Parse.KEIYOUDOUSHIGOKAN:
                  pos = Pos.Adjective;
                  if (
                    following.conjugated_type === Parse.TOKUSHU_DA &&
                    following.conjugated_type === Parse.TAIGENSETSUZOKU ||
                    following.pos_detail_1 === Parse.RENTAIKA
                  )
                    eatNext = true;
                  break;
                default:
                  break;
              }
            case Parse.KAZU:
              pos = Pos.Number;
              if (wordList.length > 0 && wordList[finalSlot].pos === Parse.KAZU) {
                attachToPrevious = true;
                alsoAttachToLemma = true;
              }
              break;
            case Parse.SETSUBI:
              if (currentPOSArray.pos_detail_2 === Parse.JINMEI)
                pos = Pos.Suffix;
              else {
                if (currentPOSArray.pos_detail_2 === Parse.TOKUSHU && currentPOSArray.basic_form === Parse.SA) {
                  updatePos = true;
                  pos = Pos.Noun;
                } else
                  alsoAttachToLemma = true;
                attachToPrevious = true;
              }
              break;
            case Parse.SETSUZOKUSHITEKI:
              pos = Pos.Conjunction;
              break;
            case Parse.DOUSHIHIJIRITSUTEKI:
              pos = Pos.Verb;
              grammar = Grammar.Nominal;
              break;
            default:
              break;
          }
          break;
        case Parse.SETTOUSHI:
          pos = Pos.Prefix;
          break;
        case Parse.JODOUSHI:
          pos = Pos.Postposition;
          const qualifyingList1 = [
            Parse.TOKUSHU_TA,
            Parse.TOKUSHU_NAI,
            Parse.TOKUSHU_TAI,
            Parse.TOKUSHU_MASU,
            Parse.TOKUSHU_NU
          ];
          if (
            previous === null ||
            !previous.pos_detail_1 === Parse.KAKARIJOSHI &&
            qualifyingList1.includes(current.conjugated_type)
          )
            attachToPrevious = true;
          else if (current.conjugated_type === Parse.FUHENKAGATA && current.basic_form === Parse.NN)
            attachToPrevious = true;
          else if (
            current.conjugated_type === Parse.TOKUSHU_DA ||
            current.basic_form === Parse.TOKUSHU_DESU &&
            !current.surface_form === Parse.NA
          )
            pos = Pos.Verb;
          break;
        case Parse.DOUSHI:
          pos = Pos.Verb;
          switch (currentPOSArray.pos_detail_1) {
            case Parse.SETSUBI:
              attachToPrevious = true;
              break;
            case Parse.HIJIRITSU:
              if (!current.conjugated_form === Parse.MEIREI_I)
                attachToPrevious = true;
            default:
              break;
          }
          break;
        case Parse.KEIYOUSHI:
          pos = Pos.Adjective;
          break;
        case Parse.JOSHI:
          pos = Pos.Postposition;
          const qualifyingList2 = [Parse.TE, Parse.DE, Parse.BA];
          if (
            currentPOSArray.pos_detail_1 === Parse.SETSUZOKUJOSHI &&
            qualifyingList2.includes(currentPOSArray.surface_form) ||
            current.surface_form === Parse.NI
          )
            attachToPrevious = true;
          break;
        case Parse.RENTAISHI:
          pos = Pos.Determiner;
          break;
        case Parse.SETSUZOKUJOSHI:
          pos = Pos.Conjunction;
          break;
        case Parse.FUKUSHI:
          pos = Pos.Adverb;
          break;
        case Parse.KIGOU:
          pos = Pos.Symbol;
          break;
        case Parse.FIRAA:
        case Parse.KANDOUSHI:
          pos = Pos.Interjection;
          break;
        case Parse.SONOTA:
          pos = Pos.Other;
          break;
        default:
          pos = Pos.TBD;
      }

      if (attachToPrevious && wordList.length > 0) {
        // wordList[finalSlot].
        // TODO
      } else {
        let word = undefined;
        // TODO
        if (eatNext) {
          if (i === this.tokenArray.length - 1)
            throw new Error("There's a path that allows array overshooting.");
          following = this.tokenArray[i+1];
          // TODO
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
  // getFeatureSafely(token, feature) {
  //   if (feature > Parse.PRONUNCIATION)
  //     throw new Error('Asked for a feature out of bounds.')
  //   return token.TODO.length >= feature + 1 ? token.TODO[feature] : '*';
  // }
}


