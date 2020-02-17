import React from 'react';

export default class SignIn extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            display: "SignIn",
            email: "",
            password: "",
            error: false,
            errorMsg: "",
        }

        this.handleSignIn = this.handleSignIn.bind(this);
    }

    async handleSignIn() {
        this.setState({error: false, errorMsg: ""})

        if (this.state.email === "" || this.state.password === "") {
            return this.setState({error: true, errorMsg: "Please fill in all the fields!"});
        }

        await this.props.fb.auth().signInWithEmailAndPassword(
            this.state.email.replace(/\s/g, ''),
            this.state.password
        )
        // .then(this.props.switch("Dashboard"))
        .catch(error => this.setState({error: true, errorMsg: error.code}));


        if (!this.state.error) {
            return this.props.switch("Dashboard");
        }
    }

    render() {
        let screen

        if (this.state.display === "SignIn") {
            screen = 
                <div className="sign-in-content">
                    <div className="sign-in-content-titlebar">
                        <div className="sign-in-title">
                            Sign In
                        </div>
                    </div>
                    <form className="sign-in-form">
                        <input className="sign-in-fields" value={this.state.email} onChange={text => this.setState({ email: text.target.value })} placeholder="Email" type="email"/>
                        <input className="sign-in-fields" value={this.state.password} onChange={text => this.setState({ password: text.target.value })} placeholder="Password" type="password"/>
                    </form>
                    <button onClick={() => this.handleSignIn()} className="button" style={{width: 50}}>
                        Login
                    </button>
                    {this.state.error && <div className="error-text">{this.state.errorMsg}</div>}
                    <p>
                        Don't have an account? <a onClick={() => this.setState({ display: "SignUp" })}>Create one</a>
                    </p>
                </div>
        }
        else {
            screen = <SignUp switch={this.props.switch} fb={this.props.fb}/>
        }

        return (
            <div className="sign-in-container">
                <div className="sign-in-titlebar">
                    <div className="title">
                        AI Message
                    </div>
                </div>
                {screen}
            </div>
        );
    }
}

class SignUp extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            firstName: "",
            lastName: "",
            phone: "",
            email: "",
            password: "",
            reenter: "",
            error: false,
            errorMsg: "",
        }

        this.handleSignUp = this.handleSignUp.bind(this);
    }

    async handleSignUp() {
        this.setState({error: false, errorMsg: ""});

        if (this.state.firstName === "" || this.state.lastName === "" || this.state.phone === "" || this.state.email === "" || this.state.password === "" || this.state.reenter === "") {
            return this.setState({error: true, errorMsg: "Please fill in all the fields!"});
        }

        let username = this.state.email.replace(/\./g, 'dot').replace(/\s/g, '').toLowerCase();

        await this.props.fb.auth().createUserWithEmailAndPassword(this.state.email.replace(/\s/g, ''), this.state.password)
        .then(
            this.props.fb.database().ref(username + '/' + 'info/')
            .set({
                firstName: this.state.firstName.replace(/\s/g, ''),
                lastName : this.state.lastName.replace(/\s/g, ''),
                phone: this.state.phone
            })
        )
        .catch(error => this.setState({error: true, errorMsg: error.code}));


        if (!this.state.error) {
            return this.props.switch("Dashboard");
        }
    }

    render() {
        return (
            <div className="sign-up-content">
                <div className="sign-up-content-titlebar">
                    <div className="sign-up-title">
                        Sign Up
                    </div>
                </div>
                <form className="sign-up-form">
                    <input className="sign-up-fields" placeholder="First Name" name="firstname" value={this.state.firstName} onChange={text => this.setState({firstName: text.target.value})} type=""/>
                    <input className="sign-up-fields" placeholder="Last Name" name="lastname" value={this.state.lastName} onChange={text => this.setState({lastName: text.target.value})}/>
                    <input className="sign-up-fields" placeholder="Phone Number" name="phone" value={this.state.phone} onChange={text => this.setState({phone: text.target.value})} type="number"/>
                    <input className="sign-up-fields" placeholder="Email" name="email" value={this.state.email} onChange={text => this.setState({email: text.target.value})} type="email"/>
                    <input className="sign-up-fields" placeholder="Password" value={this.state.password} onChange={text => this.setState({password: text.target.value})} type="password"/>
                    <input className="sign-up-fields" placeholder="Re-enter Password" value={this.state.reenter} onChange={text => this.setState({reenter: text.target.value})} type="password"/>
                </form>
                <button className="button" style={{width: 70}} onClick={() => this.handleSignUp()}>
                    Sign Up
                </button>
                {this.state.error && <div className="error-text">{this.state.errorMsg}</div>}
            </div>
        );
    }
}