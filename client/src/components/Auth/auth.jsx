import React, { useState } from 'react'
import { auth } from '../../firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from 'firebase/auth'

export default function Auth({ setUser }) {
    const [isLogin, setIsLogin] = useState(true)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [username, setUsername] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async () => {
        setError('')
        try {
            if (isLogin) {
                const result = await signInWithEmailAndPassword(auth, email, password)
                setUser(result.user)
            } else {
                const result = await createUserWithEmailAndPassword(auth, email, password)
                await updateProfile(result.user, { displayName: username })
                setUser(result.user)
            }
        } catch (err) {
            setError('Email ou senha inválidos!')
        }
    }

    return (
        <div>
            <h1>{isLogin ? 'Login' : 'Cadastro'}</h1>
            {!isLogin && (
                <input
                    type="text"
                    placeholder="Nome de usuário"
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                />
            )}
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={e => setEmail(e.target.value)}
            />
            <input
                type="password"
                placeholder="Senha"
                value={password}
                onChange={e => setPassword(e.target.value)}
            />
            {error && <p>{error}</p>}
            <button onClick={handleSubmit}>
                {isLogin ? 'Entrar' : 'Cadastrar'}
            </button>
            <p onClick={() => setIsLogin(!isLogin)} style={{cursor:'pointer'}}>
                {isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Faça login'}
            </p>
        </div>
    )
}