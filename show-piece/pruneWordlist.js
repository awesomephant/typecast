const fs = require('fs')
const colors = require('colors')
const wordList = require('./wordlist-gutenberg.json')
var prunedWordList = []

let prunedCount = 0;
let instanceCount = 0;

for (let i = 0; i < wordList.length; i++) {
    let w = wordList[i];
    let _w = {
        text: w.text,
        instances: []
    };

    for (let j = 0; j < w.instances.length; j++) {
        let path = `./word-images/edit/${w.text}-${j}.png`
        if (fs.existsSync(path)) {
            console.log(`${path} found`.green)
            _w.instances.push(`${w.text}-${j}.png`);
            instanceCount++;
        } else {
            console.log(`${path} not found`.yellow)
            prunedCount++;
        }
    }
    if (_w.instances.length > 0) {
        prunedWordList.push(_w)
    }
}

fs.writeFileSync('wordlist-gutenberg-pruned.json', JSON.stringify(prunedWordList))

console.log(`\n Deleted ${prunedCount} entries, kept ${prunedWordList.length}. ${instanceCount} instances.`)