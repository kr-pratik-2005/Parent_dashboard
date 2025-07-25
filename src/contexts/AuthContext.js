import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [parentPhone, setParentPhone] = useState(null);
  
  // Get phone from localStorage when component mounts
  useEffect(() => {
    const phone = localStorage.getItem('parentMobile');
    if (phone) {
      setParentPhone(phone);
    }
  }, []);

  // Function to update parent phone
  const updateParentPhone = (phone) => {
    setParentPhone(phone);
    localStorage.setItem('parentMobile', phone);
  };

  // Function to clear parent phone (for logout)
  const clearParentPhone = () => {
    setParentPhone(null);
    localStorage.removeItem('parentMobile');
  };

  return (
    <AuthContext.Provider value={{ 
      parentPhone, 
      setParentPhone: updateParentPhone,
      clearParentPhone 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
