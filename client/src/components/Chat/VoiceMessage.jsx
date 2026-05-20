import React, { useState, useRef } from 'react'
import { db } from '../../firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

export default function VoiceMessage({ user, socket }) {
    const [recording, setRecording] = useState(false)
    const mediaRecorder = useRef(null)
    const audioChunks = useRef([])

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        mediaRecorder.current = new MediaRecorder(stream)
        audioChunks.current = []

        mediaRecorder.current.ondataavailable = (e) => {
            audioChunks.current.push(e.data)
        }

        mediaRecorder.current.onstop = async () => {
            const blob = new Blob(audioChunks.current, { type: 'audio/webm' })
            const formData = new FormData()
            formData.append('file', blob, 'audio.webm')
            formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET)
            formData.append('resource_type', 'video') // Cloudinary usa 'video' para áudio

            try {
                const res = await fetch(
                    `https://api.cloudinary.com/v1_1/${import.meta.env.VITE_CLOUDINARY_CLOUD_NAME}/video/upload`,
                    { method: 'POST', body: formData }
                )
                const data = await res.json()
                await addDoc(collection(db, 'messages'), {
                    text: '',
                    audioUrl: data.secure_url,
                    authorUsername: user?.displayName ?? 'Anônimo',
                    authorId: socket.id,
                    createdAt: serverTimestamp()
                })
            } catch (err) {
                console.error('Erro ao enviar áudio:', err)
            }

            stream.getTracks().forEach(track => track.stop())
        }

        mediaRecorder.current.start()
        setRecording(true)
    }

    const stopRecording = () => {
        mediaRecorder.current?.stop()
        setRecording(false)
    }

    return (
        <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            style={{
                padding: '8px',
                borderRadius: '8px',
                border: '1px solid #ccc',
                cursor: 'pointer',
                background: recording ? '#ff4444' : '#fff'
            }}
        >
            {recording ? '⏹️' : '🎤'}
        </button>
    )
}