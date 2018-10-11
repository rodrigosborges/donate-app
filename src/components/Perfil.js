import React, { Component } from 'react';
import { StatusBar,Alert,AppRegistry, StyleSheet,View , Text, TextInput, Button, Image,ScrollView, ReactNative, AsyncStorage, TouchableOpacity, Dimensions, ImageBackground, TouchableHighlight } from 'react-native';
import logo from './../brasao.png'
import Icon from 'react-native-vector-icons/FontAwesome'
import Icon2 from 'react-native-vector-icons/FontAwesome5'
import { NavigationActions, withNavigationFocus } from 'react-navigation';
import Modal from 'react-native-modal'
import Spinner from 'react-native-loading-spinner-overlay';

export default class Menu extends Component {
    constructor(props){
        super(props);
        this.state = {
            nome : "",
            cpf: "",
            email: "",
            telefone: "",
            endereco: "",
            mensagem: [],
            isVisible: false,
            header: false,
            spinner: false,
            cadastrado: false,
            titulo: "",
        };      

    }

    componentDidMount() {
        StatusBar.setHidden(false)   

        AsyncStorage.multiGet(['cpf','token']).then((values) => {
            this.setState({cpf: values[0][1]})
            this.setState({token: values[1][1]})
        })
        this.setState({
            nome: this.props.navigation.state.params.nome,
            email: this.props.navigation.state.params.email, 
            telefone: this.props.navigation.state.params.telefone, 
            endereco: this.props.navigation.state.params.endereco
        })
        var that = this
        setTimeout(function(){that.carregarHeader()}, 1)
    }

    componentWillMount(){
        this.props.navigation.state.params.spinner(false)
        setTimeout(() => this.props.navigation.state.params.spinner(false),3000)
    }

    carregarHeader(){

        this.props.navigation.setParams({ 
            headerRight: (
                <TouchableOpacity onPress={() => { this.editar() }}>
                    <Icon2 style={{marginRight: 15}} name="edit" size={25} color="white" />
                </TouchableOpacity>
            )
        })
    }

        
    static navigationOptions = ({ navigation, screenProps }) => ({
        headerRight: navigation.state.params ? navigation.state.params.headerRight : <View/>,
    });


    mensagens() {
        return this.state.mensagem.map(function(mensagem, i){
            return(
                <View key={i}>
                <Text style={{fontSize: 16, marginBottom: 3}}>{mensagem}</Text>
                </View>
            );
        });
    }

