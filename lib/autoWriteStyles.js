const {getReaddir} = require("./base");
const Transform = require("./transform");


async function autoWriteStyles(path){
  let ignoredFile = require("../index").ignoredFile;

  let files = getReaddir(path);
  for(let i = 0; i < files.length; i++){
    // 忽略文件
    let new_path = path + "/" + files[i].name;
    if(ignoredFile(new_path)) continue;

    if(files[i].isDirectory()){
      await autoWriteStyles(new_path);
    } else if(files[i].isFile() && /\.s?css$/.test(files[i].name)){
      console.log(`编译：${path}/${files[i].name}`);
      await Transform(new_path);
    }
  }
}

module.exports = autoWriteStyles;
