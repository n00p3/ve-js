/**
 * This project is a translation of https://github.com/Kimtaro/ve
 */

const Parse = require('./parse')
const kuromoji = require('kuromoji');
const kuromojin = require('kuromojin');
const util = require('util');


(async () => {
    const tokens = await kuromojin.tokenize('答えてくれるはず');
    const p = new Parse(tokens);
    console.log(await p.words());
  }
)()
