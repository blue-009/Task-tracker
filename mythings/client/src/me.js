import { createContext, useContext } from 'react';
export const Me = createContext();
export const useMe = () => useContext(Me);
