import { useState } from 'react'
import './App.css'
import Join from './components/Join/join'
import Chat from './components/Chat/chat'
import Auth from './components/Auth/auth'

function App() {
  const [chatVisibility, setchatVisibility] = useState(false)
  const [socket, setSocket] = useState(null)
  const [user, setUser] = useState(null)

  return (
    <>
      <div className='app'>
        {!user ? (
          <Auth setUser={setUser} />
        ) : chatVisibility ? (
          <Chat socket={socket} user={user} />
        ) : (
          <Join setSocket={setSocket} setchatVisibility={setchatVisibility} user={user} />
        )}
      </div>
    </>
  )
}

export default App