import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {NavigationActions} from 'react-navigation'
import {ScrollView, Text, View,StyleSheet, TouchableOpacity, AsyncStorage, BackHandler, Alert} from 'react-native'
import { StackNavigator } from 'react-navigation'
import Icon from 'react-native-vector-icons/FontAwesome5'

class SideMenu extends Component {
    constructor(props){
        super(props);
        this.state = {
            nome: null,
            email: null,
            password: null,
            id: "",
            logado: null,
        };
    }

    componentDidMount(){
        AsyncStorage.multiGet(['email','password','nome', 'id']).then((values) => {
            this.setState({email: values[0][1],password: values[1][1], nome: JSON.parse(values[2][1]), id: JSON.parse(values[3][1])},() => {
                this.atualiza(this.state.email, this.state.password, this.state.nome, this.state.id)
            })
        })
    }   

    navigateToScreen = (route) => () => {
        const navigateAction = NavigationActions.navigate({
            routeName: route
        });
        this.props.navigation.dispatch(navigateAction);
    }

    atualiza(email, password, nome = ""){
        fetch('http://192.168.1.101/donate/app/checkarAuth', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                email: email,
                password: password,
            })
        }).then((response) => response.json())
        .then((responseJson) => {
            if(responseJson == true){
                this.setState({logado: true, nome: nome, email: email})
                AsyncStorage.setItem("logado",true)
            }else{
                this.setState({logado: false})
                AsyncStorage.setItem("logado",false)
            }
        })
        .catch((error) => {
            Alert.alert(
                'Sem conexão',
                'Verifique sua conexão com a internet',
                [{text: 'Ok', onPress: () => BackHandler.exitApp()}],
                { cancelable: false }
            );
        });
    }

    deslogar(){
        AsyncStorage.clear();
        this.setState({nome: null, email: null, password: null,logado: false})
        AsyncStorage.setItem("logado",false)
    }

  render () {
    return (
        <ScrollView style={styles.container}>
            <TouchableOpacity onPress={() => {
                if(this.state.logado == true)
                    this.props.navigation.navigate("Perfil",{atualiza: this.atualiza.bind(this)})
                else
                    this.props.navigation.navigate("Login",{atualiza: this.atualiza.bind(this)})
            }} style={styles.login}>
                <View style={{width: 50, paddingLeft: 10, paddingRight: 10}}>
                    <Icon name="user" color="white" size={30}/>
                </View>
                <View style={{flex:1}}>
                    <Text style={{color: "white", fontSize: 20}}>
                        {this.state.logado ? this.state.nome :"Clique aqui e acesse sua conta!"}
                    </Text>
                </View>
            </TouchableOpacity>
            {this.state.logado && (
                <View>
                    <View style={{borderBottomWidth: 1,borderBottomColor: "#bcbcbc"}}/>
                    <TouchableOpacity style={styles.options} onPress={() => {this.props.navigation.navigate("Anuncios",{title: "Meus anúncios", email: this.state.email})}}>
                        <Text style={styles.sectionHeadingStyle}>
                            Meus anúncios
                        </Text>         
                    </TouchableOpacity>
                    <View style={{borderBottomWidth: 1,borderBottomColor: "#bcbcbc"}}/>
                    <TouchableOpacity style={styles.options} onPress={() => {this.props.navigation.navigate("CadastroAnuncio",{email: this.state.email})}}>
                        <Text style={styles.sectionHeadingStyle}>
                            Anunciar
                        </Text>
                    </TouchableOpacity>
                    <View style={{borderBottomWidth: 1,borderBottomColor: "#bcbcbc"}}/>
                    <TouchableOpacity style={styles.options} onPress={() => {}}>
                        <Text style={styles.sectionHeadingStyle}>
                            Mensagens
                        </Text>
                    </TouchableOpacity>
                    <View style={{borderBottomWidth: 1,borderBottomColor: "#bcbcbc"}}/>
                    <TouchableOpacity style={styles.options} onPress={() => {
                        Alert.alert(
                            'Tem certeza que deseja sair?',
                            "",
                            [{text: 'Não', onPress: () => {}},
                            {text: 'Sim', onPress: () => this.deslogar()}],
                            { cancelable: false }
                        )
                    }}>
                        <Text style={styles.sectionHeadingStyle}>
                            Sair
                        </Text>
                    </TouchableOpacity>
                    <View style={{borderBottomWidth: 1,borderBottomColor: "#bcbcbc"}}/>
                </View>
            )}
        </ScrollView>
    );
  }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#d1d1d1",
    },
    navItemStyle: {
        padding: 10
    },
    sectionHeadingStyle: {
        color: "black",
        fontSize: 18,
    },
    footerContainer: {
        padding: 20,
    },
    login:{
        backgroundColor: '#800000',
        height: 100,
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "row"
    },
    options: {
        padding: 15,
    }
})
    
SideMenu.propTypes = {
  navigation: PropTypes.object
};

export default SideMenu;