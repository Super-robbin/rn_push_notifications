import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import * as Notifications from "expo-notifications";
// import * as Permissions from "expo-permissions";

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
//

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
    async function requestPermissions() {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to send notifications was not granted');
      }
    }
    requestPermissions();
  }, []);

  useEffect(() => {
    const subscription1 = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log("NOTIFICATION RECEIVED");
        console.log(notification.request.content.data);
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

  return (
    <View style={styles.container}>
      <Button
        title="Schedule Notification"
        onPress={scheduleNotificationHandler}
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
