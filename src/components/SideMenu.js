import PropTypes from 'prop-types'
import React, {Component} from 'react'
import {NavigationActions} from 'react-navigation'
import {ScrollView, Text, View,StyleSheet, TouchableOpacity} from 'react-native'
import { StackNavigator } from 'react-navigation'
import Icon from 'react-native-vector-icons/FontAwesome5'

class SideMenu extends Component {
  navigateToScreen = (route) => () => {
    const navigateAction = NavigationActions.navigate({
      routeName: route
    });
    this.props.navigation.dispatch(navigateAction);
  }

  render () {
    return (
      <View style={styles.container}>
        <ScrollView>
            <TouchableOpacity onPress={() => this.props.navigation.navigate("Login")} style={styles.login}>
                <View style={{width: 50, paddingLeft: 10, paddingRight: 10}}>
                    <Icon name="user" color="white" size={30}/>
                </View>
                <View style={{flex:1}}>
                    <Text style={{color: "white", fontSize: 20}}>
                        Clique aqui e acesse sua conta!
                    </Text>
                </View>
            </TouchableOpacity>
            <View style={{borderBottomWidth: 1,borderBottomColor: "#bcbcbc"}}/>
            <TouchableOpacity style={styles.options} onPress={() => {}}>
                <Text style={styles.sectionHeadingStyle}>
                    Minhas doações
                </Text>         
            </TouchableOpacity>
            <View style={{borderBottomWidth: 1,borderBottomColor: "#bcbcbc"}}/>
            <TouchableOpacity style={styles.options} onPress={() => {}}>
                <Text style={styles.sectionHeadingStyle}>
                    Doar
                </Text>
            </TouchableOpacity>
            <View style={{borderBottomWidth: 1,borderBottomColor: "#bcbcbc"}}/>
            <TouchableOpacity style={styles.options} onPress={() => {}}>
                <Text style={styles.sectionHeadingStyle}>
                    Mensagens
                </Text>
            </TouchableOpacity>
            <View style={{borderBottomWidth: 1,borderBottomColor: "#bcbcbc"}}/>
            <TouchableOpacity style={styles.options} onPress={() => {}}>
                <Text style={styles.sectionHeadingStyle}>
                    Minha Conta
                </Text>
            </TouchableOpacity>
            <View style={{borderBottomWidth: 1,borderBottomColor: "#bcbcbc"}}/>
        </ScrollView>
      </View>
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