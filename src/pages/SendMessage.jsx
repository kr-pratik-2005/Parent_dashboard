import React, { useState, useEffect } from 'react';
import { db } from '../firebase/firebase';
import { collection, addDoc, query, where, getDocs,serverTimestamp  } from 'firebase/firestore';

export default function SendMessage() {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [parentContact, setParentContact] = useState('');

  // 🔹 Fetch parent's contact from students collection
  useEffect(() => {
    const fetchContact = async () => {
      const mobile = localStorage.getItem('parentMobile');
      if (!mobile) return;

      const q = query(collection(db, 'students'), where('contact', '==', mobile));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const student = querySnapshot.docs[0].data();
        setParentContact(student.contact); // Set contact
      }
    };

    fetchContact();
  }, []);

  const handleSend = async () => {
    if (!message.trim() || !parentContact) return;

    setSending(true);
    try {
      await addDoc(collection(db, 'messages'), {
        from: parentContact,
        to: 'demouser@gmail.com',
        message,
        timestamp: serverTimestamp(),
        read: false
      });
      alert('✅ Message sent!');
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('❌ Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Send Message to Admin</h2>
      <textarea
        rows={5}
        style={{ width: '100%', marginBottom: 10 }}
        placeholder="Type your message here..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <br />
      <button onClick={handleSend} disabled={sending || !message}>
        {sending ? 'Sending...' : 'Send Message'}
      </button>
    </div>
  );
}
