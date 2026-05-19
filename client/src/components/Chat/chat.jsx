import React, { useRef, useState, useEffect } from 'react'
import { db } from '../../firebase'
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'

export default function Chat({ socket, user }) {
    const messageRef = useRef()
    const [mensageList, setMensageList] = useState([])

    useEffect(() => {
        const q = query(collection(db, 'messages'), orderBy('createdAt'))
        const unsub = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setMensageList(msgs)
        })
        return () => unsub()
    }, [])

    useEffect(() => {
        socket.emit('set_username', user?.displayName)
    }, [user])

    const handlesSubmit = async () => {
        const message = messageRef.current.value
        if (!message.trim()) return
        await addDoc(collection(db, 'messages'), {
            text: message,
            authorUsername: user?.displayName ?? 'Anônimo',
            authorId: socket.id,
            createdAt: serverTimestamp()
        })
        clearInput()
    }

    const clearInput = () => {
        messageRef.current.value = ''
    }

    return (
        <div>
            <h1>Chat</h1>
            {mensageList.map((message, index) => {
                const text = typeof message.text === 'object'
                    ? message.text?.text ?? 'Mensagem inválida'
                    : message.text ?? ''

                const username = typeof message.authorUsername === 'object'
                    ? message.authorUsername?.displayName ?? 'Anônimo'
                    : message.authorUsername ?? 'Anônimo'

                return (
                    <p
                        key={message.id ?? index}
                        style={{
                            color: username === user?.displayName ? 'blue' : 'green'
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