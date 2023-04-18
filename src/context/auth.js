import { useState, createContext, useEffect } from 'react';
import { auth, db } from '../services/firebaseConnection';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
// criar o contexto compartilhando as informacoes com a aplicaçao inteira
export const AuthContext = createContext({});

//cria provedor de contexto

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  //colocar um loading
  const [loadingAuth, setLoandingAuth] = useState(false);

  function signIn(email, password) {
    console.log(email);
    console.log(password);
    alert('logado com sucesso');
  }

  //cadastar um novo user
  async function signUp(name, email, password) {
    setLoandingAuth(true);
    await createUserWithEmailAndPassword(auth, email, password)

      .then(async value => {
        let uid = value.user.uid
        await setDoc(doc(db, 'users', uid), {
          //o que eu quero passar para o banco
          nome: name,
          avatarUrl: null,
        })
          .then(() => {
            let data = {
              uid: uid,
              nome: name,
              email: value.user.email,
              avatarUrl: null
            }
            setUser(data);
            setLoandingAuth(false);
          })

      }
      )
      .catch((error) => {
        console.log(error)
        setLoandingAuth(false)
      });
  }
  //compartilha as informaçoes com a aplicação inteira
  return (
    <AuthContext.Provider
      value={{
        signed: !!user, //false por padrao
        user,
        signIn,
        signUp, loadingAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
