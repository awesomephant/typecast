const sharp = require("sharp");
const parse = require("csv-parse/lib/sync");
const fs = require("fs");


let input = fs.readFileSync('./result.tsv')

const words = parse(input, {
    columns: true,
    skip_empty_lines: true,
    delimiter: '\t',
    cast: true
})

console.log(words.length + '  words found.')
console.log("Extracting word images...")

let i = 0;
var wordList = []

const extractWordImage = function () {
    if (i < words.length) {
        let left = words[i].left;
        let top = words[i].top;
        let width = words[i].width;
        let height = words[i].height;
        sharp('test.png')
            .extract({ left: left, top: top, width: width, height: height })
            .toFile('./word-images/' + words[i].text + '.png', function (err) {
                // Extract a region of the input image, saving in the same format
                console.log(i + '/' + words.length + ': ' + words[i].text)
                wordList.push(words[i].text)
                i++
                extractWordImage();
            });
    } else {
        console.log('Done.')
        fs.writeFileSync('./wordlist.json', JSON.stringify(wordList))
        return false;
    }
}

extractWordImage();