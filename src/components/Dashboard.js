import React from 'react';

import firebase from 'firebase';
export default class Dashboard extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            name: "",
            display: "send",
            user: this.props.fb.auth().currentUser.email.replace(/\./g, 'dot'),
            contacts: {},
            contactsList: []
        }

        this.fetchData = this.fetchData.bind(this);
        this.switch = this.switch.bind(this);
        this.handleContactChange = this.handleContactChange.bind(this);
    }

    componentDidMount() {
        firebase.database().ref(this.props.fb.auth().currentUser.email.replace(/\./g, 'dot') + '/info')
        .once("value")
        .then(value => this.setState({name: value.val().firstName}))
        .catch(error => this.setState({error: true, errorMsg: error.code}));

        this.interval = setInterval(() => {this.fetchData()}, 2000); 
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    fetchData() {
        firebase.database().ref(this.props.fb.auth().currentUser.email.replace(/\./g, 'dot') + '/contacts/')
        .once("value")
        .then(results => {
            this.setState({contacts: results.val()}) 

            let list = [];
            for (let result in results.val()) {
                list.push(result)
            }

            this.setState({contactsList: list});
        })
    }

    switch(display) {
        this.setState({display: display})
    }

    handleContactChange(contact) {
        this.setState({display: contact.replace(/\./g, 'dot')});
    }

    render() {
        return (
            <div className="dashboard-container">
                <div className="dashboard-titlebar">
                    <div className="title">
                        AI Message 
                    </div>
                </div>
                <div className="dashboard-navbar">
                    <button className="new-message-button" onClick={() => this.switch("send")}>
                        New Message
                    </button>
                    <div className="profile-name">
                        {this.state.name}
                    </div>
                    <button className="logout" onClick={() => firebase.auth().signOut().then(this.props.switch("SignIn")).catch(error => this.setState({error: true, errorMsg: error.code}))}>
                        Logout
                    </button>
                </div>
                <div className="dashboard-content"> 
                    <MessageView user={this.state.user} contacts={this.state.contacts} display={this.state.display} switch={this.switch}/>
                    <MessageInbox user={this.state.user} contacts={this.state.contactsList} handleContactChange={this.handleContactChange}/>
                </div>
            </div>
        );
    }
}

class MessageView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            display: this.props.display,
            recipient: "",
            message: ""
        }

        this.handleSend = this.handleSend.bind(this);
    }

    //The componentDidUpdate is particularly useful when an operation needs to happen after the DOM is updated. 
    //when you need something to be the absolutely last thing to be executed. whenever your image is attaching to DOM, 
    //componentDidUpdate will do what you asked to do with DOM
    // componentDidUpdate() {
    //     this.newMsg.scrollIntoView({behavior: "smooth"});
    // }

    handleSend() {
        if (this.state.recipient === "" && this.props.display === "send") {
            return console.log("nah")
        }

        let recipient = this.state.recipient.replace(/\./g, 'dot').replace(/\s/g, '');
        this.setState({display: recipient});
        let length;

        if (this.props.contacts.length === 0) {
            length = 0;
        }
        else {
            if (this.props.display !== "send") {
                length = Object.keys(this.props.contacts[this.props.display].messages).length;
            }
            else {
                try {
                    length = Object.keys(this.props.contacts[recipient].messages).length;
                }
                catch {
                    length = 0;
                }
            }
        }
        
        if (this.props.display === "send") {
            firebase.database().ref(this.props.user + '/contacts/' + recipient + '/messages/')
            .update({
                [length]: {
                receiver: recipient,
                sender: this.props.user,
                text: this.state.message
            }})
            .catch(error => this.setState({error: true, errorMsg: error.code}));

            firebase.database().ref(recipient + '/contacts/' + this.props.user + '/messages/')
            .update({
                [length]: {
                receiver: recipient,
                sender: this.props.user,
                text: this.state.message
            }})
            .then(this.props.switch(recipient))
            .catch(error => this.setState({error: true, errorMsg: error.code}));
        }
        else {
            firebase.database().ref(this.props.user + '/contacts/' + this.props.display + '/messages/')
            .update({
                [length]: {
                receiver: this.props.display,
                sender: this.props.user,
                text: this.state.message
            }})
            .catch(error => this.setState({error: true, errorMsg: error.code}));

            firebase.database().ref(this.props.display + '/contacts/' + this.props.user + '/messages/')
            .update({
                [length]: {
                receiver: this.props.display,
                sender: this.props.user,
                text: this.state.message
            }})
            .catch(error => this.setState({error: true, errorMsg: error.code}));
        }

        this.setState({recipient: "", message: ""})
    }

    render() {
        let display
        if (this.props.display === "send") {
            display = 
            <div className="message-send-container">
                <input className="recipient-field" placeholder="Enter the recipient's phone number or email" value={this.state.value} onChange={text => this.setState({recipient: text.target.value})}/>
            </div>
        }
        else {
            let messages
            try {
                messages = this.props.contacts[this.props.display].messages.map((message, id) => {return (
                    <div className="message" key={id} style={{float: message.receiver === this.props.display? "right" : "left", backgroundColor: message.receiver === this.props.display? "rgb(17, 214, 214)" : "beige"}}>
                        {message.text}
                    </div>
                )})
            }
            catch {
                messages = <div/>
            }

            display = 
            <div className="message-chat">
                {messages}
            </div>
        }

        return (
            <div className="message-view-content">
                {display}
                <div className="message-send-section">
                    <textarea className="textarea" value={this.state.message} onChange={text => this.setState({message: text.target.value})}/>
                    <button className="send-button" onClick={() => this.handleSend()}>Send</button>
                </div>
            </div>
        );
    }
}

class MessageInbox extends React.Component {
    render() {
        let contact 
        try {
            contact = this.props.contacts.map((contact, id) => {return (
                contact = contact.replace('dot', '.'),
                <button key={id} className="contact" onClick={() => this.props.handleContactChange(contact)}>
                    {contact}
                </button>
            )})
        }
        catch {
            contact = <div/>
        }

        return (
            <div className="contacts-content">
                <div className="contacts-title-container">
                    Contacts
                </div>
                <div className="contacts-box">
                    {contact}
                </div>
            </div>
        );
    }
}