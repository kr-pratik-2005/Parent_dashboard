import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/firebase';

export default function ParentDailyReports() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user || !user.phoneNumber) return;
      
      try {
        // Clean phone number to match Firestore format
        let parentPhone = user.phoneNumber;
        if (parentPhone.startsWith("+91")) parentPhone = parentPhone.substring(3);
        else if (parentPhone.startsWith("+")) parentPhone = parentPhone.substring(1);
        
        // Query students collection
        const studentsRef = collection(db, "students");
        const q = query(studentsRef, where("contact", "==", parentPhone));
        const querySnapshot = await getDocs(q);
        
        const studentsData = [];
        querySnapshot.forEach((doc) => {
          studentsData.push({ id: doc.id, ...doc.data() });
        });
        
        setStudents(studentsData);
      } catch (error) {
        console.error("Error fetching students:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, [user]);

  if (loading) return <div>Loading...</div>;
  
  return (
    <div>
      <h2>Your Children</h2>
      {students.length === 0 ? (
        <p>No children found</p>
      ) : (
        <ul>
          {students.map(student => (
            <li key={student.id}>
              {student.name} (Grade: {student.grade})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
