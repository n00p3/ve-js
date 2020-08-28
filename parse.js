const kuromoji = require('kuromoji');
const Grammar = require('./grammar')
const Pos = require('./pos');

module.exports = class Parse {
  tokenArray = [];
  static get NO_DATA() { return '*' };
  static get POS1() { return 0 };
  static get POS2() { return 1 };
  static get POS3() { return 2 };
  static get POS4() { return 3 };
  static get CTYPE() { return 4 };
  static get CFORM() { return 5 };
  static get BASIC() { return 6 };
  static get READING() { return 7 };
  static get PRONUNCIATION() { return 8 };

  // POS1
  static get MEISHI() { return '名詞' };
  static get KOYUUMEISHI() { return '固有名詞' };
  static get DAIMEISHI() { return '代名詞' };
  static get JODOUSHI() { return '助動詞' };
  static get KAZU() { return '数' };
  static get JOSHI() { return '助詞' };
  static get SETTOUSHI() { return '接頭詞' };
  static get DOUSHI() { return '動詞' };
  static get KIGOU() { return '記号' };
  static get FIRAA() { return 'フィラー' };
  static get SONOTA() { return 'その他' };
  static get KANDOUSHI() { return '感動詞' };
  static get RENTAISHI() { return '連体詞' };
  static get SETSUZOKUSHI() { return '接続詞' };
  static get FUKUSHI() { return '副詞' };
  static get SETSUZOKUJOSHI() { return '接続助詞' };
  static get KEIYOUSHI() { return '形容詞' };
  static get MICHIGO() { return '未知語' };

  // POS2_BLACKLIST and inflection types
  static get HIJIRITSU() { return '非自立' };
  static get FUKUSHIKANOU() { return '副詞可能' };
  static get SAHENSETSUZOKU() { return 'サ変接続' };
  static get KEIYOUDOUSHIGOKAN() { return '形容動詞語幹' };
  static get NAIKEIYOUSHIGOKAN() { return 'ナイ形容詞語幹' };
  static get JODOUSHIGOKAN() { return '助動詞語幹' };
  static get FUKUSHIKA() { return '副詞化' };
  static get TAIGENSETSUZOKU() { return '体言接続' };
  static get RENTAIKA() { return '連体化' };
  static get TOKUSHU() { return '特殊' };
  static get SETSUBI() { return '接尾' };
  static get SETSUZOKUSHITEKI() { return '接続詞的' };
  static get DOUSHIHIJIRITSUTEKI() { return '動詞非自立的' };
  static get SAHEN_SURU() { return 'サ変・スル' };
  static get TOKUSHU_TA() { return '特殊・タ' };
  static get TOKUSHU_NAI() { return '特殊・ナイ' };
  static get TOKUSHU_TAI() { return '特殊・タイ' };
  static get TOKUSHU_DESU() { return '特殊・デス' };
  static get TOKUSHU_DA() { return '特殊・ダ' };
  static get TOKUSHU_MASU() { return '特殊・マス' };
  static get TOKUSHU_NU() { return '特殊・ヌ' };
  static get FUHENKAGATA() { return '不変化型' };
  static get JINMEI() { return '人名' };
  static get MEIREI_I() { return '命令ｉ' };
  static get KAKARIJOSHI() { return '係助詞' };
  static get KAKUJOSHI() { return '格助詞' };

  // etc
  static get NA() { return 'な' };
  static get NI() { return 'に' };
  static get TE() { return 'て' };
  static get DE() { return 'で' };
  static get BA() { return 'ば' };
  static get NN() { return 'ん' };
  static get SA() { return 'さ' };

  constructor(tokenArray) {
    if (this.tokenArray.length === 0)
      throw new Error('Cannot parse an empty array of tokens.');

    this.tokenArray = tokenArray;
  }

  /**
   * @return List of all words in the instance's tokenArray, or an empty list if tokenArray was empty.
   *         Ve returns an asterisk if no word was recognised.
   */
  words() {
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

      let currentPOSArray = [] // TODO

      if (currentPOSArray.length === 0 || currentPOSArray[Parse.POS1] === Parse.NO_DATA)
        throw new Error('No Pos data found for token.');

      switch (currentPOSArray[Parse.POS1]) {
        case Parse.MEISHI:
          pos = Pos.Noun;
          if (currentPOSArray[Parse.POS2] === Parse.NO_DATA)
            break;
          switch(currentPOSArray[Parse.POS2]) {
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
              if (currentPOSArray[Parse.POS3] === Parse.NO_DATA)
                break;
              if (i === this.tokenArray.length - 1)
                break;

              following = this.tokenArray[i+1];
              switch (following[TODO]) { // TODO
                case Parse.SAHEN_SURU:
                  pos = Pos.Verb;
                  eatNext = true;
                  break;
                case Parse.TOKUSHU_DA:
                  pos = Pos.Adjective;
                  if (TODO) {// TODO
                    pos = Pos.Adjective;

                  }
              }
          }
      }

    }
  }
}


