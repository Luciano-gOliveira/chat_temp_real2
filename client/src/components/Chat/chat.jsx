import React, { useRef, useState, useEffect } from 'react'
import { db } from '../../firebase'
import { collection, addDoc, onSnapshot, orderBy, query } from 'firebase/firestore'

export default function Chat({ socket, user }) {
    const messageRef = useRef()
    const [mensageList, setMensageList] = useState([])

    useEffect(() => {
        const q = query(collection(db, 'messages'), orderBy('createdAt'))
        const unsub = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => doc.data())
            setMensageList(msgs)
        })
        return () => unsub()
    }, [])

    useEffect(() => {
        socket.on('receive_message', async (data) => {
            await addDoc(collection(db, 'messages'), {
                ...data,
                createdAt: new Date()
            })
        })
        return () => socket.off('receive_message')
    }, [socket])

    const handlesSubmit = () => {
        const message = messageRef.current.value
        if (!message.trim()) return
        socket.emit('send_message', { text: message })
        clearInput()
    }

    const clearInput = () => {
        messageRef.current.value = ''
    }

    return (
        <div>
            <h1>Chat</h1>
            {mensageList.map((message, index) => {
                // ✅ Garante que text e authorUsername sejam sempre strings
                const text = typeof message.text === 'object'
                    ? message.text?.text ?? 'Mensagem inválida'
                    : message.text ?? ''

                const username = typeof message.authorUsername === 'object'
                    ? message.authorUsername?.displayName ?? 'Anônimo'
                    : message.authorUsername ?? 'Anônimo'

                return (
                    <p
                        key={index}
                        style={{
                            color: username === user?.displayName
                                ? 'blue'
                                : 'black'
                        }}
                    >
                        <strong>{username}:</strong> {text}
                    </p>
                )
            })}
            <input
                type="text"
                ref={messageRef}
                placeholder='Mensagem'
                onKeyDown={(e) => e.key === 'Enter' && handlesSubmit()}
            />
            <button onClick={handlesSubmit}>Enviar</button>
        </div>
    )
}