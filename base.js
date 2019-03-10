const fs = require('fs');


// 获取文件内容
function getFileContent(path){
  try {
    return fs.readFileSync(path, {
      encoding: "utf8"
    });
  } catch(err) {
    return "";
  }
}

// 获取文件夹列表
function getReaddir(path){
  return fs.readdirSync(path, {withFileTypes: true})
}


// 写入文件
function writeFile(path, string){
  try {
    fs.writeFileSync(path, string);

    console.log(`编译成功：${path}`);
  } catch(err){
    console.error(err);
  }
}


exports.getFileContent = getFileContent;
exports.writeFile = writeFile;
exports.getReaddir = getReaddir;
