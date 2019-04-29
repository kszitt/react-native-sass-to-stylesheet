import {StyleSheet, PixelRatio, Dimensions} from 'react-native';
const pixelRatio = PixelRatio.get();
let {width, height} =  Dimensions.get('window');

function getAdaptation(num){
  return parseFloat((num / pixelRatio).toFixed(2));
}

let styles = {
  header: {
    fontSize: getAdaptation(12),
    lineHeight: getAdaptation(24)
  },
  header_logo: {
    position: "absolute"
  },
  header_logo_img: {
    width: getAdaptation(100),
    height: getAdaptation(100)
  }
};



const styleSheet = StyleSheet.create(styles);

export default styleSheet;
