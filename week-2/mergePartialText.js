const fs = require("fs");
const commandLineArgs = require('command-line-args')
const glob = require("glob")

const optionDefinitions = [
    { name: 'src', alias: 's', type: String },
]

const options = commandLineArgs(optionDefinitions)

var source = options.src;

console.log('Merging partial text results')

let allText = '';

glob(`./scans/${source}/partial-text/*.txt`, options, function (er, files) {
    console.log(`${files.length} text files found.\n`)
    console.log(files)
    for (let i = 0; i < files.length; i++) {
        let file = files[i]
        let partial = fs.readFileSync(file, 'utf-8')
        allText += ' ' + partial
    }
    fs.writeFileSync(`./scans/${source}/${source}.txt`, allText)
    console.log('done');
})