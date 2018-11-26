import React, { Component } from 'react'
import { Keyboard,Platform, Alert, Dimensions, TextInput, AppRegistry, RefreshControl, StyleSheet, View, Text, Button, ScrollView, ReactNative, AsyncStorage, TouchableHighlight, Image, TouchableOpacity, ActivityIndicator } from 'react-native'
import Icon from 'react-native-vector-icons/FontAwesome5'
import Spinner from 'react-native-loading-spinner-overlay';
import { NavigationActions } from 'react-navigation';
import ModalFilterPicker from 'react-native-modal-filter-picker'

export default class Anuncios extends Component {

    constructor(props){
    super(props);
        this.state = {
            mensagens: [],
            id: "",
            spinner: false,
            modalOpen: false,
            refreshing: false,
            texto: "",
        };  
    }

    componentWillMount(){
        this.spinner(true)
        var params = this.props.navigation.state.params
        this.setState({id: params.id, destinatario_id: params.destinatario_id, token: params.token}, () => this.carregarMensagens())
    }
    
    carregarMensagens(){
        fetch('http://donate-ifsp.ga/app/mensagens', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                id: this.state.id,
                token: this.state.token,
                destinatario_id: this.state.destinatario_id
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

    static navigationOptions = ({ navigation }) => ({
        title: navigation.state.params.nome,
    });

    formatadata(data){
        return data.substr(0, 10).split('-').reverse().join('/')+data.substr(10,6)
    }

    mensagens(dadosMensagens){
        var mensagens = [];
        var i = 1;
        if(dadosMensagens.length > 0){
            dadosMensagens.map((mensagem,key) => {(
            mensagens.push(
                <View key={i++} style={[styles.mensagemContainer, mensagem.remetente_id == this.state.id ? {alignSelf: "flex-end", backgroundColor: "#f2e5e5", marginLeft: "20%"} : {alignSelf: "flex-start", marginRight: "20%"}]}>
                    <View style={styles.mensagem}>
                        <Text style={styles.texto}>{mensagem.texto}</Text>
                    </View>
                </View>
            )
            )})
        }else{
            mensagens.push(
                <View style={{marginBottom:"5%"}}>
                <Text style={styles.texto}>Não há mensagens disponíveis</Text>
                </View>
            )
        }
        this.setState({mensagens: mensagens, dadosMensagens: dadosMensagens})
        setTimeout(() => this.scrollView.scrollToEnd({animated: true}),500)
    }

    enviarMensagem(){
        if(this.state.texto != ""){
            Keyboard.dismiss()
            fetch('http://donate-ifsp.ga/app/enviarMensagem', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: this.state.id,
                    token: this.state.token,
                    destinatario_id: this.state.destinatario_id,
                    texto: this.state.texto,
                }),
            }).then((response) => response.json())
            .then((responseJson) => {
                if(responseJson == true){
                    this.setState({mensagens: [... this.state.mensagens, 
                        <View style={[styles.mensagemContainer, {alignSelf: "flex-end", backgroundColor: "#f2e5e5", marginLeft: "20%"}]}>
                            <View style={styles.mensagem}>
                                <Text style={styles.texto}>{this.state.texto}</Text>
                            </View>
                        </View>
                    ]})
                }else{
                    Alert.alert(
                        'Sem conexão',
                        'Verifique sua conexão com a internet',
                    );
                }
                this.setState({texto: ""})
            })
            .catch((error) => {
                Alert.alert(
                    'Sem conexão',
                    'Verifique sua conexão com a internet',
                );
            })
        }
    }

    spinner(bol){
        this.setState({spinner: bol})
    }

    render() {
        return (
            <View style={styles.container} 
            onLayout={(event) => {this.setState({heightLayout: event.nativeEvent.layout.height})}}>
                <ScrollView ref={ref => this.scrollView = ref} 
                    contentContainerStyle={styles.scroll} 
                    style={{backgroundColor: "#ededed"}}
                >
                    <View style={styles.mensagens}>
                        {this.state.mensagens}
                    </View>
                </ScrollView>
                <View style={styles.inputContainer}>
                    <TextInput
                        ref={ref => this.input = ref}
                        editable = {true}
                        multiline = {true}
                        scrollEnabled={true}
                        style={styles.input}
                        placeholder={"Escreva uma mensagem aqui"}
                        underlineColorAndroid="transparent"
                        value={this.state.texto}
                        onChangeText={(val) => this.setState({texto: val})}
                        onFocus={() => setTimeout(() => this.scrollView.scrollToEnd({animated: true}),500)}
                    />
                    <TouchableHighlight underlayColor={"#993232"} style={styles.button} onPress={() => { this.enviarMensagem() }}>
                        <Icon size={35} color="white" name="arrow-right"/>
                    </TouchableHighlight>
                </View>
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
    mensagemContainer: {
        backgroundColor: "white",
        elevation: 10,
        margin: 15,
        borderRadius: 10,
    },
    mensagem: {
        padding: 5, 
        margin: 5,
    },
    input:{
        minHeight: 60,
        maxHeight: 120,
        backgroundColor: "white",
        fontSize: 16,
        lineHeight: 16,
        paddingLeft: 10,
        elevation:10,
        margin: 8,
        borderRadius: 3,
        width: width-85
    },
    button:{
        backgroundColor: "#800000",
        alignItems: "center",
        justifyContent: "center",
        elevation:10,
        padding: 8,
        height: 60,
        width: 60,
        borderRadius: 30,
        position: "absolute",
        bottom: 8,
        right: 8,
    },
})