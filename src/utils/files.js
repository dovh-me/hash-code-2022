const fs = require('fs');
function readFile (filePath) {
    return fs.readFileSync(filePath, {encoding: 'utf-8' });
}

function writeFile (filePath, data) {
    fs.writeFileSync(filePath, data);
    console.log('Output written to file: ' + filePath);
}

module.exports = {
    readFile, writeFile
}