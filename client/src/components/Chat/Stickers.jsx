import React, { useState, useEffect, useRef } from 'react'
import { db } from '../../firebase'
import { collection, addDoc, onSnapshot, query, where, serverTimestamp } from 'firebase/firestore'

export default function Stickers({ user, socket, onClose }) {
    const [stickers, setStickers] = useState([])
    const [uploading, setUploading] = useState(false)
    const fileRef = useRef()

    // Carrega as figurinhas do usuário
    useEffect(() => {
        const q = query(
            collection(db, 'stickers'),
            where('authorId', '==', user.uid)
        )
        const unsub = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            setStickers(data)
        })
        return () => unsub()
    }, [user])

    // Upload de nova figurinha
    const handleUpload = async (e) => {
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
            await addDoc(collection(db, 'stickers'), {
                imageUrl: data.secure_url,
                authorId: user.uid,
                createdAt: serverTimestamp()
            })
        } catch (err) {
            console.error('Erro ao enviar figurinha:', err)
        } finally {
            setUploading(false)
            fileRef.current.value = ''
        }
    }

    // Envia a figurinha no chat
    const handleSend = async (sticker) => {
        await addDoc(collection(db, 'messages'), {
            text: '',
            imageUrl: sticker.imageUrl,
            isSticker: true,
            authorUsername: user?.displayName ?? 'Anônimo',
            authorId: socket.id,
            createdAt: serverTimestamp()
        })
        onClose()
    }

    return (
        <div style={{
            position: 'fixed',
            bottom: '70px',
            right: '20px',
            background: '#fff',
            border: '1px solid #ccc',
            borderRadius: '12px',
            padding: '12px',
            width: '300px',
            maxHeight: '350px',
            overflowY: 'auto',
            zIndex: 999,
            boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong>Minhas Figurinhas</strong>
                <span onClick={onClose} style={{ cursor: 'pointer' }}>✕</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {stickers.map((sticker) => (
                    <img
                        key={sticker.id}
                        src={sticker.imageUrl}
                        alt="sticker"
                        onClick={() => handleSend(sticker)}
                        style={{
                            width: '80px',
                            height: '80px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            cursor: 'pointer'
                        }}
                    />
                ))}
            </div>

            <input
                type="file"
                accept="image/*"
                ref={fileRef}
                style={{ display: 'none' }}
                onChange={handleUpload}
            />
            <button
                onClick={() => fileRef.current.click()}
                disabled={uploading}
                style={{
                    marginTop: '12px',
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    cursor: 'pointer'
                }}
            >
                {uploading ? 'Enviando...' : '+ Adicionar figurinha'}
            </button>
        </div>
    )
}