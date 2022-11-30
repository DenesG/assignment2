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
    }
}