const base = require("./base");
const SassToCss = require("./sassToCss");
const CssToStyles = require("./cssToStyles");
const {ReplaceVariable} = require("./variable");
let options, SassToStyle;






function Transform(path){
  if(!SassToStyle) {
    SassToStyle = require("../index");
    options = SassToStyle.getOptions();
  }

  // Getting sass content
  let sass = base.GetFileContent(path);

  // Transformation variables
  sass = ReplaceVariable(sass);

  // SASS to CSS
  let css = SassToCss(sass);

  // CSS to STYLES
  let styles = CssToStyles(css);

  // Write in
  path =  path.replace(/\.s?css$/, `${options.postfix}`);
  let string = options.template.replace(/let styles += *{[\s\S]*?};/, () => `let styles = {\n${styles}\n};`);
  base.writeFile(path, string);
}


module.exports = Transform;