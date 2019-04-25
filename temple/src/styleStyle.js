import {StyleSheet, PixelRatio, Dimensions} from 'react-native';
const pixelRatio = PixelRatio.get();
let {width, height} =  Dimensions.get('window');

let styles = {
  wrapper: {
    flex: 1
  },
  main: {
    flex: 1,
    backgroundColor: "#f8f8f8",
    paddingTop: 0,
    paddingRight: 60,
    paddingBottom: 60,
    paddingLeft: 60
  },
  main_list: {
    marginTop: 35,
    marginBottom: 28
  },
  main_caption: {
    fontWeight: "bold",
    fontSize: 50,
    lineHeight: 100,
    color: "#333333"
  },
  main_p: {
    lineHeight: 76,
    fontSize: 44,
    color: "#999999"
  }
};

let media = {};



// 媒体查询
width = parseFloat((width * pixelRatio).toFixed(2));
for(let k in media){
  if(eval(k)){
    for(let j in media[k]){
      styles[j] = Object.assign(styles[j] || {}, media[k][j]);
    }
  }
}


// 适配
for(let i in styles){
  for(let k in styles[i]){
    if(typeof styles[i][k] === "number"){
      if(k !== "flex"){
        styles[i][k] = parseFloat((styles[i][k] / pixelRatio).toFixed(2));
      }
    }
  }
}

const styleSheet = StyleSheet.create(styles);

export default styleSheet;
