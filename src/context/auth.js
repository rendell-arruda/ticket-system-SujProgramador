import { useState, createContext, useEffect } from 'react';
import { auth, db } from '../services/firebaseConnection';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

// criar o contexto compartilhando as informacoes com a aplicaçao inteira
export const AuthContext = createContext({});

//cria provedor de contexto
export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function loadUser() {
      const storageUser = localStorage.getItem('@ticketsPRO');
      if (storageUser) {
        setUser(JSON.parse(storageUser));
        setLoading(false);
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  async function signIn(email, password) {
    setLoadingAuth(true);
    await signInWithEmailAndPassword(auth, email, password)
      //pega as informacoes do usuario no banco
      .then(async value => {
        let uid = value.user.uid;

        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        let data = {
          uid: uid,
          nome: docSnap.data().nome,
          email: value.user.email,
          avatarUrl: docSnap.data().avatarUrl
        };

        setUser(data);
        storageUser(data);
        setLoadingAuth(false);
        toast.success('Bem vindo de volta!');
        navigate('/dashboard');
      })
      .catch(error => {
        console.log(error);
        setLoadingAuth(false);
        toast.error('Opss algo deu errado');
      });
  }

  //cadastar um novo user
  async function signUp(name, email, password) {
    setLoadingAuth(true);
    await createUserWithEmailAndPassword(auth, email, password)
      .then(async value => {
        let uid = value.user.uid;
        await setDoc(doc(db, 'users', uid), {
          //o que eu quero passar para o banco
          nome: name,
          avatarUrl: null
        }).then(() => {
          let data = {
            uid: uid,
            nome: name,
            email: value.user.email,
            avatarUrl: null
          };

          //passa os dados para o usuario
          setUser(data);
          //salva o data no localstorage
          storageUser(data);
          setLoadingAuth(false);
          navigate('/dashboard');
          toast.success('Seja bem vindo ao sistema');
        });
      })
      .catch(error => {
        console.log(error);
        setLoadingAuth(false);
      });
  }

  function storageUser(data) {
    localStorage.setItem('@ticketsPRO', JSON.stringify(data));
  }

  async function logout() {
    await signOut(auth);
    localStorage.removeItem('@ticketsPRO');
    setUser(null);
  }

  //compartilha as informaçoes com a aplicação inteira
  return (
    <AuthContext.Provider
      value={{
        signed: !!user, //false por padrao
        user,
        signIn,
        signUp,
        logout,
        loadingAuth,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
