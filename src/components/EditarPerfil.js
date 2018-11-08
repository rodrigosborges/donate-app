import React, { PureComponent } from 'react'
import { StatusBar,Alert, AppRegistry, StyleSheet, View , Picker, Text, TextInput, Button, Image,ScrollView, ReactNative, AsyncStorage, TouchableOpacity, Dimensions, ImageBackground } from 'react-native'
import Modal from 'react-native-modal'
import { TextField } from 'react-native-material-textfield'
import Icon from 'react-native-vector-icons/FontAwesome'
import ModalFilterPicker from 'react-native-modal-filter-picker'
import Spinner from 'react-native-loading-spinner-overlay';

export default class Cadastro extends PureComponent {
    constructor(props){
        super(props);
        this.state = {
            nome: "",
            email:  "",
            password: "",
            id: "",

            mensagem: [],
            cadastrado: false,
            titulo: "",
            erroForm: true,
            modalOpen: false,
            spinner: false,
        };
    }


    componentWillMount(){
        StatusBar.setHidden(false)
        this.setState({
            nome	   : this.props.navigation.state.params.nome,
            email      : this.props.navigation.state.params.email,
            id         : this.props.navigation.state.params.id,
        })
   }

    editar(){
        const navigation = this.props.navigation;
        fetch('http://192.168.1.101/donate/app/usuario/update', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nome: this.state.nome,
                email: this.state.email,
                password: this.state.password,
                id: this.state.id,
            }),
        }).then((response) => response.json())
        .then((responseJson) => {
            if(responseJson == true){
                Alert.alert(
                    'Sucesso',
                    'Perfil atualizado!',
                    [{text: 'Ok', onPress: () => navigation.goBack()}],
                    {cancelable: false}
                );
            }else{
                Alert.alert(
                    'Sem conexão',
                    'Verifique sua conexão com a internet',
                );
            }
            this.spinner(false)
        })
        .catch((error) => {
            Alert.alert(
                'Sem conexão',
                'Verifique sua conexão com a internet',
            );
            this.spinner(false)
        })
    }

    valida(ref, refErro, caso){
        var mensagemErro = ""
        var val = this.state[ref]
        switch(caso) {
            case 1:
                if(val.length == 0)
                    mensagemErro += "Digite um "+ ref +" válido"
                break
            case 5:
                if(val.length == 0 || !val.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/) && val.length != 0)
                    mensagemErro += "Digite um e-mail válido"
                break
            case 6:
                if(val.length != 0 && !val.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/))
                    mensagemErro += "Deve conter números, letras e caractere especial"
                break
        }
        this.setState({[refErro]: mensagemErro});

        if(mensagemErro != "" && this.state.erroForm == false)
            this.setState({erroForm: true})
        
    }

    resetarFormulario(){
        this.setState({erroForm: false})
        setTimeout(() => {this.validarFormulario()}, 1)
    }

    validarFormulario(){
        this.spinner(true)
        setTimeout(() => {
            this.valida("nome","nomeErro",1)
            this.valida("email","emailErro",5)
            this.valida("password","passwordErro",6)

            if(this.state.erroForm == true){
                this.refs._scrollView.scrollTo({x: 0, y: 0, animated: true})
                this.spinner(false)
            }else
                this.editar()
        }, 1)            
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

    header(){
        if(this.state.titulo == "SUCESSO"){
            return (<View style={[styles.successError, {borderWidth: 2, borderColor: '#B2FF59'}]}><View style={styles.icone}><Icon color="#B2FF59" size={35} name="check-circle"/></View><Text style={styles.mensagemAlerta}>SUCESSO</Text></View>)
        }else{
            return (<View style={[styles.successError, {borderWidth: 2, borderColor: '#F44336'}]}><View style={styles.icone}><Icon size={35} color="#F44336" name="times-circle"/></View><Text style={styles.mensagemAlerta}>ERRO</Text></View>)
        }
    }

    _renderButton = (text, onPress) => (
        <TouchableOpacity style={styles.modalButton} onPress={onPress}>
        <View style={styles.button}>
            <Text>{text}</Text>
        </View>
        </TouchableOpacity>
    );

    _renderModalContent = () => (
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
                {this._renderButton("Fechar", () => (this.state.cadastrado) ? (this.props.navigation.state.params.atualiza(), this.props.navigation.goBack()) : (this.setState({ isVisible: false })))}
            </View>
        </View>
    );
    
    onShow = (nome) => {
        this.setState({ [nome]: true, modalOpen: true });
    }
    
    onCancel = (nome) => {
        this.setState({
            [nome]: false,
            modalOpen: false,
        });
    }

    spinner(bol){
        this.setState({spinner: bol})
    }
    
    render() {
        const { navigate } = this.props.navigation
        return (
            <View style={styles.container}>
                {this.state.modalOpen == true && (<View style={styles.modalOpen}></View>)}
                <Modal
                    isVisible={this.state.isVisible}
                    animationIn="slideInLeft"
                    animationOut="slideOutRight"
                    >
                    {this._renderModalContent()}
                </Modal>
                <Spinner visible={this.state.spinner} textContent={"Carregando..."} textStyle={{color: '#FFF'}} />
                <ScrollView keyboardShouldPersistTaps="handled" ref="_scrollView" contentContainerStyle={styles.scroll}>
                    <View style={styles.formulario}>
                        <View style={styles.tituloContent}>
                            <Text style={styles.titulo}>Dados cadastrais</Text>
                        </View>
                        <View style={styles.inputs}>
                            <TextField label="Nome" error={this.state.nomeErro} value={this.state.nome} onChangeText={(nome) => this.setState({nome})} onEndEditing={(e) => this.valida("nome","nomeErro",1)}/>
                        </View>
                        <View style={styles.inputs}>
                            <TextField label="E-mail" error={this.state.emailErro} value={this.state.email} onChangeText={(email) => this.setState({email})} onEndEditing={(e) => this.valida("email","emailErro",1)}/>
                        </View>
                        <View style={styles.inputs}>
                            <TextField label="Senha" secureTextEntry={true} error={this.state.passwordErro} value={this.state.password} onChangeText={(password) => this.setState({password})} onEndEditing={(e) => this.valida("password","passwordErro",1)}/>
                        </View>
                    </View>
                    <View style={styles.cadastrar}>
                        <Button disabled={this.state.spinner} onPress={() => {this.spinner(true), setTimeout(() => this.resetarFormulario(),1)}} title="Atualizar" color="#800000" />
                    </View>
                </ScrollView>
            </View>
        );
    }
}