    editar(){
        fetch('http://192.168.11.51/ouvidoria/app/perfil?cpf='+this.state.cpf+'&token='+this.state.token, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        }).then((response) => response.json())
        .then((responseJson) => {
            this.spinner(true)
            setTimeout(() => {this.props.navigation.dispatch(
                NavigationActions.navigate({
                    routeName: 'EditarPerfil', 
                    key: 'EditarPerfil',
                    params: {
                        "nome"	            : responseJson.nome,
                        "telefonePrincipal" : responseJson.telefonePrincipal, 
                        "telefoneSecundario": responseJson.telefoneSecundario, 
                        "cep"               : responseJson.cep,
                        "estado" 	        : responseJson.estado,
                        "cidade"	        : responseJson.cidade,
                        "bairro" 	        : responseJson.bairro,
                        "logradouro"        : responseJson.logradouro,
                        "numero" 	        : responseJson.numero,
                        "referencia"        : responseJson.referencia,
                        atualiza            : this.atualiza.bind(this),
                        spinner             : this.spinner.bind(this)
                    },
                })
            ),1})
        })
        .catch((error) => {
            this.setState({cadastrado: false, titulo: "ERRO", mensagem: ["Erro de conexão"], isVisible: true})
            this.spinner(false)
        });
    }

    atualiza(){
        fetch('http://192.168.11.51/ouvidoria/app/perfil?cpf='+this.state.cpf+'&token='+this.state.token, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        }).then((response) => response.json())
        .then((responseJson) => {
            this.setState({
                nome: responseJson.nome,
                email: responseJson.email, 
                telefone: responseJson.telefone, 
                endereco: responseJson.endereco
            })
            AsyncStorage.setItem('nome',responseJson.nome)
        })
        .catch((error) => {
            this.setState({cadastrado: false, titulo: "ERRO", mensagem: ["Erro de conexão"], isVisible: true})
        });        
    }

    header(){
        if(this.state.titulo == "SUCESSO"){
            return (<View style={[styles.successError, {borderWidth: 2, borderColor: '#B2FF59'}]}><View style={styles.icone}><Icon color="#B2FF59" size={35} name="check-circle"/></View><Text style={styles.mensagemAlerta}>SUCESSO</Text></View>)
        }else if(this.state.titulo == "SAIR"){
            return (<View style={[styles.successError]}><View style={styles.icone}></View><Text style={styles.mensagemAlerta}>SAIR</Text></View>)            
        }else{
            return (<View style={[styles.successError, {borderWidth: 2, borderColor: '#F44336'}]}><View style={styles.icone}><Icon size={35} color="#F44336" name="times-circle"/></View><Text style={styles.mensagemAlerta}>ERRO</Text></View>)
        }
    }
    

    _renderButton(text, onPress){
        return (
            <TouchableOpacity style={styles.modalButton} onPress={onPress}>
                <View style={styles.button}>
                    <Text>{text}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    _renderModalContent = (goBack) => (
        <View style={styles.modalContent}>
            <View style={styles.header}>
                {this.header()}
            </View>
            <ScrollView style={styles.modalMensagem} contentContainerStyle={{flexGrow: 1, justifyContent : 'center'}}>
                <View style={{alignItems: 'center'}}>
                    {this.mensagens()}
                </View>
            </ScrollView>
            <View>
                {this._renderButton("Fechar", () => (this.state.cadastrado) ? (goBack()) : (this.setState({ isVisible: false })))}
            </View>
        </View>
    );

    spinner(bol){
        this.setState({spinner: bol})    
    }

    render() {
        const width = Dimensions.get('window').width
        const { dispatch } = this.props.navigation;
        return (
            <View style={styles.container} shouldRasterizeIOS={true} renderToHardwareTextureAndroid={true}>
                <Modal
                    isVisible={this.state.isVisible}
                    animationIn="slideInLeft"
                    animationOut="slideOutRight"
                    >
                    {this._renderModalContent()}
                </Modal>
                <Spinner visible={this.state.spinner} textContent={"Carregando..."} textStyle={{color: '#FFF'}} />
                <View style={{backgroundColor: "rgba(44, 62, 80, 1)", height: "100%", width: "100%"}}>
                    <View style={styles.perfilSection}>
                        <View style={styles.mensagem}>
                            <Text style={styles.textoHeader}>{this.state.nome}</Text> 
                        </View>
                    </View>
                    <View style={styles.imagemContainer}>
                        <Image source={logo} style={styles.logo}/>
                    </View>
                    <View style={styles.containerInformacoes}>
                        <View style={{marginBottom:"5%"}}>
                            <Text style={styles.textoHeader}>CPF</Text>
                            <Text style={styles.informacoes}>{this.state.cpf}</Text>
                        </View>
                        <View style={{marginBottom:"5%"}}>
                            <Text style={styles.textoHeader}>E-mail</Text>
                            <Text style={styles.informacoes}>{this.state.email}</Text>
                        </View>
                        <View style={{marginBottom:"5%"}}>
                            <Text style={styles.textoHeader}>Telefone</Text>
                            <Text style={styles.informacoes}>{this.state.telefone}</Text>
                        </View>
                        <View style={{marginBottom:"5%"}}>
                            <Text style={styles.textoHeader}>Endereço</Text>
                            <Text style={styles.informacoes}>{this.state.endereco}</Text>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}

var height = Dimensions.get('window').height;
var width = Dimensions.get('window').width;

const styles = StyleSheet.create({
    informacoes: {
        fontSize: 18,
        color: '#E0E0E0',
    },
    divisao:{
        height: height*0.08,
        width:2,
        backgroundColor: '#d9d9d9',
    },
    mensagem:{
        height: "80%",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",      
    },
    perfilSection:{
        height: "20%",
        backgroundColor: "rgba(44, 62, 80, 1)",
        borderBottomWidth: 1,
        borderColor:'white',
    },
    containerInformacoes:{
        flex: 1,
        justifyContent: "center",
        marginTop: "18%",
        width: "90%",
        marginLeft: "5%",
    },
    icones: {
        width: "50%",
        justifyContent: "center",
        alignItems: "center",
    },
    container: {
        flex:1,
        backgroundColor: '#99bbff',
        overflow: 'hidden',
    },
    texto:{
        fontSize: 18,
        color: 'rgba(44, 62, 80, 1)',
        fontWeight: 'bold'
    },    
    textoHeader:{
        fontSize: 21,
        color: '#E0E0E0',
        fontWeight: 'bold'
    },    
    fundo: {
        width: null,
        height: null,
        flex:1 ,
        backgroundColor: "rgba(44, 62, 80, 1)"
    },
    logo:{
        width: "60%",
        height: "70%",
    },
    imagemContainer:{
        position: 'absolute',
        left: "38%",
        top: "13%",
        justifyContent: "center",
        alignItems: "center",   
        width: width*0.23,
        height: width*0.23,
        borderRadius: width*0.23,
        backgroundColor: "rgba(44, 62, 80, 1)",
        borderWidth: 2,
        borderColor: "white",
    },
    modalContent: {
        backgroundColor: "white",
        justifyContent: "center",
        borderRadius: 15,
        borderColor: "grey",
        width: width*0.8,
        marginLeft: width*0.05,

        height: height*0.38,
    },
    modalMensagem: {
        height: height*0.22,
        width: width*0.8,
    },
    modalButton: {
        backgroundColor:"#E0E0E0",
        justifyContent: "center",
        alignItems: "center",
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15,    
        borderColor: "rgba(0, 0, 0, 0.1)",
        height: height*0.08,
    },
    modalSair: {
        backgroundColor:"#E0E0E0",
        justifyContent: "center",
        alignItems: "center",  
        borderColor: "rgba(0, 0, 0, 0.1)",
        height: height*0.08,
        flex: 1,
    },
    icone: {
        position: 'absolute',
        left: "5%",
    },
    header:{
        height: height*0.08,
        borderBottomWidth: 1,
        borderColor: "#E0E0E0",
    },
    successError:{
        height: "100%",
        justifyContent: "center",
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        alignItems: 'center',    
    },
    mensagemAlerta: {
        fontSize: 22,
        fontWeight: "bold",
        textAlignVertical: 'center', 
    },
})