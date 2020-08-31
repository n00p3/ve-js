/**
 * This project is a translation of https://github.com/Kimtaro/ve
 */

const Parse = require('./parse')
const kuromojin = require('kuromojin');
const path = require('path');


(async () => {
    const tokens = await kuromojin.tokenize(
      '答えてくれるはず',
      {
        dicPath: path.join(__dirname, 'lib')
      });
    const p = new Parse(tokens);
    const ws = await p.words();
    ws.forEach(w => console.log(w.tokens.map(i => i.surface_form)))
  }
)()
