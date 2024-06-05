import React, { useState } from 'react';
import axios from 'axios';

function AccountCreation() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [court, setCourt] = useState('');

  const handleSubmit = async event => {
    event.preventDefault();
    // Perform account creation logic here
    const accountData = { username, password, court };
    try {
      const response = await axios.post('http://localhost:5000/register', accountData);
      console.log('Account created:', response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div>
      <h2>Create Account</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} />
        </label>
        <br />
        <label>
          Password:
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </label>
        <br />
        <label>
          Court Number:
          <input type="number" value={court} onChange={e => setCourt(e.target.value)} />
        </label>
        <br />
        <input type="submit" value="Create Account" />
      </form>
    </div>
  );
}

export default AccountCreation;
