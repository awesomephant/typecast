const PDFDocument = require('pdfkit');
const fs = require('fs');
const colors = require('colors');
const levenshtein = require('fast-levenshtein');
const _cliProgress = require('cli-progress');

function inchesToPoints(inches) {
   return inches * 72;
}
function isEven(n) {
   return n % 2 == 0;
}
function gri(min, max) {
   return Math.floor(Math.random() * (max - min + 1)) + min;
}
class Book {
   constructor(title, trimSize) {
      this.title = title
      this.trimSize = {
         width: inchesToPoints(trimSize[0]),
         height: inchesToPoints(trimSize[1])
      }
      this.margins = {
         top: inchesToPoints(.3),
         bottom: inchesToPoints(.8),
         outside: inchesToPoints(.3),
         inside: inchesToPoints(.6)
      }
   }
}

let books = []
books.push(new Book('darwin', [5, 7.7]))
books.push(new Book('benjamin', [5, 7.6]))
books.push(new Book('orwell', [4.4, 7.125]))

let target = books[0];
let textSource = books[2];

console.log(`\n----------------------------------`)
console.log(`Generating ${textSource.title} set in words from ${target.title}`)
console.log(`Trim size: ${target.trimSize.width} x ${target.trimSize.height}`)
console.log(`------------------------------------\n`)

console.log(`Loading text from ${textSource.title}.txt`)
let text = fs.readFileSync(`../week-2/scans/${textSource.title}/${textSource.title}.txt`, 'utf-8')
let words = text.split(' ');
console.log(`✔ Text loaded (${words.length} words)\n`.green)

console.log(`Loading wordlist from ${target.title}.json`)
let wordList = require(`../week-2/wordlist-${target.title}.json`)
console.log(`✔ Wordlist found (${wordList.length} words)\n`.green)

// Everything is PDF Points (72/inch)

let a4 = [841.89, 595.28]
let pageNumber = 0;

const doc = new PDFDocument({
   size: [target.trimSize.width, target.trimSize.height],
   autoFirstPage: false,
   margins: {
      top: 0,
      bottom: 0,
      left: 0,
      right: 0
   }
});

doc.font('./UntitledSerif-Regular.otf')
   .fontSize(10)

doc.on('pageAdded', () => {
   pageNumber++;
   console.log(`Page ${pageNumber}`)
});

const findClosestWord = function (word) {
   let dmin = 99999;
   let closest;
   for (let i = 0; i < wordList.length; i++) {
      let d = levenshtein.get(word, wordList[i].text.toString())
      if (d < dmin) {
         dmin = d
         closest = wordList[i]
      }
   }

   let letters = word.split('')
   //console.log(word)
   //console.log(letters)
   if (letters[letters.length - 1] === '.') { closest.text += '.' }

   return closest
}

let s = '';
console.log('Generating composite text\n')

const bar1 = new _cliProgress.Bar({ barsize: 125, etaBuffer: 1000 }, _cliProgress.Presets.shades_classic);
bar1.start(words.length, 0);

//for (let i = 0; i < 2000; i++) {
for (let i = 0; i < words.length; i++) {
   let c = findClosestWord(words[i])
   s += c.text + ' ';

   bar1.update(i);
}

bar1.stop();

s = s.split(' ')
console.log('\nGenerating PDF')

function getHeight(chunk) {
   let h = doc.heightOfString(chunk.join(' '), { width: target.trimSize.width - target.margins.outside - target.margins.inside });
   return h;
}
//const bar2 = new _cliProgress.Bar({ barsize: 125, }, _cliProgress.Presets.shades_classic);
//bar2.start(Math.floor(s.length / chunkSize), 0);


let i = 0;

//console.log(`${s.join(' ')}`)

while (i < s.length - 1) {
   console.log(`Start ${i} / ${s.length}`)
   let chunk = []
   let chunkSize = 0;
   while (getHeight(s.slice(i, i + chunkSize)) < (target.trimSize.height - target.margins.top - target.margins.bottom)) {
      chunkSize++;
      if (i + chunkSize >= s.length) {
         break;
      }
   }

   chunkSize -= 1;
   chunk = s.slice(i, i + chunkSize)
   console.log(`Reached height at ${chunkSize} words.`)

   chunk = chunk.join(' ')
   let x = 0;
   let y = target.margins.top;

   if (!isEven(pageNumber)) {
      x = target.margins.outside;
   } else {
      x = target.margins.inside;
   }
   doc.addPage()
      .text(chunk, x, y, {
         width: target.trimSize.width - target.margins.outside - target.margins.inside,
         lineGap: 0
      })

   i += chunkSize;
   console.log(`End ${i} / ${s.length}`)
}

doc.pipe(fs.createWriteStream(`${textSource.title}-in-words-from-${target.title}.pdf`));
doc.end();