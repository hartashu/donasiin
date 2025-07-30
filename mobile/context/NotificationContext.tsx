import React, { createContext, useContext, useState, ReactNode } from 'react';

type NotificationContextType = {
  newPostsCount: number;
  newRequestsCount: number;
  unreadMessagesCount: number;
  setNewPostsCount: (count: number) => void;
  setNewRequestsCount: (count: number) => void;
  setUnreadMessagesCount: (count: number) => void;
};

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [newRequestsCount, setNewRequestsCount] = useState(0);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(0);

  const value = {
    newPostsCount,
    newRequestsCount,
    unreadMessagesCount,
    setNewPostsCount,
    setNewRequestsCount,
    setUnreadMessagesCount,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};