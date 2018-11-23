import React, { Component } from 'react'
import { Alert, Dimensions, AppRegistry, RefreshControl, StyleSheet, View, Text, Button, ScrollView, ReactNative, AsyncStorage, TouchableHighlight, Image, TouchableOpacity, ActivityIndicator } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import Spinner from 'react-native-loading-spinner-overlay';
import { NavigationActions } from 'react-navigation';
import ModalFilterPicker from 'react-native-modal-filter-picker'

export default class Anuncios extends Component {

    constructor(props){
    super(props);
        this.state = {
            conversas: [],
            id: "",
            spinner: false,
            modalOpen: false,
            refreshing: false,
        };  
    }

    componentWillMount(){
        this.spinner(true)
        var params = this.props.navigation.state.params
        this.setState({id: params.id, destinatario_id: params.destinatario_id, token: params.token})
    }

    _onRefresh = () => {
        this.setState({refreshing: true});
        this.carregarmensagens()
    }
    
    carregarmensagens(){
        fetch('http://donate-ifsp.ga/app/mensagens', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: this.state.id,
                token: this.state.token,
            }),
        }).then((response) => response.json())
        .then((responseJson) => {
            this.mensagens(responseJson)
            this.spinner(false)
        })
        .catch((error) => {
            Alert.alert("Sem conexão", 'Verifique sua conexão com a internet')
            this.props.navigation.goBack()
            this.setState({refreshing: false})
        });
    }

    formatadata(data){
        return data.substr(0, 10).split('-').reverse().join('/')+data.substr(10,6)
    }

    conversas(dadosConversas){
        var conversas = [];
        var i = 1;
        if(dadosConversas.length > 0){
            dadosConversas.map((conversa,key) => {(
            conversas.push(
                <View style={[styles.manifestContainer]}>
                    <TouchableHighlight underlayColor="#ffffff" key={i++} onPress={() => {this.verConversa(key)}} style={{width: "100%", height: "100%"}}>
                        <View style={{flex:1, padding: 10}}>
                            <View style={{flex:1, flexDirection: 'row'}}><View><Icon size={28} color="black" name="user"/></View><View style={{flex:1}}><Text style={[styles.texto, {fontSize: 25, fontWeight:"bold"}]}> {conversa.nome}</Text></View></View>
                            <View style={{flex:1, flexDirection: 'row'}}><View><Icon size={18} color="black" name="comment"/></View><View style={{flex:1}}><Text numberOfLines={1} style={styles.texto}> {conversa.texto} </Text></View></View>
                            <View style={{position: 'absolute',bottom: 10, left: 10,}}><Text style={styles.textoSecundario}><Icon size={14} name="clock"/> {this.formatadata(conversa.ultima_msg)} </Text></View>
                        </View>
                    </TouchableHighlight>
                </View>
            )
            )})
        }else{
            conversas.push(
                <View style={{marginBottom:"5%"}}>
                <Text style={styles.texto}>Não há conversas disponíveis </Text>
                </View>
            )
        }
        this.setState({conversas: conversas, dadosConversas: dadosConversas, refreshing: false})
    }

    spinner(bol){
        this.setState({spinner: bol})
    }

    render() {
        return (
            <View style={styles.container} 
            onLayout={(event) => {this.setState({heightLayout: event.nativeEvent.layout.height})}}>
                <ScrollView ref='_scrollView' 
                    contentContainerStyle={styles.scroll} 
                    style={{backgroundColor: "white"}}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh}
                        />
                    }
                >
                    <View style={styles.conversas}>
                        
                    </View>
                    <ActivityIndicator size="large" color="#a64c4c" animating={this.state.spinner} />
                </ScrollView>
            </View>
        );
    }
}

let width = Dimensions.get('window').width
let height = Dimensions.get('window').height
const styles = StyleSheet.create({
    buttonContainer:{
        position: 'absolute', 
        bottom: height*0.03, 
        right: -width*0.04, 
        elevation: 20,
        borderRadius: 5,
    },
    button:{
        width: width*0.22,
        height: height*0.06,
        backgroundColor: "#2C3E50",
        alignItems: 'center',
        justifyContent: 'center',
        right:0,
        elevation: 2,
        borderRadius: 5,
    },
    containerInformacoes:{
        width: "56%",
        marginLeft: "2%",
    },
    containerTitulo:{
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: "#2c3E50",
        elevation: 3,
        width: "100%",
        height: "22%",
    },
    titulo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    container: {
        flex:1,
        backgroundColor: '#E0E0E0',
        overflow: 'hidden',
    },
    texto:{
        fontSize: 17,
        color: 'black',
    },
    textoSecundario:{
        fontSize: 14,
        color: 'black',
    },
    informacoes:{
        fontSize: 18,
        color: 'black',
    },
    manifestContainer: {
        height: height*0.25,
        width: width*0.95,
        backgroundColor: "white",
        elevation:8,
        marginBottom: 20
    },
    conversas: {
        paddingTop: 20,
        alignItems: 'center',
        backgroundColor: 'white',
    },
    imagem: {
        width: "40%",
        height: "100%",
    },
    filtros:{
        position: "relative",
        height:60,
        width: "100%",
        top: 0,
        elevation: 3,
        backgroundColor: "white",
        alignItems: 'center',
        justifyContent: 'center',
    },
    filtrosOptions:{
        flex:1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    botaoEditar:{
        position: "absolute",
        top: 0,
        left:0,
        height: "32%",
        width: "18%",
        backgroundColor: "#FFFF66",
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 5,
    },
})