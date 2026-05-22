import { useEffect, useRef, useState } from 'react'
import SimplePeer from 'simple-peer'

export default function VideoCall({ socket, user }) {
    const [inCall, setInCall] = useState(false)
    const [peers, setPeers] = useState([])
    const myVideoRef = useRef()
    const streamRef = useRef()
    const peersRef = useRef([])

    const startCall = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        streamRef.current = stream
        setInCall(true)
        // ✅ espera o DOM atualizar antes de setar o srcObject
        setTimeout(() => {
            if (myVideoRef.current) myVideoRef.current.srcObject = stream
        }, 100)
        socket.emit('join_call')
    }

    const leaveCall = () => {
        streamRef.current?.getTracks().forEach(t => t.stop())
        peersRef.current.forEach(p => p.peer.destroy())
        peersRef.current = []
        setPeers([])
        setInCall(false)
        socket.emit('leave_call')
    }

    useEffect(() => {
        socket.on('call_users', (userIds) => {
            const newPeers = userIds.map(userId => {
                const peer = createPeer(userId, socket, streamRef.current)
                peersRef.current.push({ peerId: userId, peer })
                return { peerId: userId, peer }
            })
            setPeers(newPeers)
        })

        socket.on('user_joined_call', (userId) => {
            const peer = addPeer(userId, socket, streamRef.current)
            peersRef.current.push({ peerId: userId, peer })
            setPeers(prev => [...prev, { peerId: userId, peer }])
        })

        socket.on('call_signal', ({ from, signal }) => {
            const found = peersRef.current.find(p => p.peerId === from)
            if (found) found.peer.signal(signal)
        })

        socket.on('user_left_call', (userId) => {
            const found = peersRef.current.find(p => p.peerId === userId)
            if (found) found.peer.destroy()
            peersRef.current = peersRef.current.filter(p => p.peerId !== userId)
            setPeers(prev => prev.filter(p => p.peerId !== userId))
        })

        return () => {
            socket.off('call_users')
            socket.off('user_joined_call')
            socket.off('call_signal')
            socket.off('user_left_call')
        }
    }, [socket])

    // ✅ seta srcObject quando inCall vira true
    useEffect(() => {
        if (inCall && myVideoRef.current && streamRef.current) {
            myVideoRef.current.srcObject = streamRef.current
        }
    }, [inCall])

    function createPeer(userId, socket, stream) {
        const peer = new SimplePeer({ initiator: true, trickle: false, stream })
        peer.on('signal', signal => {
            socket.emit('call_signal', { to: userId, signal })
        })
        return peer
    }

    function addPeer(userId, socket, stream) {
        const peer = new SimplePeer({ initiator: false, trickle: false, stream })
        peer.on('signal', signal => {
            socket.emit('call_signal', { to: userId, signal })
        })
        return peer
    }

    return (
        <div style={{ marginBottom: '12px' }}>
            {!inCall ? (
                <button
                    onClick={startCall}
                    style={{
                        background: '#25D366',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '8px 16px',
                        cursor: 'pointer'
                    }}
                >
                    📹 Iniciar videochamada
                </button>
            ) : (
                <div>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '8px' }}>
                        <div style={{ position: 'relative' }}>
                            <video
                                ref={myVideoRef}
                                autoPlay
                                muted
                                playsInline
                                style={{ width: '160px', borderRadius: '8px', background: '#000' }}
                            />
                            <span style={{
                                position: 'absolute', bottom: '4px', left: '4px',
                                background: 'rgba(0,0,0,0.5)', color: '#fff',
                                fontSize: '11px', padding: '2px 6px', borderRadius: '4px'
                            }}>
                                Você
                            </span>
                        </div>

                        {peers.map(({ peerId, peer }) => (
                            <PeerVideo key={peerId} peer={peer} />
                        ))}
                    </div>

                    <button
                        onClick={leaveCall}
                        style={{
                            background: '#e53e3e',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            padding: '8px 16px',
                            cursor: 'pointer'
                        }}
                    >
                        ❌ Sair da chamada
                    </button>
                </div>
            )}
        </div>
    )
}

function PeerVideo({ peer }) {
    const videoRef = useRef()

    useEffect(() => {
        peer.on('stream', stream => {
            if (videoRef.current) videoRef.current.srcObject = stream
        })
    }, [peer])

    return (
        <video
            ref={videoRef}
            autoPlay
            playsInline
            style={{ width: '160px', borderRadius: '8px', background: '#000' }}
        />
    )
}