
for %%i in (./scans/%1/*.jpg) do (tesseract ./scans/%1/"%%i" "./scans/%1/partial-text/%%i")
node mergePartialText.js -s %1
for %%i in (./scans/%1/*.jpg) do (tesseract ./scans/%1/"%%i" "./scans/%1/ocr-%%i" tsv)
node makeWordImages -s %1