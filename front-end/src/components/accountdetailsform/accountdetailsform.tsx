import React from 'react';

class AccountDetailsForm extends React.Component<{}, {}> {
  submitForm = async () => {
    let fname = this.ref.querySelector('#account_form input[name="fname"]');
    if(fname != null) {
      fname = fname.value;
    }
    let lname = this.ref.querySelector('#account_form input[name="lname"]');
    if(lname != null) {
      lname = lname.value;
    }
    let email = this.ref.querySelector('#account_form input[name="email"]');
    if(email != null) {
      email = email.value;
    }
    let pass = this.ref.querySelector('#account_form input[name="password"]');
    if(pass != null) {
      pass = pass.value;
    }
    let pass_confirm = this.ref.querySelector('#account_form input[name="password_confirm"]');
    if(pass_confirm != null) {
      pass_confirm = pass_confirm.value;
    }
    
    const res = await fetch('http://localhost:8000/create_account', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({
        'fname': fname, 
        'lname': lname, 
        'email': email, 
        'password': pass,
        'password_confirm': pass_confirm
        })
    });
  }

  render() {
    return (
      <div>
        <form id="account_form">
          <div>
            <label>First Name</label>
            <input type="text" name="fname"/>
            <label>Last Name</label>
            <input type="text" name="lname"/>
          </div>
          <div>
            <label>Email</label>
            <input type="email" name="email"/>
          </div>
          <div>
            <label>Password</label>
            <input type="password" name="password"/>
          </div>
          <div>
            <label>Confirm Password</label>
            <input type="password" name="password_confirm"/>
          </div>
        </form>
        <button onClick={this.submitForm}>Create Account</button>
      </div>
    );
  }
}

export default AccountDetailsForm;
