import React from 'react';

class AccountDetailsForm extends React.Component<{}, {}> {
  submitForm = async () => {
    const res = await fetch('http://localhost:8000/create_account', {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type' : 'application/json'
      },
      body: JSON.stringify({
        'fname': document.querySelector('#account_form[name=fname]'), 
        'lname': document.querySelector('#account_form[name=lname]'), 
        'email': document.querySelector('#account_form[name=email]'), 
        'password': document.querySelector('#account_form[name=password]'),
        'password_confirm': document.querySelector('#account_form[name=password_confirm]')
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
