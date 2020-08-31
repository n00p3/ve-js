const Ve = require('./ve-js');

(async () => {
    const ve = new Ve();
    const words = await ve.words('答えてくれるはず');
    console.log(words);
  }
)()
