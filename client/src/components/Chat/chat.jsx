import React, { useRef, useState, useEffect } from 'react'
import { db } from '../../firebase'
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore'

export default function Chat({ socket, user }) {
    const messageRef = useRef()
    const fileRef = useRef()
    const [mensageList, setMensageList] = useState([])
    const [uploading, setUploading] = useState(false)

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

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
        try {
            const res = await fetch(
                `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/image/upload`,
                { method: 'POST', body: formData }
            )
            const data = await res.json()
            await addDoc(collection(db, 'messages'), {
                text: '',
                imageUrl: data.secure_url,
                authorUsername: user?.displayName ?? 'Anônimo',
                authorId: socket.id,
                createdAt: serverTimestamp()
            })
        } catch (err) {
            console.error('Erro ao enviar imagem:', err)
        } finally {
            setUploading(false)
            fileRef.current.value = ''
        }
    }

    const clearInput = () => {
        messageRef.current.value = ''
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto',
            padding: '16px'
        }}>
            <h1>Chat</h1>

            <div style={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                marginBottom: '16px'
            }}>
                {mensageList.map((message, index) => {
                    const text = typeof message.text === 'object'
                        ? message.text?.text ?? ''
                        : message.text ?? ''

                    const username = typeof message.authorUsername === 'object'
                        ? message.authorUsername?.displayName ?? 'Anônimo'
                        : message.authorUsername ?? 'Anônimo'

                    const isMe = username === user?.displayName

                    return (
                        <div key={message.id ?? index} style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: isMe ? 'flex-end' : 'flex-start'
                        }}>
                            <strong style={{ color: isMe ? 'blue' : 'green', fontSize: '12px' }}>
                                {username}
                            </strong>
                            {text && (
                                <div style={{
                                    background: isMe ? '#dcf8c6' : '#f1f1f1',
                                    color: '#000',
                                    padding: '8px 12px',
                                    borderRadius: '12px',
                                    maxWidth: '80%'
                                }}>
                                    {text}
                                </div>
                            )}
                            {message.imageUrl && (
                                <img
                                    src={message.imageUrl}
                                    alt="imagem"
                                    style={{
                                        maxWidth: '300px',
                                        width: '100%',
                                        borderRadius: '12px',
                                        marginTop: '4px'
                                    }}
                                />
                            )}
                        </div>
                    )
                })}
            </div>

            <div style={{
                display: 'flex',
                gap: '8px',
                width: '100%'
            }}>
                <input
                    type="text"
                    ref={messageRef}
                    placeholder='Mensagem'
                    onKeyDown={(e) => e.key === 'Enter' && handlesSubmit()}
                    style={{ flex: 1, padding: '8px', borderRadius: '8px', border: '1px solid #ccc' }}
                />
                <button onClick={handlesSubmit}>Enviar</button>
                <input
                    type="file"
                    accept="image/*"
                    ref={fileRef}
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                />
                <button onClick={() => fileRef.current.click()} disabled={uploading}>
                    {uploading ? '...' : '📷'}
                </button>
            </div>
        </div>
    )
}