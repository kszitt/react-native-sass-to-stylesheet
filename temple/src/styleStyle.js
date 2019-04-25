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
