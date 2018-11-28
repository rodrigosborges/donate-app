import React, { Component } from 'react';
import { Alert,Image, AppRegistry, StyleSheet, View, Text, TextInput, StatusBar, ScrollView, Button, ReactNative, AsyncStorage, TouchableOpacity, Dimensions, ImageBackground, TouchableHighlight } from 'react-native';
import logo from './../brasao.png'
import Icon from 'react-native-vector-icons/FontAwesome5'
import { NavigationActions } from 'react-navigation';
import Modal from 'react-native-modal'
import Spinner from 'react-native-loading-spinner-overlay';

export default class Menu extends Component {
    constructor(props){
        super(props);
        this.state = {
            nome : "",
            cpf: "",
            mensagem: [],
            isVisible: false,
            header: false,
            spinner: false,
            cadastrado: false,
            titulo: "",
        };      
    }

    componentWillMount(){
        setTimeout(() => StatusBar.setHidden(false), 1)
    }

    anuncios(id, nome){
        this.props.navigation.dispatch(NavigationActions.navigate({
            routeName: 'Anuncios', 
            key: '123',
            params:{
                "categoria_id": id,
                "title": "Anúncios - "+nome
            }
        }))       
    }

    static navigationOptions = ({ navigation, screenProps }) => ({
        headerRight: navigation.state.params ? navigation.state.params.headerRight : <View/>,
    });

    spinner(bol){
        this.setState({spinner: bol})
    }
      
    render() {
        const width = Dimensions.get('window').width
        const { dispatch } = this.props.navigation;
        return (
            <View style={styles.container} shouldRasterizeIOS={true} renderToHardwareTextureAndroid={true}>
                <StatusBar
                    backgroundColor="#660000"
                    barStyle="light-content"
                />
                <Spinner visible={this.state.spinner} textContent={"Carregando..."} textStyle={{color: '#FFF'}} />
                <View style={{height: "100%", width: "100%"}}>
                    <View style={styles.iconesSection}>
                        <View style={styles.containerIcones}>
                            <TouchableOpacity activeOpacity={0.3} onPress={() => this.anuncios(1,"Animal")} style={[styles.icones]}>
                                <Image style={styles.fundo} source={require('./../backgrounds/animal.jpg')}/>
                                <View style={styles.dark}>
                                    <Icon size={width*0.2} color={"#E0E0E0"} name="paw"/>
                                    <Text style={styles.texto}>Animal</Text>
                                </View>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.3} onPress={() => this.anuncios(2,"Doméstico") } style={[styles.icones]}>
                                <Image style={styles.fundo} source={require('./../backgrounds/domestico.jpg')}/>
                                    <View style={styles.dark}>
                                        <Icon size={width*0.2} color={"#E0E0E0"} name="home"/>
                                        <Text style={styles.texto}>Doméstico</Text>
                                    </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.containerIcones}>
                            <TouchableOpacity activeOpacity={0.3} onPress={() => this.anuncios(3,"Educação") } style={[styles.icones]}>
                                <Image style={styles.fundo} source={require('./../backgrounds/educacao.jpg')}/>
                                    <View style={styles.dark}>
                                        <Icon size={width*0.2} color={"#E0E0E0"} name="graduation-cap"/>
                                        <Text style={styles.texto}>Educação</Text>
                                    </View>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.3} onPress={() => this.anuncios(4,"Eletrônico") } style={[styles.icones]}>
                                <Image style={styles.fundo} source={require('./../backgrounds/eletronico.jpg')}/>
                                    <View style={styles.dark}>
                                        <Icon size={width*0.2} color={"#E0E0E0"} name="mobile-alt"/>
                                        <Text style={styles.texto}>Eletrônico</Text>
                                    </View>
                            </TouchableOpacity>

                        </View>
                        <View style={styles.containerIcones}>
                            <TouchableOpacity activeOpacity={0.3} onPress={() => this.anuncios(5,"Esporte e Lazer") } style={[styles.icones]}>
                                <Image style={styles.fundo} source={require('./../backgrounds/esporte.jpg')}/>
                                    <View style={styles.dark}>
                                        <Icon size={width*0.2} color={"#E0E0E0"} name="bicycle"/>
                                        <Text style={styles.texto}>Esporte e Lazer</Text>
                                    </View>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.3} onPress={() => this.anuncios(6,"Infantil") } style={[styles.icones]}>
                                <Image style={styles.fundo} source={require('./../backgrounds/infantil.jpg')}/>
                                    <View style={styles.dark}>
                                        <Icon size={width*0.2} color={"#E0E0E0"} name="child"/>
                                        <Text style={styles.texto}>Infantil</Text>
                                    </View>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.containerIcones}>
                            <TouchableOpacity activeOpacity={0.3} onPress={() => this.anuncios(7,"Música") } style={[styles.icones]}>
                                <Image style={styles.fundo} source={require('./../backgrounds/musica.jpg')}/>
                                    <View style={styles.dark}>
                                        <Icon size={width*0.2} color={"#E0E0E0"} name="music"/>
                                        <Text style={styles.texto}>Música</Text>
                                    </View>
                            </TouchableOpacity>
                            <TouchableOpacity activeOpacity={0.3} onPress={() => this.anuncios(8,"Vestuário") } style={[styles.icones]}>
                                <Image style={styles.fundo} source={require('./../backgrounds/vestuario.jpg')}/>
                                    <View style={styles.dark}>
                                        <Icon size={width*0.2} color={"#E0E0E0"} name="tshirt"/>
                                        <Text style={styles.texto}>Vestuário</Text>
                                    </View>
                            </TouchableOpacity>
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
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center'
    },
    capture: {
        flex: 0,
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20
    },
    divisao:{
        height: height*0.08,
        width:2,
        backgroundColor: '#d9d9d9',
    },
    mensagem:{
        height: "65%",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",      
    },
    perfilSection:{
        height: "20%",
        backgroundColor: "#2C3E50",
        borderBottomWidth: 1,
        borderColor:'white',
    },
    iconesSection: {
        height: "100%",
    },
    containerIcones:{
        flex: 1,
        flexDirection: 'row',
    },
    icones: {
        width: "50%",
    },
    container: {
        flex:1,
        backgroundColor: 'white',
        overflow: 'hidden',
    },
    texto:{
        fontSize: 18,
        color: '#E0E0E0',
        fontWeight: 'bold'
    },    
    textoHeader:{
        fontSize: 21,
        color: '#E0E0E0',
        fontWeight: 'bold'
    },    
    dark:{
        position: "absolute",
        width: "100%",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",  
        backgroundColor: 'rgba(0,0,0,.1)',
    },
    fundo: {
        width: null,
        height: null,
        flex:1 ,
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
        backgroundColor: "#2C3E50",
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
        backgroundColor: "white"
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