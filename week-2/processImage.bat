
for %%i in (./scans/%1/*.jpg) do (tesseract ./scans/%1/"%%i" "./scans/%1/partial-text/%%i" -l lat) 
node mergePartialText.js -s %1
for %%i in (./scans/%1/*.jpg) do (tesseract ./scans/%1/"%%i" "./scans/%1/ocr-%%i" tsv -l lat)
node makeWordImages -s %1