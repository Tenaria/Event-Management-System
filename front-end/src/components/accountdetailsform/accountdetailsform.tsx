import React from 'react';

class AccountDetailsForm extends React.Component<{}, {}> {
  submitForm = async () => {
    const fname = document.querySelector('#account_form[name=fname]');
    const lname = document.querySelector('#account_form[name=lname]');
    const email = document.querySelector('#account_form[name=email]');
    const pass = document.querySelector('#account_form[name=password]');
    const pass_confirm = document.querySelector('#account_form[name=password_confirm]');
    
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
