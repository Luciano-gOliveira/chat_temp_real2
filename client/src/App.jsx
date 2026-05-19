import { useState } from 'react'
import './App.css'
import Chat from './components/Chat/chat'
import Auth from './components/Auth/auth'

function App() {
  const [socket, setSocket] = useState(null)
  const [user, setUser] = useState(null)

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