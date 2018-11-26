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
        AsyncStorage.multiGet(["id",'token']).then((val) => {
            this.setState({id: val[0][1],token: val[1][1]},() => this.carregarConversas())
        })
    }

    _onRefresh = () => {
        this.setState({refreshing: true});
        this.carregarConversas()
    }
    
    carregarConversas(){
        fetch('http://donate-ifsp.ga/app/conversas', {
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
            this.conversas(responseJson)
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

    verConversa(destinatario_id, nome){
        this.props.navigation.dispatch(NavigationActions.navigate({
            routeName: 'Chat', 
            key: 'chat',
            params:{
                destinatario_id: destinatario_id, 
                id: this.state.id, 
                token: this.state.token, 
                nome: nome
            }
        }));
    }

    conversas(dadosConversas){
        var conversas = [];
        var i = 1;
        if(dadosConversas.length > 0){
            dadosConversas.map((conversa,key) => {(
            conversas.push(
                <View style={[styles.manifestContainer]}>
                    <TouchableHighlight underlayColor="#ffffff" key={i++} onPress={() => {this.verConversa(conversa.outra_pessoa, conversa.nome)}} style={{width: "100%", height: "100%"}}>
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
        this.setState({conversas: conversas, refreshing: false})
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
                    style={{backgroundColor: "#ededed"}}
                    refreshControl={
                        <RefreshControl
                            refreshing={this.state.refreshing}
                            onRefresh={this._onRefresh}
                        />
                    }
                >
                    <View style={styles.conversas}>
                        {this.state.conversas}
                    </View>
                </ScrollView>
            </View>
        );
    }
}

let width = Dimensions.get('window').width
let height = Dimensions.get('window').height
const styles = StyleSheet.create({
    titulo: {
        fontSize: 20,
        fontWeight: 'bold',
        color: 'white',
    },
    container: {
        flex:1,
        backgroundColor: '#ededed',
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
        backgroundColor: '#ededed',
    },
})