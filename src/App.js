import React from 'react';
import './App.css';
import Signin from './components/SignIn';
import Dashboard from './components/Dashboard';
import firebase from 'firebase';
import {firebaseConfig} from './Firebase';

firebase.initializeApp(firebaseConfig);

export default class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            display: "SignIn",
        }

        this.handleScreen = this.handleScreen.bind(this);
    };

    handleScreen(screen) {
        this.setState({display: screen})
    }

    render() {
        let screen

        if (this.state.display === "SignIn") {
            screen = <Signin switch={this.handleScreen} fb={firebase}/>
        }
        else {
            screen = <Dashboard switch={this.handleScreen} fb={firebase}/>
        }

        return (
            <div className="App">
                {screen}
            </div>
        );
    }
}



