import React, {useRef, useState, useEffect} from 'react'

export default function chat({socket}) {
    const messageRef = useRef()
    const [mensageList, setMensageList] = useState([])

    console.log('socket:', socket)

    useEffect(() => {
        socket.on('receive_message', data => {
            setMensageList(current => [...current, data])
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
            <input type="text" ref={messageRef} placeholder='Mensagem' onKeyDown={(e) => e.key === 'Enter' && handlesSubmit()}/>
            <button onClick={() => handlesSubmit()}>Enviar</button>
        </div>
    )
}