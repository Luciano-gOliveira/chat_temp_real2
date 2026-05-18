import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'
import Join from './components/Join/join'
import Chat from './components/Chat/chat'

function App() {
  const [chatVisibility, setchatVisibility] = useState(false)
  const[socket, setSocket] = useState(null)

  return (
    <>
      <div className='app'>
        {chatVisibility ? <Chat socket={socket} /> : <Join setSocket={setSocket} setchatVisibility={setchatVisibility} />}
      </div>
    </>
  )
}

export default App
