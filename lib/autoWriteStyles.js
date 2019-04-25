const {getReaddir} = require("./base");
const Transform = require("./transform");


async function autoWriteStyles(path){
  let files = getReaddir(path);
  for(let i = 0; i < files.length; i++){
    if(files[i].isDirectory()){
      await autoWriteStyles(path + "/" + files[i].name);
    } else if(files[i].isFile() && /\.s?css$/.test(files[i].name)){
      console.log(`编译：${path}/${files[i].name}`);
      await Transform(path + "/" + files[i].name);
    }
  }
}

module.exports = autoWriteStyles;
