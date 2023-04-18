import { useState, createContext, useEffect } from 'react';
import { auth, db } from '../services/firebaseConnection';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// criar o contexto compartilhando as informacoes com a aplicaçao inteira
export const AuthContext = createContext({});

//cria provedor de contexto
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  //colocar um loading
  const [loadingAuth, setLoandingAuth] = useState(false);
  const navigate = useNavigate()

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

            //passa os dados para o usuario
            setUser(data);
            //salva o data no localstorage
            storageUser(data)
            setLoandingAuth(false);
            navigate('/dashboard')
            toast.success('Seja bem vindo ao sistema')


          })

      }
      )
      .catch((error) => {
        console.log(error)
        setLoandingAuth(false)
      });
  }

  function storageUser(data) {
    localStorage.setItem('@ticketsPRO', JSON.stringify(data))
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
