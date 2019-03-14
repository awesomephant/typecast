const PDFDocument = require('pdfkit');
const fs = require('fs');
const colors = require('colors');
const levenshtein = require('fast-levenshtein');

// Create a document

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
         top: inchesToPoints(.5),
         bottom: inchesToPoints(.7),
         outside: inchesToPoints(.6),
         inside: inchesToPoints(.85)
      }
   }
}

let books = []
books.push(new Book('darwin', [5, 7.7]))
books.push(new Book('benjamin', [5, 7.6]))
books.push(new Book('orwell', [4.4, 7.125]))

let target = books[2];
let textSource = books[0];

console.log(`\n----------------------------------`)
console.log(`Generating ${textSource.title} set in ${target.title}`)
console.log(`Trim size: ${target.trimSize.width} x ${target.trimSize.height}`)
console.log(`------------------------------------\n`)

console.log(`Loading text from ${textSource.title}.txt`)
let text = fs.readFileSync(`../week-2/scans/${textSource.title}/${textSource.title}.txt`, 'utf-8')
let words = text.split(' ');
console.log(`✔ Text loaded (${words.length} words)\n`.green)

console.log(`Loading word images from ${target.title}.json`)
let wordList = require(`../week-2/wordlist-${target.title}.json`)
console.log(`✔ Wordlist found (${wordList.length} words)\n`.green)

// Everything is PDF Points (72/inch)

let a4 = [841.89, 595.28]
let pageNumber = 0;

const doc = new PDFDocument({
   size: [target.trimSize.width, target.trimSize.height],
   autoFirstPage: false,
   margins: {
      top: target.margins.top,
      bottom: target.margins.bottom,
      left: target.margins.outside,
      right: target.margins.outside
   }
});

let printersMarksOffset = 5;
let spreadWidth = target.trimSize.width * 2;
let topLeft = [target.margins.outside, target.margins.top]
let topRight = [target.trimSize.width - target.margins.outside, target.margins.top]
let bottomLeft = [target.margins.outside, target.trimSize.height - target.margins.bottom]
let bottomRight = [target.trimSize.width - target.margins.outside, target.margins.top]

doc.on('pageAdded', () => {
   pageNumber++;
});

const hasDescender = function (word) {
   if (word.match(/[Qqypgj]/g) != null) {
      return true
   }
   return false
}
const hasAscender = function (word) {
   if (word.match(/[dfhklbABCDEFGHIJKLMNOPQRSTUVXYZ]/g) != null) {
      return true
   }
   return false
}
const hasSmallAscender = function (word) {
   if (word.match(/[itj]/g) != null) {
      return true
   }
   return false
}

const isWordOnList = function (word, ignoreCase) {
   for (let i = 0; i < wordList.length; i++) {
      if (ignoreCase === true) {
         if (word.toLowerCase() === wordList[i].text.toString().toLowerCase()) {
            return wordList[i]
         }
      } else {
         if (word === wordList[i].text) {
            return wordList[i]
         }
      }
   }
   return false;
}

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
   return closest
}


function getWordImage(word) {
   let filename = ''
   let source = target.title

   let base = '../week-2/word-images/'
   if (isWordOnList(word, false)) {
      let w = isWordOnList(word, false)
      let instanceCount = w.count - 1;
      if (w.count > 5) {
         instanceCount = 4;
      }
      let instance = gri(0, instanceCount)
      filename = source + '/' + w.text + '-' + instance + '.png'
   } else if (isWordOnList(word, true)) {
      //   console.log("Couldn't find exact match, ignoring case.")
      let w = isWordOnList(word, true)
      let instanceCount = w.count - 1;
      if (w.count > 10) {
         instanceCount = 9;
      }
      let instance = gri(0, instanceCount)
      filename = source + '/' + w.text + '-' + instance + '.png'

   } else { // find the closest word
      //      console.log("Couldn't find case-insensitive match, finding closest word.")
      let w = findClosestWord(word);
      let instanceCount = w.count - 1;
      if (w.count > 5) {
         instanceCount = 4;
      }
      let instance = gri(0, instanceCount)
      filename = source + '/' + w.text + '-' + instance + '.png'
   }
   return base + filename;
}

let currentX = target.margins.inside;
let currentY = target.margins.top;
let xHeight = 4.5;
let leading = 3;
let wordSpace = 2;
doc.addPage();

let testWords = ['are', 'at', 'but', 'by', 'arts', 'Technological', 'every', 'indeed', 'precision', 'authority']

for (let i = 0; i < words.length; i++) {
   //for (let i = 0; i < testWords.length; i++) {

   //let word = testWords[i]
   let word = words[i]

   let imagePath = getWordImage(word)
   var img;
   try {
      img = doc.openImage(imagePath);
   } catch (error) {
      console.log(`${error}`.yellow)
   }

   let wordHeight = xHeight;
   let yAdjust = 0;

   let corrections = {
      'ascender': 50,
      'smallAscender': 15,
      'descender': 50,
   }

   if (hasAscender(word)) {
      wordHeight += (xHeight / 100) * corrections.ascender;
      yAdjust = 0;
      if (hasDescender(word)) {
         wordHeight += (xHeight / 100) * corrections.descender;
      }
   } else if (hasSmallAscender(word)) {
      wordHeight += (xHeight / 100) * corrections.smallAscender;
      yAdjust = (xHeight / 100) * (corrections.ascender - corrections.smallAscender);
      if (hasDescender(word)) {
         wordHeight += (xHeight / 100) * corrections.descender;
      }
   } else if (hasDescender(word)) {
      yAdjust = (xHeight / 100) * corrections.descender;
      wordHeight += (xHeight / 100) * corrections.descender;
   } else {
      yAdjust = (xHeight / 100) * 50;
   }

   if (img) {

      doc.image(img, {
         x: currentX,
         y: currentY + yAdjust,
         height: wordHeight
      });

      let aspectRatio = (img.width / img.height);
      let computedWidth = wordHeight * aspectRatio;

      currentX += computedWidth + wordSpace;

      if (!isEven(pageNumber)) { // Right page
         if (currentX > target.trimSize.width - target.margins.outside) {
            currentX = target.margins.inside;
            currentY += wordHeight + leading;
         }
         if (currentY > target.trimSize.height - target.margins.bottom) {
            currentX = target.margins.outside;
            currentY = target.margins.top;
            console.log(`Page ${pageNumber}  R  Words: ${i}/${words.length}`)
            doc.addPage();
         }
      } else { // Left Page
         if (currentX > target.trimSize.width - target.margins.inside) {
            currentX = target.margins.outside;
            currentY += wordHeight + leading;
         }
         if (currentY > target.trimSize.height - target.margins.bottom) {
            currentX = target.margins.inside;
            currentY = target.margins.top;
            console.log(`Page ${pageNumber}  L  Words: ${i}/${words.length}`)
            doc.addPage();
         }
      }
   }

}


doc.pipe(fs.createWriteStream(`${textSource.title}-set-in-${target.title}.pdf`));
doc.end();