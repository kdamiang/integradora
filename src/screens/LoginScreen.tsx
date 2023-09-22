import { useState, useEffect } from 'react'
import { StyleSheet, Text, View, TouchableOpacity, Button, Image, ImageBackground } from "react-native";
import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserIfo } from "../types/loginTypes";
import {CLIENT_ID} from '@env'

WebBrowser.maybeCompleteAuthSession();

export const LoginScreen = () => {
  const [token, setToken] = useState("");
  const [userInfo, setUserInfo] = useState<UserIfo | null>(null);


  const [request, response, promptAsync] = Google.useAuthRequest({
    androidClientId: CLIENT_ID,
    iosClientId: "",
    webClientId: "",
  });

  useEffect(() => {
    handleEffect();
  }, [response, token]);

  async function handleEffect() {
    const user = await getLocalUser();
    if (!user) {
      if (response?.type === "success" && response.authentication) {
        // setToken(response.authentication.accessToken);
        getUserInfo(response.authentication.accessToken);
      }
    } else {
      setUserInfo(user);
      console.log("loaded locally");
    }
  }

  const getLocalUser = async () => {
    const data = await AsyncStorage.getItem("@user");
    if (!data) return null;
    return JSON.parse(data);
  };

  const getUserInfo = async (token: string) => {
    if (!token) return;
    try {
      const response = await fetch(
        "https://www.googleapis.com/userinfo/v2/me",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const user = await response.json();
      await AsyncStorage.setItem("@user", JSON.stringify(user));
      setUserInfo(user);
    } catch (error) {
      // error handler here
    }
  };

  return (
    <View style={styles.container}>
      {!userInfo ? (
        <ImageBackground style={styles.backgroundImage} resizeMode='cover' source={require('../../assets/images/login/background.png')}>
          <Image style={styles.imagePhone} source={require('../../assets/images/login/phone.png')}></Image>
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.button1}>
              <Text style={styles.text1}>Iniciar sesion</Text>
            </TouchableOpacity>
              
            <TouchableOpacity style={styles.button2} onPress={() => promptAsync()}>
              <Image style={styles.imageGoogle} source={require('../../assets/images/login/googleIcon.png')}></Image>
              <Text style={styles.text2}>Iniciar con Google</Text>
            </TouchableOpacity>
          </View>
          <View style={{ marginTop: "10%" }}>
            <Text style={{ color: "#FF6680" }}>¿No tienes un cuenta? <Text style={{ color: "#B34766" }}>Crea una</Text></Text>
          </View>
        </ImageBackground>

      ) : (
        <View>
          {userInfo?.picture && (
            <Image source={{ uri: userInfo?.picture }} />
          )}
          <Text >Email: {userInfo.email}</Text>
          <Text>
            Verified: {userInfo.verified_email ? "yes" : "no"}
          </Text>
          <Text >Name: {userInfo.name}</Text>
          <Button
            title="remove local storage "
            onPress={async () => await AsyncStorage.removeItem("@user")}
          />
        </View>
      )
      }
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 1,

    alignItems: "center",
    justifyContent: "center"
  },
  backgroundImage: {
    width: "100%",
    flex: 1,
    alignItems: "center",

  },
  imagePhone: {
    marginTop: "40%"
  },
  buttonContainer: {
    width: '80%',
    marginTop: "40%"
  },
  button1: {
    backgroundColor: "#FF6680",
    paddingHorizontal: 50,
    borderRadius: 20,
    paddingVertical: 10,
    marginTop: "10%",
    elevation: 5,
    alignItems: 'center'
  },
  text1: {
    color: "#fff",
    fontSize: 20
  },
  button2: {
    flexDirection: 'row',
    gap: 20,
    backgroundColor: "#fff",
    paddingHorizontal: 50,
    borderRadius: 20,
    paddingVertical: 10,
    marginTop: "10%",
    elevation: 5,
    alignItems: "center"
  },
  text2: {
    color: "#B34766",
    fontSize: 20
  },
  imageGoogle: {
    width: 25,
    height: 25
  },
})