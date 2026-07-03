import React, { createContext, useContext, useState } from 'react';

export type UserProfile = {
  name: string;
  surname: string;
  age: string;
  gender: string;
  phone: string;
  emergencyContact: string;
  bloodType: string;
  medicalData: string;
  healthIssues: string;
  disabilities: string;
  other: string;
  avatar: any;
};

type UserContextType = {
  user: UserProfile;
  setUser: (user: UserProfile) => void;
};

const defaultUser: UserProfile = {
  name: 'Alex',
  surname: 'Smith',
  age: '28',
  gender: 'Male',
  phone: '+1 (555) 123-4567',
  emergencyContact: 'Sarah Smith (Sister) - +1 (555) 987-6543',
  bloodType: 'O Positive (O+)',
  medicalData: 'Regular checkups normal. No recent surgeries.',
  healthIssues: 'Mild Asthma',
  disabilities: 'None',
  other: '',
  avatar: require('../../assets/images/user.jpg'), 
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile>(defaultUser);
  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}