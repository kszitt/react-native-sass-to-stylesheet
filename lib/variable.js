const {getReaddir, GetFileContent} = require("./base");
const path = require("path");
const global = {};


async function SetGlobal(path){
  let files = getReaddir(path);
  for(let i = 0; i < files.length; i++){
    let path_now = path + "/" + files[i].name;

    if(files[i].isDirectory()){
      await SetGlobal(path_now);
    } else if(files[i].isFile() && /\.s?css$/.test(files[i].name)){
      let scss = await GetFileContent(path_now);

      GlobalVariable(scss, path_now);
    }
  }
}

// 获取全局变量
function GlobalVariable(scss, filePath){
  // @import
  let sassGlobal = [],
    importSassArr = [];
  function getGlobal(path_str){
    let sass = GetFileContent(path_str);

    // 删除注释
    sass = sass.replace(/ *?\/\/[\s\S]+?\n/g, "")
      .replace(/\s*?\/\*[\s\S]+?\*\//g, "");

    let variables = sass.match(/\$[A-z\d-_]+\s*?:.+?!global;/g) || [],
      importSass = sass.replace(/@import +["'].+?["'];?/g, "");
    importSassArr.push(importSass);

    sassGlobal = sassGlobal.concat(variables);
    sass.replace(/@import +["'].+?["'];?/g, text => {
      let str = text.replace(/^.+?["']/, "")
          .replace(/["'];?$/, ""),
        new_path = path.resolve(path_str.replace(/[^/\\]+$/, ""), str);

      getGlobal(new_path);
      return "";
    });
  }

  // 删除注释
  scss = scss.replace(/ *?\/\/[\s\S]+?\n/g, "")
    .replace(/\s*?\/\*[\s\S]+?\*\//g, "");

  scss = scss.replace(/@import +["'].+?["'];?/g, text => {
    let str = text.replace(/^.+?["']/, "")
        .replace(/["'];?$/, ""),
      new_path = path.resolve(filePath.replace(/[^/\\]+$/, ""), str);

    sassGlobal = [];
    importSassArr = [];
    getGlobal(new_path);

    return sassGlobal.join("\n") + "\n" + importSassArr.join("\n") + "\n";
  });

  // !global
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

function ReplaceVariable(scss, filePath){
  let variable = {};

  // 获取全局变量
  scss = GlobalVariable(scss, filePath);

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

