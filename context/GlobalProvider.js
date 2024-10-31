import React, { createContext, useContext, useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getUser } from "../firebase/database";

const GlobalContext = createContext();
export const useGlobalContext = () => useContext(GlobalContext);

const GlobalProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const user = await getUser(firebaseUser.uid);

        if (user) {
          const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim();
          const userObject = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            firstName: user.firstName,
            lastName: user.lastName,
            fullName: fullName,
            unit: user.unit,
            accountID: user.accountID,
            isAdmin: user.isAdmin
          };
          console.log(userObject);
          setUser(userObject);
        } else {
          console.error("No user data available");
        }
        setIsLogged(true);
      } else {
        setUser(null);
        setIsLogged(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // useEffect(() => {
  //   const auth = getAuth();
  //   const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
  //     if (firebaseUser) {
  //       const user = await getUser(firebaseUser.uid);
  //       console.log(user);

  //       const userObject = {
  //         uid: firebaseUser.uid,
  //         email: firebaseUser.email,
  //       };
  //       setUser(userObject);
  //       setIsLogged(true);
  //     } else {
  //       setUser(null);
  //       setIsLogged(false);
  //     }
  //     setLoading(false);
  //   });

  //   return () => unsubscribe();
  // }, []);

  return (
    <GlobalContext.Provider
      value={{
        isLogged,
        setIsLogged,
        user,
        setUser,
        loading,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export default GlobalProvider;