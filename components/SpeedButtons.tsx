import React, { useState } from 'react';
import { Button, NativeSyntheticEvent, NativeTouchEvent, ScrollView, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { View } from './Themed';
import axios from 'axios';
import * as Notifications from 'expo-notifications';

export function SpeedButtons() {

    const [selectedIndex,setSelectedIndex] = useState<number|null>();
    const [freeText,setFreeText] = useState("")
    const handleButtonPress = (buttonIndex: number) => {
        setSelectedIndex(buttonIndex)
    }

    const scheduleNotifications = async () => {
        await Notifications.cancelAllScheduledNotificationsAsync()

        const MEAN = 24

        let notificationTrigger = 0
        for (let i = 0; i < 10; i++) {
            const delayInHours = Math.random() * 36 + MEAN
            if (i==0) {
                alert(delayInHours)
            }
            notificationTrigger = notificationTrigger + delayInHours
            console.log(notificationTrigger)
            Notifications.scheduleNotificationAsync({
                content: {
                    title: "RandomTracker"
                },
                trigger: {seconds: notificationTrigger * 60 * 60}
            })
        }
        

    }
    const submit = async () => {
            try {
                if (selectedIndex) {
                    const textNoCommas = freeText.replace(/,/g, '.')
                    const value = selectedIndex.toString() + "," + textNoCommas
                    await AsyncStorage.setItem(Date.now().toString(), value)
                } else {
                    alert("Push a button silly")
                }   
            } catch (e) {
              alert(e)
            }
            setSelectedIndex(null)
            setFreeText("")
            scheduleNotifications()
            alert("submitted :)")
    }
  return <ScrollView style={styles.fillWidth}>
      {

          [1,2,3,4,5].map(num => {
              return (
                  <View>
                  <SpeedButton key={num} value={num} isSelected={selectedIndex == num} onPress={()=>handleButtonPress(num)}/>
                  <Separator />
                  </View>
              )
          })
      }
      <Separator />
        <TextInput
            style={styles.padded}
            onChangeText={setFreeText}
            value={freeText}
            placeholder="Why?"
      />
      <Separator />
    <SubmitButton onPress={submit}/>
    <Separator />
    <EmailReportButton />
  </ScrollView>;
}

function SpeedButton(props: {value: number, isSelected: boolean, onPress: (ev: NativeSyntheticEvent<NativeTouchEvent>) => void} ) {

    return <Button title={props.value.toString()} onPress={props.onPress} color={props.isSelected ? 'green' : 'navy'} />

}

function SubmitButton(props: {onPress: (ev: NativeSyntheticEvent<NativeTouchEvent>) => void}) {
    return <Button title="Submit" onPress={props.onPress} color='navy'/>
}

function EmailReportButton() {
    const getCsv = async () => {
        let csv = "Time,Feeling,Text\n"
        let keys = []
        try {
            keys = await AsyncStorage.getAllKeys()
            let values = []
            values = await AsyncStorage.multiGet(keys)
            for (const [i, key] of keys.entries()) {
                if (key != "EXPO_CONSTANTS_INSTALLATION_ID") {
                    csv += values[i] + '\n'
                }
            }
        } catch(e) {
            alert(e)
        }
        return csv
  }    
    

    const emailReport = async () => {

        const csv = await getCsv()

        axios({
            url: "https://formspree.io/f/mayvlbea",
            method: 'post',
            headers: {
              'Accept': 'application/json'
            },
            data: {
              email: 'ljohnston931@gmail.com',
              message: csv
            }
          }).then((response) => { alert(JSON.stringify(response)); })
    }
    return <Button title="Email Report" onPress={emailReport} color='navy' />
}

const Separator = () => (
    <View style={styles.smallMargin} />
  );

const styles = StyleSheet.create({
    smallMargin: {
      margin:10
    },
    padded: {
      padding: 10,
    },
    fillWidth: {
        width: '100%'
    }
  });