let width = Dimensions.get('window').width
let height = Dimensions.get('window').height
const styles = StyleSheet.create({
    modalOpen: {
        position: 'absolute',
        right: 0,
        left: 0,
        top: -64,
        bottom: 0,
        width: width,
        height: height,
        elevation: 5,
        backgroundColor: "rgba(0,0,0,0.7)"
    },
    picker:{
        textDecorationLine: 'underline'
    },
    mensagemAlerta: {
        fontSize: 22,
        fontWeight: "bold",
        textAlignVertical: 'center', 
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
    inputs: {
    },
    formulario:{
        margin: '5%',
        padding: "5%",
        borderColor: '#FFFFFF',
        borderWidth: 1,
        backgroundColor: 'white',
        elevation: 10,
    },
    titulo: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#800000',
    },
    tituloContent: {
        alignItems: 'center',
    },
    cadastrar: {
        width: width*0.9,
        marginLeft: width*0.05,
        marginTop: height*0.05,
        marginBottom: height*0.05,
    },
    container: {
        flex:1,
        backgroundColor: '#E0E0E0',
        overflow: 'hidden',
    },

    texto:{
        marginTop: 20,
        fontSize: 18,
        color: 'white',
        fontWeight: 'bold'
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
    icone: {
        position: 'absolute',
        left: "5%",
    },
    picker:{
        borderBottomWidth: 0.5,
        borderBottomColor: "#989898",
    },

})