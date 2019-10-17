const chokidar = require('chokidar');
const md5 = require('md5');
const OS = require('os');
const Transform = require("./lib/transform");
const AutoWriteStyles = require("./lib/autoWriteStyles");
const {SetGlobal} = require("./lib/variable");
const {GetFileContent} = require("./lib/base");
const SassToStyles = {};



let compile = {},
  params = {
    space: 2,   // indent
    postfix: "Style.js",
    initTransform: false,
    adaptation: true,
    ignored: [],
    templatePath: "./template.js"
  };


function getOptions(){
  return params;
}

function getTemplate(){
  let template = GetFileContent(params.templatePath);
  if(!template){
    template = GetFileContent(`${__dirname}/template.js`);
  }

  params.template = template;
}

// 忽略文件
function ignoredFile(path){
  for(let item of params.ignored){
    if(/\./.test(item)){   // 文件
      if(eval('/'+ item.replace(/\./g, "\\.") +'$/').test(path)){
        console.log(path, "忽略");
        return true;
      }
    } else {   // 文件夹
      item = item.replace(/\//g, OS.platform() === "win32" ? "\\\\" : "\\\/");
      if(eval('/'+ item +'/').test(path)){
        console.log(path, "忽略");
        return true;
      }
    }
  }

  return false;
}

async function init(path, options){
  params = Object.assign(params, options);

  // indent
  if(params.space){
    let i = 0,
      space = params.space;

    params.space = "";
    while(i < space){
      params.space += " ";
      i++;
    }
  }

  // Template
  getTemplate();

  // Setting global style
  await SetGlobal(path);

  if(params.initTransform){
    await AutoWriteStyles(path);
    // return;
  }

  let watcher = chokidar.watch(path, {
    ignored: /\.(jsx?|png|jpe?g|gif|json)$/,
  });

  watcher.on('ready', () => {
    console.log(`开始监视 ${path} 目录`);
    watcher.on('change', async (path) => {
      if(!/\.s?css$/.test(path)) return;

      let data = GetFileContent(path);
      if(data === "") return;
      data = JSON.stringify(data);
      dataMd5 = md5(data);
      if(compile[path] === dataMd5) {
        return;
      }
      compile[path] = dataMd5;

      // 忽略文件
      if(ignoredFile(path)) return;


      let date = new Date();
      console.log(`${date.toLocaleDateString()} ${date.toLocaleTimeString()}  开始编译：${path}`);
      await Transform(path);
    });
  });

  let template = chokidar.watch(params.templatePath);
  template.on("ready", () => {
    template.on('change', (path) => {
      getTemplate();
    });
  });
}


SassToStyles.init = init;
SassToStyles.getOptions = getOptions;
SassToStyles.ignoredFile = ignoredFile;
module.exports = SassToStyles;

