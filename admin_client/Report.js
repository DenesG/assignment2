import React, { useState } from 'react'
import axios from 'axios'

function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:6000/login", { username, password })
            console.log(res.data)
        }
        catch (err) {
            console.log(err)
        }
    }

    return (
        <div>
            <form onSubmit={handleSubmit}>
            <span>Admin Log</span>
            <br />
            <input 
                type="text"
                placeholder = "username"
                onChange={(e) => setUsername(e.target.value)}
            />
            <br />
            <input
                type="password"
                placeholder = "password"
                onChange={(e) => setPassword(e.target.value)}
            />
            <br />
            <button type="submit">
                Login
            </button>

            </form>
        </div>
    )
}

export default Login