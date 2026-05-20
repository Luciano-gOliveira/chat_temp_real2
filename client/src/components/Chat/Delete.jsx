import React from 'react'
import { db } from '../../firebase'
import { deleteDoc, doc } from 'firebase/firestore'

export default function Delete({ message, currentUser }) {
    const text = typeof message.text === 'object'
        ? message.text?.text ?? ''
        : message.text ?? ''

    const username = typeof message.authorUsername === 'object'
        ? message.authorUsername?.displayName ?? 'Anônimo'
        : message.authorUsername ?? 'Anônimo'

    const isMe = username === currentUser?.displayName

    const handleDelete = async () => {
        await deleteDoc(doc(db, 'messages', message.id))
    }

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: isMe ? 'flex-end' : 'flex-start'
        }}>
            <strong style={{ color: isMe ? 'blue' : 'green', fontSize: '12px' }}>
                {username}
            </strong>
            {text && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{
                        background: isMe ? '#dcf8c6' : '#f1f1f1',
                        color: '#000',
                        padding: '8px 12px',
                        borderRadius: '12px',
                        maxWidth: '80%'
                    }}>
                        {text}
                    </div>
                    <span onClick={handleDelete} style={{ cursor: 'pointer', fontSize: '12px' }}>
                        🗑️
                    </span>
                </div>
            )}
            {message.imageUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <img
                        src={message.imageUrl}
                        alt="imagem"
                        style={{
                            maxWidth: '400px',
                            width: '100%',
                            borderRadius: '12px',
                            marginTop: '4px'
                        }}
                    />
                    <span onClick={handleDelete} style={{ cursor: 'pointer', fontSize: '12px' }}>
                        🗑️
                    </span>
                </div>
            )}
        </div>
    )
}