import React from 'react'
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native'
import { StackNavigator } from 'react-navigation'
import Anuncio from './src/components/Anuncio'
import SplashScreen from './src/components/SplashScreen'
import Login from './src/components/Login'
import Cadastro from './src/components/Cadastro'
import Menu from './src/components/Menu'
import Icon from 'react-native-vector-icons/FontAwesome5'
import Anuncios from './src/components/Anuncios'
import CadastroAnuncio from './src/components/CadastroAnuncio'
import EsqueceuSenha from './src/components/EsqueceuSenha'
import Perfil from './src/components/Perfil'
import EditarPerfil from './src/components/EditarPerfil'

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#800000',
  },
  back: {
    color: '#E0E0E0',
    alignSelf: 'center',
    textAlign: 'center',
    paddingRight: 0,
    paddingLeft: 0
  },
})

const SimpleApp = StackNavigator({
  SplashScreen: {
    screen: SplashScreen,
    navigationOptions:{
      drawerLockMode: 'locked-closed',
      header: null,
      title: 'SplashScreen',
      headerTitleStyle: styles.back,
      headerTintColor: '#E0E0E0',
    }
  },
  Menu: {
    screen: Menu,
    navigationOptions: ({navigation}) => ({
      headerStyle: [styles.header,{paddingLeft: 15}],
      title: 'Menu',
      headerTitleStyle: styles.back,
      headerTintColor: '#E0E0E0',
      headerLeft:(
        <TouchableOpacity onPress={() => navigation.navigate("DrawerOpen")}>
          <Icon name="bars" size={30} color={"#E0E0E0"} />
        </TouchableOpacity>
      ),
    })
  },
  Anuncios: {
    screen: Anuncios,
    navigationOptions:{
      drawerLockMode: 'locked-closed',
      headerStyle: styles.header,
      headerTitleStyle: styles.back,
      headerTintColor: '#E0E0E0',
    }
  },
  CadastroAnuncio: {
    screen: CadastroAnuncio,
    navigationOptions:{
      drawerLockMode: 'locked-closed',
      headerStyle: styles.header,
      headerTitleStyle: styles.back,
      headerTintColor: '#E0E0E0',
    }
  },
  Cadastro: {
    screen: Cadastro,
    navigationOptions:{
      drawerLockMode: 'locked-closed',
      headerStyle: styles.header,
      title: 'Cadastro',
      headerTitleStyle: styles.back,
      headerTintColor: '#E0E0E0',
    }
  },
  EsqueceuSenha: {
    screen: EsqueceuSenha,
    navigationOptions:{
      drawerLockMode: 'locked-closed',
      headerStyle: styles.header,
      title: 'Recuperar senha',
      headerTitleStyle: styles.back,
      headerTintColor: '#E0E0E0',
    }
  },
  Login: {
    screen: Login,
    navigationOptions:{
      drawerLockMode: 'locked-closed',
      headerStyle: styles.header,
      title: 'Login',
      headerTitleStyle: styles.back,
      headerTintColor: '#E0E0E0',
    }
  },
  Anuncio: {
    screen: Anuncio,
    navigationOptions:{
      drawerLockMode: 'locked-closed',
      headerStyle: styles.header,
      title: 'Anúncio',
      headerTitleStyle: styles.back,
      headerTintColor: '#E0E0E0',
    }
  },
  Perfil: {
    screen: Perfil,
    navigationOptions:{
      drawerLockMode: 'locked-closed',
      headerStyle: styles.header,
      title: 'Perfil',
      headerTitleStyle: styles.back,
      headerTintColor: '#E0E0E0',
    }
  },
  EditarPerfil: {
    screen: EditarPerfil,
    navigationOptions:{
      drawerLockMode: 'locked-closed',
      headerStyle: styles.header,
      title: 'Editar Perfil',
      headerTitleStyle: styles.back,
      headerTintColor: '#E0E0E0',
    }
  },
});

export default SimpleApp;

