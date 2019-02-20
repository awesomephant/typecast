const tesseract = require('node-tesseract-ocr')
 
const config = {
  lang: 'eng',
  makebox: 'true'
}
 
tesseract
  .recognize('./test.png', config)
  .getBoxText()
  .then(text => {
    console.log('Result:', text)
  })
  .catch(err => {
    console.log('error:', err)
  })