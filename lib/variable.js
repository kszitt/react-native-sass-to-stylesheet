const {getReaddir, GetFileContent} = require("./base");
const global = {};


async function SetGlobal(path){
  let files = getReaddir(path);
  for(let i = 0; i < files.length; i++){
    let path_now = path + "/" + files[i].name;

    if(files[i].isDirectory()){
      await SetGlobal(path_now);
    } else if(files[i].isFile() && /\.s?css$/.test(files[i].name)){
      let scss = await GetFileContent(path_now);

      GlobalVariable(scss);
    }
  }
}

// 获取全局变量
function GlobalVariable(scss){
  scss = scss.replace(/\s*?\$[A-z\d-_]+\s*?:.+?!global;/g, text => {
    let key = text.match(/\$[A-z\d-_]+:/)[0]
      .replace(/^\$/, "")
      .replace(/:$/, "")
      .trim();

    global[key] = text.match(/:.+?!global;/)[0]
      .replace(/^:/, "")
      .replace(/!global;$/, "")
      .trim();

    return "";
  });

  return scss;
}

function ReplaceVariable(scss){
  let variable = {};

  // 获取全局变量
  scss = GlobalVariable(scss);

  // 获取当前页面的变量
  scss = scss.replace(/\s*?\$[A-z\d-_]+\s*?:.+?;/g, text => {
    let key = text.match(/\$[A-z\d-_]+:/)[0]
      .replace(/^\$/, "")
      .replace(/:$/, "")
      .trim();

    variable[key] = text.match(/:.+?;/)[0]
      .replace(/^:/, "")
      .replace(/;$/, "")
      .trim();

    return "";
  });

  // 替换当前页面的变量
  scss = scss.replace(/\$[^/ ;]+/g, text => {
    let key = text.replace(/^\$/, "")
        .trim(),
      value = "";

    for(let k in variable){
      if(key === k){
        value = `${variable[k]}`;
      }
    }

    if(value) return value;
    for(let k in global){
      if(key === k){
        value = `${global[k]}`;
      }
    }

    return value;
  });

  return scss;
}


exports.SetGlobal = SetGlobal;
exports.ReplaceVariable = ReplaceVariable;

