const sharp = require("sharp");
const parse = require("csv-parse/lib/sync");
const fs = require("fs");
const commandLineArgs = require('command-line-args')
const glob = require("glob")

const optionDefinitions = [
    { name: 'src', alias: 's', type: String },
]

const options = commandLineArgs(optionDefinitions)

var source = options.src;

const isWordOnList = function (word, wordList) {
    for (let i = 0; i < wordList.length; i++) {
        if (word === wordList[i].text) {
            return i
        }
    }
    return false;
}


class WordInstance {
    constructor(left, top, width, height, file) {
        this.left = left
        this.top = top
        this.width = width
        this.height = height
        this.file = file
    }
}
class Word {
    constructor(text) {
        this.text = text
        this.count = 1
        this.instances = []
    }
}
const writePartialWordList = function (partialTSV, cb) {
    let wordList = []
    let file = partialTSV.file.substring(0, partialTSV.file.length - 4).replace('ocr-', '')
    let words = partialTSV.list
    for (let i = 0; i < words.length; i++) {
        let left = words[i].left;
        let top = words[i].top;
        let width = words[i].width;
        let height = words[i].height;
        let text = words[i].text.toString();
        if (width < 1000 && height < 1000
            && !text.includes(':')
            && !text.includes(';')
            && !text.includes('.')
            && !text.includes('?')
            && !text.includes(',')) {
            if (isWordOnList(text, wordList)) {
                let index = isWordOnList(text, wordList)
                wordList[index].count += 1;
                wordList[index].instances.push(new WordInstance(left, top, width, height, file));
            } else {
                let newWord = new Word(text);
                newWord.instances.push(new WordInstance(left, top, width, height, file));
                wordList.push(newWord)
            }
        }
    }
    console.log(wordList.length + ' valid words found. Discarded ' + (words.length - wordList.length))
    cb(wordList)
}

const mergePartialWordLists = function (partialWordLists) {
    let finalList = []
    for (let i = 0; i < partialWordLists.length; i++) {
        let partialWordList = partialWordLists[i];
        for (let j = 0; j < partialWordList.length; j++) {
            if (!isWordOnList(partialWordList[j].text, finalList)) {
                finalList.push(partialWordList[j])
            } else {
                let index = isWordOnList(partialWordList[j].text, finalList);
                finalList[index].instances = finalList[index].instances.concat(partialWordList[j].instances)
            }
        }
    }
    return finalList;
}

function getWordImage(text, wi, index, cb) {
    let pos = { left: wi.left, top: wi.top, width: wi.width, height: wi.height }
    //console.log(wi)
    //console.log(wi.file)
    let outputPath = './word-images/' + source + '/' + text.toLowerCase() + '-' + index + '.png';
//    console.log(outputPath)
    sharp(wi.file)
        .extract(pos)
        .toFile(outputPath, function (err) {
            cb();
        })

}

let i = 0;
let j = 0;
let finalList;

function extractImages() {
    if (i < finalList.length) {
        let w = finalList[i]
        console.log(`${i}/${finalList.length}: ${w.text} (${j}/${w.instances.length})`)
        if (j < w.instances.length && j < 10) {
            let wi = w.instances[j]
            getWordImage(w.text, wi, j, function () {
                j++
                extractImages()
            })
        } else {
            j = 0;
            i++
            extractImages()
        }
    } else {
        console.log('Done')
    }
}

let words = [];
let partialTSVs = [];

glob(`./scans/${source}/*.tsv`, options, function (er, files) {
    console.log(`${files.length} OCR result files found.`)
    console.log(files)
    for (let i = 0; i < files.length; i++) {
        let file = files[i]
        console.log(file)
        let partial = fs.readFileSync(file, 'utf-8')
        partial = partial.replace(/"/g, '-')
        //partial = partial.replace("'", '-')
        let partialWords = parse(partial, {
            columns: true,
            skip_empty_lines: true,
            delimiter: '\t',
            cast: true
        })
        console.log(partialWords.length)
        partialTSVs.push({
            file: file,
            list: partialWords
        });
    }
    console.log(`${partialTSVs.length} partial word lists generated.`)

    let partialWordLists = []

    for (let i = 0; i < partialTSVs.length; i++) {
        writePartialWordList(partialTSVs[i], function (wordList) {
            partialWordLists.push(wordList);
        });
    }
    finalList = mergePartialWordLists(partialWordLists);

    console.log(`\nWriting final word list containing ${finalList.length} unique entries`)
    fs.writeFileSync(`./wordlist-${source}.json`, JSON.stringify(finalList))
    extractImages()
//    getWordImage(finalList[3].instances[0], 0, function(){
  //      console.log('done')
 //   })
})