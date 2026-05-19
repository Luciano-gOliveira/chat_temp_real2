import React, { useState } from 'react'
import { auth } from '../../firebase'
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth'

export default function Auth({ setUser }) {
    const [error, setError] = useState('')

    const handleGoogle = async () => {
        setError('')
        try {
            const provider = new GoogleAuthProvider()
            const result = await signInWithPopup(auth, provider)
            setUser(result.user)
        } catch (err) {
            setError('Erro ao entrar com Google!')
        }
    }

    return (
        <div>
            <h1>Chat Real</h1>
            {error && <p>{error}</p>}
            <button onClick={handleGoogle}>
                Entrar com Google
            </button>
        </div>
    )
}
