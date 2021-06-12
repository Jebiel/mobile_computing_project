import * as React from 'react';
import { StyleSheet, Button } from 'react-native';

import { Text, View } from '../components/layout/Themed';
import { VibrationModule } from '../components/VibrationModule';

export default function TabTwoScreen() {
  var vibroModule = new VibrationModule();
  return (
    <View style={styles.container}>
      <Text>List of vibration encodings. Press the button to feel the vibration.</Text>
      <View style={styles.item}>
        <Button title="Forward" onPress={e => { vibroModule.vibrateForward()}} />
      </View>
      <View style={styles.item}>
        <Text>2 short vibrations</Text>
      </View>

      <View style={styles.item}>
        <Button title="Backward" onPress={e => { vibroModule.vibrateBackward()}} />
      </View>
      <View style={styles.item}>
        <Text>3 short vibrations</Text>
      </View>
            
      <View style={styles.item}>
        <Button title="Left" onPress={e => { vibroModule.vibrateLeft()}} />
      </View>
      <View style={styles.item}>
        <Text>1 long and 1 short vibration</Text>
      </View>

      <View style={styles.item}>
        <Button title="Right" onPress={e => { vibroModule.vibrateRigth()}} />
      </View>
      <View style={styles.item}>
        <Text>1 short and 1 long vibration</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'flex-start', // if you want to fill rows left to right
    padding: 10,
  },
  item: {
    width: '50%', // is 50% of container width
    padding: 10,
    paddingVertical: '10%',
    alignSelf: 'center'
  }
});
