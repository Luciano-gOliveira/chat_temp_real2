import React, {useRef} from 'react'
import io from 'socket.io-client'



export default function join({setchatVisibility, setSocket}) {

    const usernameRef = useRef()
    const handlesSubmit = async () => {
        const username = usernameRef.current.value
        if(!username.trim()) return
        const socket = io('https://chat-temp-real2.onrender.com')
        socket.emit('set_username', username)
        setSocket(socket)
        setchatVisibility(true)
    }

  return (
    <div>
        <h1>Join</h1>
        <input type="text" name="" id=""  placeholder='Nome usuario' ref={usernameRef}/>
        <button onClick={()=> handlesSubmit()}>Entrar</button>
    </div>
  )
}
