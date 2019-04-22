import {StyleSheet, PixelRatio, Dimensions} from 'react-native';
const pixelRatio = PixelRatio.get();
let {width, height} =  Dimensions.get('window');

let styles = {
  wrapper: {
    flex: 1,
    backgroundColor: "#f8f8f8"
  },
  transform: {
    height: 500,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center"
  },
  transform_text: {
    height: 60,
    lineHeight: 60,
    transform: [
      {translateX: 100},
      {rotate: "180deg"},
    ],
    backgroundColor: "red"
  },
  transform_aa: {
    width: 100
  },
  flex: {
    flex: 1
  },
};
let media = {
  "width<=1000":{
    "body":{
      fontSize: 12
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
