const PDFDocument = require('pdfkit');
const fs = require('fs');
const colors = require('colors');

// Create a document

function inchesToPoints(inches) {
   return inches * 72;
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
         bottom: inchesToPoints(.5),
         outside: inchesToPoints(.5),
         inside: inchesToPoints(.8)
      }
   }
}

let books = []
books.push(new Book('darwin', [5, 7.6]))
books.push(new Book('benjamin', [5, 7.6]))

let target = books[1];
let textSource = books[1];
console.log(`\n----------------------------------`)
console.log(`Generating ${textSource.title} set in ${target.title}`)
console.log(`Trim size: ${target.trimSize.width} x ${target.trimSize.height}`)
console.log(`------------------------------------\n`)

console.log(`Loading text from ${textSource.title}.txt`)
let text = fs.readFileSync(`./texts/${textSource.title}.txt`, 'utf-8')
let words = text.split(' ');
console.log(`✔ Text loaded (${words.length} words)\n`.green)

console.log(`Loading wordlist from ${textSource.title}.json`)
let wordList = require(`../week-2/wordlist-${textSource.title}.json`)
console.log(`✔ Wordlist found (${wordList.length} words)\n`.green)

// Everything is PDF Points (72/inch)

let a4 = [841.89, 595.28]
let pageNumber = 1;

const doc = new PDFDocument({
   size: a4,
   autoFirstPage: false,
   margins: {
      top: (a4[1] - target.trimSize.height) / 2 + target.margins.top,
      bottom: (a4[1] - target.trimSize.height) / 2 + target.margins.bottom,
      left: (a4[0] - target.trimSize.width * 2) / 2 + target.margins.outside,
      right: (a4[0] - target.trimSize.width * 2) / 2 + target.margins.outside
   }
});
doc.addPage();

let printersMarksOffset = 5;
let spreadWidth = target.trimSize.width * 2;
let topLeft = [(doc.page.size[0] / 2) - (spreadWidth / 2), (doc.page.size[1] / 2) - (target.trimSize.height / 2)]
let topRight = [(doc.page.size[0] / 2) + (spreadWidth / 2), (doc.page.size[1] / 2) - (target.trimSize.height / 2)]
let bottomLeft = [(doc.page.size[0] / 2) - (spreadWidth / 2), (doc.page.size[1] / 2) + (target.trimSize.height / 2)]
let bottomRight = [(doc.page.size[0] / 2) + (spreadWidth / 2), (doc.page.size[1] / 2) + (target.trimSize.height / 2)]
let topCentre = [(doc.page.size[0] / 2), (doc.page.size[1] / 2) - (target.trimSize.height / 2)]
let bottomCentre = [(doc.page.size[0] / 2), (doc.page.size[1] / 2) + (target.trimSize.height / 2)]

doc.on('pageAdded', () => {
   pageNumber++;
   console.log(`Page ${pageNumber}`)
   doc.lineWidth(.2)

   doc.moveTo(topLeft[0], topLeft[1])
      .lineTo(topLeft[0], topLeft[1] - 15)
      .moveTo(topLeft[0], topLeft[1])
      .lineTo(topLeft[0] - 15, topLeft[1])
      .stroke()

   doc.moveTo(topRight[0], topLeft[1])
      .lineTo(topRight[0], topRight[1] - 15)
      .moveTo(topRight[0], topRight[1])
      .lineTo(topRight[0] + 15, topRight[1])
      .stroke()

   doc.moveTo(bottomLeft[0], bottomLeft[1])
      .lineTo(bottomLeft[0], bottomLeft[1] + 15)
      .moveTo(bottomLeft[0], bottomLeft[1])
      .lineTo(bottomLeft[0] - 15, bottomLeft[1])
      .stroke()

   doc.moveTo(bottomRight[0], bottomRight[1])
      .lineTo(bottomRight[0], bottomRight[1] + 15)
      .moveTo(bottomRight[0], bottomRight[1])
      .lineTo(bottomRight[0] + 15, bottomRight[1])
      .stroke()

   doc.moveTo(topCentre[0], topCentre[1])
      .lineTo(topCentre[0], topCentre[1] - 15)
      .stroke()

   doc.moveTo(bottomCentre[0], bottomCentre[1])
      .lineTo(bottomCentre[0], bottomCentre[1] + 15)
      .stroke()

   // let bottom = doc.page.margins.bottom;
   // doc.page.margins.bottom = 0;
   // doc.text(`${pageNumber}`,
   //    0.5 * (doc.page.width - 100),
   //    doc.page.height - 50,
   //    {
   //       width: 100,
   //       align: 'center',
   //       lineBreak: false,
   //    });

   // // Reset text writer position
   // doc.text('', 50, 50);
   // doc.page.margins.bottom = bottom;
});



let currentX = topLeft[0] + target.margins.outside;
let currentY = topLeft[1] + target.margins.top;
let wordHeight = 10;
doc.addPage();

for (let i = 0; i < words.length; i++) {
   let imagePath = `../week-2/word-images/${target.title}/${wordList[gri(0,100)].text}-0.png`;
   var img = doc.openImage(imagePath);
   doc.image(img, {
      x: currentX,
      y: currentY,
      height: wordHeight
   });

   let aspectRatio = (img.width / img.height);
   let computedWidth = wordHeight * aspectRatio; 

   currentX += computedWidth + 4;
   if (currentX > topCentre[0] - target.margins.inside){
      currentX = topLeft[0] + target.margins.outside;
      currentY += wordHeight + 5;
   }
   if (currentY > bottomCentre[1] - target.margins.bottom){
      currentX = topLeft[0] + target.margins.outside;
      currentY = topCentre[1] + target.margins.top;
      doc.addPage();
   }
}


doc.pipe(fs.createWriteStream('output.pdf'));
doc.end();