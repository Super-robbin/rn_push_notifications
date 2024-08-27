import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Button, StyleSheet, Alert, View, Platform } from "react-native";
import * as Notifications from "expo-notifications";
import Constants from "expo-constants";

// IMPORTANT: If building the app without Expo Go, additional configuration is necessary

// 1 - We import * as Notifications from "expo-notifications"
// 2 - We then call Notifications.scheduleNotificationAsync() inside scheduleNotificationHandler to schedule a local notification.
// It's async because it returns a Promise, we also pass a configuration object that contains content, trigger and identifier.
// 3 - Content as the name suggests takes an object with the content of the notification.
// 4 - Trigger takes an object and we can use the seconds property which configures the number of seconds until this notification will be delivered.
// 5 - Notifications.setNotificationHandler(), outside the App but inside the file, so it runs once whenever the App starts.
// This method must be executed to tell the app and therefore, indirectly, the underlying operating system,
// how incoming notifications that are related to this app should be handled. It takes an object with handleNotification, handleSucess and handleError.
// 6 - handleNotification will be triggered whenever we receive a notification and it's not optional.

// IMPORTANT: Check the local notifications docs on React Course section 249 for permissions reference

// 7 - We add an event listener through useEffect to the incoming notifications.
// Notifications.addNotificationReceivedListener returns a subscription object, which we can then also use for cleaning up that subscription to this event.
// We can do this by calling subscription.remove, and we should call this whenever this component
// is removed from the screen, when it's not active anymore. We do that by return a function and passing it inside.

// 8 - To listen to user interaction with our notifications, we use Notifications.addNotificationResponseReceivedListener inside the same useEffect.

// 9 - Now we will implement push notifications (local until now.). We again go through useEffect at the beginning of the App.
// We use Notifications.getExpoPushTokenAsync() to get the push token for this device.

// NOTE: You will need the projectId to be passed inside getExpoPushTokenAsync(). 
// I had to use:
// npm install -g eas-cli
// eas login

// IMPORTANT: Push token will be the address, which we will need later when we send push notifications to other devices
// because, when it comes to delivering push notifications to other devices, you need some way of identifying devices.
// The address of a device is simply such a push token, which will be unique for every device.

// 10 - We create an helper function configurePushNotification where we use Notifications.getPermissionsAsync() to get permission for iOS (Android does this automatically)
// and Notifications.requestPermissionsAsync(); to request permission if we don't have it yet.
// 11 - We then call configurePushNotification() at the end of the useEffect.
// 12 - We check if Platform.OS === 'android', in which case we need some further configuration.
// Notifications.setNotificationChannelAsync("default", {name: "default", importance: Notifications.AndroidImportance.DEFAULT});

// IMPORTANT: https://expo.dev/notifications allows you to test a notification
// 14 - We create sendPushNotificationHandler and attach it to the button.
// Inside we do a POST request to the endpoint and configure the fetch as shown below.

Notifications.setNotificationHandler({
  handleNotification: async () => {
    return {
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowAlert: true,
    };
  },
});

export default function App() {
  useEffect(() => {
    const configurePushNotification = async () => {
      const { status } = await Notifications.getPermissionsAsync();
      let finalStatus = status;

      if (finalStatus !== "granted") {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus;
      }

      if (finalStatus !== "granted") {
        Alert.alert(
          "Permission required",
          "Push notifications need the appropriate permissions."
        );
        return;
      }
      const pushTokenData = await Notifications.getExpoPushTokenAsync({
        projectId: Constants.expoConfig.extra.eas.projectId,
      });

      console.log(pushTokenData);

      if (Platform.OS === "android") {
        Notifications.setNotificationChannelAsync("default", {
          name: "default",
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
    };

    configurePushNotification();
  }, []);

  useEffect(() => {
    const subscription1 = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("NOTIFICATION RECEIVED");
        console.log(notification.request.content);
      }
    );

    const subscription2 = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log("NOTIFICATION RESPONSE RECEIVED");
        console.log(response);
      }
    );

    return () => {
      subscription1.remove();
      subscription2.remove();
    };
  }, []);

  const scheduleNotificationHandler = () => {
    Notifications.scheduleNotificationAsync({
      content: {
        title: "My first local notification",
        body: "This is the body of the notification",
        data: { userName: "Rob" },
      },
      trigger: {
        seconds: 5,
      },
    });
  };

  const sendPushNotificationHandler = () => {
    fetch("https://exp.host/--/api/v2/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        to: "ExponentPushToken[qZXPOgH05nUi8e_FKSST9h]",
        title: "Test - sent from a device!",
        body: "This is a test!",
      }),
    });
  };

  return (
    <View style={styles.container}>
      <Button
        title="Schedule Notification"
        onPress={scheduleNotificationHandler}
      />
      <Button
        title="Send Push Notification"
        onPress={sendPushNotificationHandler}
      />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
