const chokidar = require('chokidar');
const Transform = require("./lib/transform");
const AutoWriteStyles = require("./lib/autoWriteStyles");
const {SetGlobal} = require("./lib/variable");
const {GetFileContent} = require("./lib/base");
const SassToStyles = {};



let watcher,
  params = {
    space: 2,   // indent
    postfix: "Style.js",
    initTransform: false,
    ignored: /\.(jsx?|png|jpe?g|gif|json)$/,
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
  }

  watcher = chokidar.watch(path, {
    ignored: params.ignored
  });

  watcher.on('ready', () => {
    console.log(`Start monitoring ${path}`);
    watcher.on('change', (path) => {
      if(!/\.s?css$/.test(path)) return;

      let date = new Date();
      getTemplate();
      console.log(`${date.toLocaleDateString()} ${date.toLocaleTimeString()}  Being compiled：${path}`);
      Transform(path);
    });
  });
}


SassToStyles.init = init;
SassToStyles.getOptions = getOptions;
module.exports = SassToStyles;

