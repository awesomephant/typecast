const sharp = require("sharp");
const parse = require("csv-parse/lib/sync");
const fs = require("fs");
const commandLineArgs = require('command-line-args')

const optionDefinitions = [
    { name: 'src', alias: 's', type: String },
  ]

const options = commandLineArgs(optionDefinitions)

var source = options.src;

let input = fs.readFileSync('./result-' + source + '.tsv')

const words = parse(input, {
    columns: true,
    skip_empty_lines: true,
    delimiter: '\t',
    cast: true
})

console.log(words.length + '  words found.')
console.log("Extracting word images...")

const isWordOnList = function (word) {
    for (let i = 0; i < wordList.length; i++) {
        if (word === wordList[i].text) {
            return i
        }
    }
    return false;
}


class WordInstance {
    constructor(left, top, width, height) {
        this.left = left
        this.top = top
        this.width = width
        this.height = height
    }
}
class Word {
    constructor(text) {
        this.text = text
        this.count = 1
        this.instances = []
    }
}
var wordList = []

const writeWordList = function (cb) {
    for (let i = 0; i < words.length; i++) {

        let left = words[i].left;
        let top = words[i].top;
        let width = words[i].width;
        let height = words[i].height;
        if (width < 1000 && height < 1000) {
            if (isWordOnList(words[i].text)) {
                let index = isWordOnList(words[i].text)
                wordList[index].count += 1;
                wordList[index].instances.push(new WordInstance(left, top, width, height));
            } else {
                let newWord = new Word(words[i].text);
                newWord.instances.push(new WordInstance(left, top, width, height));
                wordList.push(newWord)
            }
        }
    }
    console.log(wordList.length + ' valid words found. Discarded ' + (words.length - wordList.length))
    fs.writeFileSync(`./wordlist-${source}.json`, JSON.stringify(wordList))

    cb()
}


let i = 0;
let j = 0;
var image = sharp(source + '.jpg')
const extractImage = function () {
    if (i < wordList.length) {
        let w = wordList[i];
        if (j < w.instances.length) {
            let wi = w.instances[j];
            image.extract({ left: wi.left, top: wi.top, width: wi.width, height: wi.height })
                .toFile('./word-images/' + source + '/' + w.text + '-' + j + '.png', function (err) {
                    console.log(i + '/' + wordList.length)
                    j++
                    extractImage()
                });
        } else {
            j = 0;
            i++;
            extractImage()
        }
    }
}

writeWordList(function () {
    console.log('Extracting images...')
    extractImage()
});