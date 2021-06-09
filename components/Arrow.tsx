import * as React from 'react';
import { StyleSheet } from 'react-native';

import { Text, View } from './layout/Themed';
import { Image } from 'react-native'

export default function Arrow() {
  //TODO
  function rotate() {}

  return (
    <View style={styles.container}>
      <Image
        source={require('../assets/images/arrow.png')}
        style={styles.arrow}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  arrow: {
    width: 160,
    height: 160,
    //Change this property to rotate arrow
    transform: [{ rotate: '0deg' }]
  },
  container: {
    flex: 1,
    marginTop: '30%',
    alignItems: 'center',
  }
});
