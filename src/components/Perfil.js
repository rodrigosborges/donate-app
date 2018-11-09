import React, { Component } from 'react';
import { StatusBar,Alert,AppRegistry, StyleSheet,View , Text, TextInput, Button, Image,ScrollView, ActivityIndicator ,ReactNative, AsyncStorage, TouchableOpacity, Dimensions, ImageBackground, TouchableHighlight } from 'react-native';
import logo from './../brasao.png'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { NavigationActions, withNavigationFocus } from 'react-navigation';
import Modal from 'react-native-modal'
import Spinner from 'react-native-loading-spinner-overlay';

export default class Menu extends Component {
    constructor(props){
        super(props);
        this.state = {
            nome : "",
            email: "",
            mensagem: [],
            isVisible: false,
            header: false,
            spinner: false,
            cadastrado: false,
            titulo: "",
            cadastro: null,
            anunciados: null,
            doados: null,
            avaliacao: null,
        };      

    }

    componentDidMount() {
        StatusBar.setHidden(false)   

        AsyncStorage.multiGet(['nome', 'email', 'id']).then((values) => {
            this.setState({nome: JSON.parse(values[0][1]), email: values[1][1], id: values[2][1]})
            this.carregarDados(values[2][1])
        })
        setTimeout(() => {this.carregarHeader()}, 1)
    }

    carregarHeader(){

        this.props.navigation.setParams({ 
            headerRight: (
                <TouchableOpacity onPress={() => { this.editar() }}>
                    <Icon style={{marginRight: 15}} name="edit" size={25} color="white" />
                </TouchableOpacity>
            )
        })
    }

        
    static navigationOptions = ({ navigation, screenProps }) => ({
        headerRight: navigation.state.params ? navigation.state.params.headerRight : <View/>,
    });

    carregarDados(id){
        fetch('http://192.168.11.51/donate/app/dadosUsuario/'+id, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
        }).then((response) => response.json())
        .then((responseJson) => {
            this.setState({
                cadastro: responseJson.cadastro,
                anunciados: responseJson.anunciados,
                doados: responseJson.doados,
                avaliacao: responseJson.avaliacao,
            })
        })
        .catch((error) => {
            this.setState({cadastrado: false, titulo: "ERRO", mensagem: ["Erro de conexão"], isVisible: true})
            this.props.navigation.goBack()
        });
    }

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
        this.props.navigation.navigate({
            routeName: 'EditarPerfil', 
            key: 'EditarPerfil',
            params: {
                "nome" : this.state.nome,
                "email" : this.state.email,
                "id" : this.state.id,
            },
        })
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
        const carregando = <ActivityIndicator size="small" color="#800000"/>
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
                <View style={{backgroundColor: "#E0E0E0", height: "100%", width: "100%"}}>
                    <View style={styles.perfilSection}>
                        <View style={styles.mensagem}>
                            <Text style={[styles.textoHeader, {color: "white", textAlign: 'center'}]}>{this.state.nome}</Text> 
                        </View>
                    </View>
                    <View style={styles.imagemContainer}>
                        <Icon color="white" size={45} name="user"/>
                    </View>
                    <View style={styles.containerInformacoes}>
                        <View style={{flexDirection: 'row', height: "50%"}}>
                            <View style={styles.blocoInformacoes}>
                                <Text style={styles.textoHeader}>Cadastro</Text>
                                {this.state.cadastro == null ? carregando : (<Text style={styles.textoHeader}>{this.state.cadastro}</Text>)}
                            </View>
                            <View style={styles.blocoInformacoes}>
                                <Text style={styles.textoHeader}>Anunciados</Text>
                                {this.state.anunciados == null ? carregando : (<Text style={styles.textoHeader}>{this.state.anunciados}</Text>)}
                            </View>
                        </View>
                        <View style={{flexDirection: 'row', height: "50%"}}>
                            <View style={styles.blocoInformacoes}>
                                <Text style={styles.textoHeader}>Doados</Text>
                                {this.state.doados == null ? carregando : (<Text style={styles.textoHeader}>{this.state.doados}</Text>)}
                            </View>
                            <View style={styles.blocoInformacoes}>
                                <Text style={styles.textoHeader}>Avaliação</Text>
                                {this.state.avaliacao == null ? carregando : (<Text style={styles.textoHeader}>{this.state.avaliacao}</Text>)}
                            </View>
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
    blocoInformacoes:{
        width: "50%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
    },
    informacoes: {
        fontSize: 18,
        color: '#800000',
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
        height: "25%",
        backgroundColor: "#660000",
        borderBottomWidth: 1,
        borderColor:'white',
    },
    containerInformacoes:{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 2,
        borderColor:'white',
        height: "100%",
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
        color: '#800000',
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
        left: "39%",
        top: "17%",
        justifyContent: "center",
        alignItems: "center",   
        width: width*0.23,
        height: width*0.23,
        borderRadius: width*0.23,
        backgroundColor: "#800000",
        borderWidth: 2,
        borderColor: "white",
        elevation: 1,
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