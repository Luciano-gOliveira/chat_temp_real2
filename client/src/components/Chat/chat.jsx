import React, {useRef, useState, useEffect} from 'react'
import { db } from '../../firebase'
import { collection, addDoc, onSnapshot, orderBy, query } from 'firebase/firestore'

export default function chat({socket, user}) {
    const messageRef = useRef()
    const [mensageList, setMensageList] = useState([])

    // Carrega mensagens do Firestore em tempo real
    useEffect(() => {
        const q = query(collection(db, 'messages'), orderBy('createdAt'))
        const unsub = onSnapshot(q, (snapshot) => {
            const msgs = snapshot.docs.map(doc => doc.data())
            setMensageList(msgs)
        })
        return () => unsub()
    }, [])

    // Recebe mensagens do socket
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
        if(!message.trim()) return
        socket.emit('send_message', message)
        clearInput()
    }

    const clearInput = () => {
        messageRef.current.value = ''
    }

    return (
        <div>
            <h1>chat</h1>
            {mensageList.map((message, index) => (
                <p key={index}>{message.authorUsername}: {message.text}</p>
            ))}
            <input 
                type="text" 
                ref={messageRef} 
                placeholder='Mensagem' 
                onKeyDown={(e) => e.key === 'Enter' && handlesSubmit()}
            />
            <button onClick={() => handlesSubmit()}>Enviar</button>
        </div>
    )
}