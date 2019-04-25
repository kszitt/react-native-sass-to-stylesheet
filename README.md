### 语言
[English](https://github.com/kszitt/react-native-sass-to-styleSheet/blob/master/README_EN.md)

### 描述
css文件自动转换成react-native样式文件。  
1、支持变量  
2、支持媒体查询  
3、支持嵌套  
4、支持`transform`
5、适配各种手机

### 安装
``` javascript
npm install react-native-sass-to-stylesheet --save-dev
```

### 使用
##### 1、新建`toStyles.js`，并添加以下内容
``` javascript
const ToStyles = require("react-native-sass-to-stylesheet");

ToStyles.init(path[, options]);
```

###### .init(path[, options])
- path{string} 要监听的文件夹路径，必须
- options{object}
    - space{number} css文件缩进值，默认`2`
    - postfix{string} 转换生成的js文件后缀，默认`Style.js`。例如：`home.scss`转换生成`homeStyle.js`
    - initTransform{boolean} 启动服务后，是否自动转换所有的css文件，默认`false`
    - adaptation{boolean} 适配手机，默认`true`。如果单个样式不需要适配，请添加` !important`标志
    - templatePath{string} 自动转换文件模板路径，默认`./template.js`

##### 2、`package.json`的scripts中，添加
``` json
"transition": "node toStyles.js"
```

##### 3、启动
``` javascript
npm run transition
```
##### 4、创建，修改css文件
在`.init()`的`path`目录下，创建、修改`css`或者`scss`文件，保存。会在当前目录下生成`js`文件。

##### 5、例如：`home.scss`文件如下
``` scss
$size: 12px !global;
$color: red;
.wrapper {
  flex: 1;
}
#header {
  font-size: $size;
  border: 1px solid $color;
  .logo {
    width: 100px;
    margin: 0 10px 10px;
    text-decoration: underline white solid;
  }
}
.main {
  font: italic bold 12px/24px "arial";
  transform: translateY(5px) scaleY(3) rotate(10deg) skewY(20deg);
  text-shadow: 10px 20px 5px #ccc;
}
.footer {
  background: rgba(255, 255, 255, .8);
}
@media screen and (min-width: 500px) and (max-width: 1000px) {
  #header {
    width: 1000px;
  }
  .main {
    font-size: 40px;
  }
}
```
##### 转换后，↓ ↓ ↓ ↓ ↓ ↓
``` javascript
import {StyleSheet, PixelRatio, Dimensions} from 'react-native';
const pixelRatio = PixelRatio.get();
let {width, height} =  Dimensions.get('window');

function getAdaptation(num){
  return parseFloat((num / pixelRatio).toFixed(2));
}

let styles = {
  wrapper: {
    flex: 1
  },
  header: {
    fontSize: getAdaptation(12),
    borderWidth: getAdaptation(1),
    borderStyle: "solid",
    borderColor: "red"
  },
  header_logo: {
    width: getAdaptation(100),
    marginTop: 0,
    marginRight: getAdaptation(10),
    marginBottom: getAdaptation(10),
    marginLeft: getAdaptation(10),
    textDecorationLine: "underline",
    textDecorationColor: "white",
    textDecorationStyle: "solid"
  },
  header_logo_img: {
    width: getAdaptation(100),
    height: getAdaptation(100)
  },
  main: {
    fontStyle: "italic",
    fontWeight: "bold",
    fontSize: getAdaptation(12),
    lineHeight: getAdaptation(24),
    fontFamily: "arial",
    transform: [
      {translateY: getAdaptation(5)},
      {scaleY: getAdaptation(3)},
      {rotate: "10deg"},
      {skewY: "20deg"},
    ],
    textShadowOffset: {
      width: getAdaptation(10),
      height: getAdaptation(20)
    },
    textShadowRadio: 5,
    textShadowColor: "#ccc"
  },
  footer: {
    backgroundColor: "rgba(255, 255, 255, .8)"
  }
};


let media = {
  "width>=500&&width<=1000":{
    "header":{
      width: getAdaptation(1000)
    },
    "main":{
      fontSize: getAdaptation(40)
    },
  },
};


// 媒体查询
width = parseFloat((width * pixelRatio).toFixed(2));
for(let k in media){
  if(eval(k)){
    for(let j in media[k]){
      styles[j] = Object.assign(styles[j] || {}, media[k][j]);
    }
  }
}


const styleSheet = StyleSheet.create(styles);

export default styleSheet;
```
##### 6、在`react native`中使用
``` javascript
import Style form "homeStyle.js";

...

render(){
    return (
        <View style={Style.wrapper}>
           <View style={Style.header}>
               <View style={Style.header_logo}>
                   <Image source={...} style={Style.header_logo_img}/>
               </View>
           </View>
           ...
        </View>
    );
}
```

#### 自动生成模板  
##### 默认的自动生成模板
``` javascript
import {StyleSheet, PixelRatio, Dimensions} from 'react-native';
const pixelRatio = PixelRatio.get();
let {width, height} =  Dimensions.get('window');

/*
自动生成区域
*/

const styleSheet = StyleSheet.create(styles);

export default styleSheet;
```
##### 使用自定义模板  
修改`init(path[, options])`中`options.templatePath`模板路径，写入你的模板。


#### 注意
##### 1、请按照类似以下形式，编写scss。每个样式后面有`;`结尾，缩进格数可以自定义。
``` scss
#header {
  font-size: 12px;
}
```
##### 2、以下转换不成功，请避免使用
``` scss
.aa, .bb {

}
.cc .dd {

}
```