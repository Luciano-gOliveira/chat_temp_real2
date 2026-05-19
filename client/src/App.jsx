import { useState, useEffect } from 'react'
import './App.css'
import Chat from './components/Chat/chat'
import Auth from './components/Auth/auth'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import io from 'socket.io-client'

function App() {
  const [socket, setSocket] = useState(null)
  const [user, setUser] = useState(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const s = io(import.meta.env.VITE_SOCKET_URL)
        s.emit('set_username', currentUser.displayName)
        setSocket(s)
        setUser(currentUser)
      }
    })
    return () => unsub()
  }, [])

  return (
    <>
      <div className='app'>
        {!user ? (
          <Auth setUser={setUser} setSocket={setSocket} />
        ) : (
          <Chat socket={socket} user={user} />
        )}
      </div>
    </>
  )
}

export default App