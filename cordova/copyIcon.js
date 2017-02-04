const fs = require('fs');
const path = require('path');
const parseString = require('xml2js').parseString;

console.log("Copying Icons");

let copy = (src, dest) => {
    fs.writeFileSync(dest, fs.readFileSync(src));
    console.log(`${src} copied to ${dest}`);
};

parseString(fs.readFileSync("config.xml").toString(), function (error, result) {
    if (error) {
        return console.error(error);
    }
    let iconPath = path.resolve(__dirname, result.widget["app-icon"][0].$.src);
    console.log(`Icon is ${iconPath}`);
    let folders = fs.readdirSync(`${__dirname}/platforms/android/res`);
    folders.forEach((folder) => {
        if (folder.startsWith("drawable")) {
            copy(iconPath, `${__dirname}/platforms/android/res/${folder}/icon.png`);
        }
    });
});

