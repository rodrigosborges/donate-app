import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { StackNavigator } from 'react-navigation'
import Consulta from './src/components/Consulta'
import Manifestacao from './src/components/Manifestacao'
import SplashScreen from './src/components/SplashScreen'
import Home from './src/components/Home'
import Login from './src/components/Login'
import Cadastro from './src/components/Cadastro'
import Menu from './src/components/Menu'
import Icon from 'react-native-vector-icons/Feather'
import Cadastradas from './src/components/Cadastradas'
import CadastroManifestacao from './src/components/CadastroManifestacao'
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
  Cadastradas: {
    screen: Cadastradas,
    navigationOptions:{
      headerStyle: styles.header,
      title: 'Minhas manifestações',
      headerTitleStyle: styles.back,
      headerTintColor: '#E0E0E0',
    }
  },
  Menu: {
    screen: Menu,
    navigationOptions:{
      headerStyle: styles.header,
      title: 'Categorias',
      headerTitleStyle: styles.back,
      headerTintColor: '#E0E0E0',
    }
  },
  SplashScreen: {
    screen: SplashScreen,
    navigationOptions:{
      header: null,
      title: 'SplashScreen',
      headerTitleStyle: styles.back,
      headerTintColor: '#E0E0E0',
    }
  },
  CadastroManifestacao: {
    screen: CadastroManifestacao,
    navigationOptions:{
      headerStyle: styles.header,
      title: 'Cadastro',
      headerTitleStyle: styles.back,
      headerTintColor: '#E0E0E0',
    }
  },
  Home: {
    screen: Home,
    navigationOptions:{
      header: null,
      title: 'Home',
      headerTitleStyle: styles.back,
      headerTintColor: '#E0E0E0',
    }
  },
  Cadastro: {
    screen: Cadastro,
    navigationOptions:{
      headerStyle: styles.header,
      title: 'Cadastro',
      headerTitleStyle: styles.back,
      headerTintColor: '#E0E0E0',
    }
  },
  EsqueceuSenha: {
    screen: EsqueceuSenha,
    navigationOptions:{
      headerStyle: styles.header,
      title: 'Recuperar senha',
      headerTitleStyle: styles.back,
      headerTintColor: '#E0E0E0',
    }
  },
  Consulta: {
    screen: Consulta,
    navigationOptions:{
      headerStyle: styles.header,
      title: 'Consulta',
      headerTitleStyle: styles.back,
      headerTintColor: '#E0E0E0',
    }
  },
  Login: {
    screen: Login,
    navigationOptions:{
      header: null,
      title: 'Login',
      headerTitleStyle: styles.back,
      headerTintColor: '#E0E0E0',
    }
  },
  Manifestacao: {
    screen: Manifestacao,
    navigationOptions:{
      headerStyle: styles.header,
      title: 'Manifestação',
      headerTitleStyle: styles.back,
      headerTintColor: '#E0E0E0',
    }
  },
  Perfil: {
    screen: Perfil,
    navigationOptions:{
      headerStyle: styles.header,
      title: 'Perfil',
      headerTitleStyle: styles.back,
      headerTintColor: '#E0E0E0',
    }
  },
  EditarPerfil: {
    screen: EditarPerfil,
    navigationOptions:{
      headerStyle: styles.header,
      title: 'Editar Perfil',
      headerTitleStyle: styles.back,
      headerTintColor: '#E0E0E0',
    }
  },
});


export default class App extends React.Component {
  render() {
    return <SimpleApp />;
  }
}


