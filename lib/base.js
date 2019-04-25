const fs = require('fs');


// Get file content
function GetFileContent(path){
  try {
    return fs.readFileSync(path, {
      encoding: "utf8"
    });
  } catch(err) {

  }
}

// Get the folder list
function getReaddir(path){
  return fs.readdirSync(path, {withFileTypes: true})
}


// write file
function writeFile(path, string){
  try {
    fs.writeFileSync(path, string);

    let date = new Date();
    console.log(`${date.toLocaleDateString()} ${date.toLocaleTimeString()}  编译成功：${path}`);
  } catch(err){
    console.error(err);
  }
}


exports.GetFileContent = GetFileContent;
exports.writeFile = writeFile;
exports.getReaddir = getReaddir;
