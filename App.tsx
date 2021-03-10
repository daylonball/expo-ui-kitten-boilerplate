import * as eva from "@eva-design/eva";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import {
  ApplicationProvider,
  Icon,
  IconRegistry,
  Spinner,
  Text,
} from "@ui-kitten/components";
import { EvaIconsPack } from "@ui-kitten/eva-icons";
import firebase from "firebase";
import React, { useEffect, useState } from "react";
import { StatusBar, View } from "react-native";
import config from "./config";
import PersistentStorage from "./src/persistent-storage";
import Auth from "./src/screens/auth";
import Home from "./src/screens/home";
import Profile from "./src/screens/profile";
import { default as theme } from "./theme.json";

const Tabs = createBottomTabNavigator();
const HomeStack = createStackNavigator();
const ProfileStack = createStackNavigator();
const { Navigator, Screen } = createStackNavigator();

enum AppState {
  UnknownAuthenticationState,
  Unauthenticated,
  Authenticated,
}

function HomeGroup() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={Home} />
    </HomeStack.Navigator>
  );
}

function ProfileGroup() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="ProfileScreen" component={Profile} />
    </ProfileStack.Navigator>
  );
}

function TabBarIcon({
  name,
  size,
  focused,
}: {
  name: string;
  focused: boolean;
  color: string;
  size: number;
}) {
  return (
    <Icon
      name={name}
      style={{
        width: size,
        height: size,
        tintColor: focused ? "#FF5252" : "#999",
      }}
    />
  );
}

function TabBarLabel({ label, focused }: { focused: boolean; label: string }) {
  return (
    <Text
      style={{
        color: focused ? "#FF5252" : "#999",
        fontSize: 10,
      }}
    >
      {label}
    </Text>
  );
}

function App() {
  const [appState, setAppState] = useState(AppState.UnknownAuthenticationState);

  async function retrieveInitialAuthenticationState() {
    await determineAuthenticationState(await PersistentStorage.get("user"));
  }

  async function determineAuthenticationState(user: firebase.User | null) {
    setAppState(
      user === null ? AppState.Unauthenticated : AppState.Authenticated
    );
  }

  if (!firebase.apps.length) {
    firebase.initializeApp(config.firebase);
  } else {
    firebase.app();
  }

  useEffect(() => {
    retrieveInitialAuthenticationState();
    PersistentStorage.onChange("user", determineAuthenticationState);
    return () => PersistentStorage.clearListeners();
  }, []);

  if (appState === AppState.UnknownAuthenticationState) {
    // TODO better loading
    return <View></View>;
  }

  return (
    <ApplicationProvider {...eva} theme={{ ...eva.light, ...theme }}>
      <IconRegistry icons={EvaIconsPack} />
      <StatusBar barStyle={"dark-content"} />
      <NavigationContainer>
        {(() => {
          if (appState === AppState.Authenticated) {
            return (
              <Navigator headerMode="none">
                <Screen name="GetStarted" component={Auth} />
              </Navigator>
            );
          }

          return (
            <Tabs.Navigator tabBarOptions={{ labelPosition: "below-icon" }}>
              <Tabs.Screen
                name="Home"
                component={HomeGroup}
                options={() => ({
                  tabBarLabel: (props) => (
                    <TabBarLabel {...props} label={"Home"} />
                  ),
                  tabBarIcon: (props) => (
                    <TabBarIcon name="shopping-bag-outline" {...props} />
                  ),
                })}
              />
              <Tabs.Screen
                name="Profile"
                component={ProfileGroup}
                options={{
                  tabBarIcon: (props) => (
                    <TabBarIcon name={"person-outline"} {...props} />
                  ),
                  tabBarLabel: (props) => (
                    <TabBarLabel {...props} label={"Profile"} />
                  ),
                }}
              />
            </Tabs.Navigator>
          );
        })()}
      </NavigationContainer>
    </ApplicationProvider>
  );
}

export default App;
