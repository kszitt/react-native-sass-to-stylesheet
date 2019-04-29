import {StyleSheet, PixelRatio, Dimensions} from 'react-native';
const pixelRatio = PixelRatio.get();
let {width, height} =  Dimensions.get('window');

let styles = {
  header: {
    textDecorationLine: "underline",
    textDecorationColor: "red",
    textDecorationStyle: "solid"
  }
};



const styleSheet = StyleSheet.create(styles);

export default styleSheet;
