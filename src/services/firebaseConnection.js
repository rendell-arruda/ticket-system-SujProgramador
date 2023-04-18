import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: 'AIzaSyBq5CopaRsMXIBX-6jT_JoQWaDI5Bl-CV4',
  authDomain: 'tickets-65601.firebaseapp.com',
  projectId: 'tickets-65601',
  storageBucket: 'tickets-65601.appspot.com',
  messagingSenderId: '699251298393',
  appId: '1:699251298393:web:528223bb4ea71f16ab2148',
  measurementId: 'G-5JWS16ELNN'
};

const firebaseApp = initializeApp(firebaseConfig);

//conexao com autenticaçao
const auth = getAuth(firebaseApp);

//conexao com banco
const db = getFirestore(firebaseApp);

//conexao com storega
const storage = getStorage(firebaseApp);

export { auth, db, storage };
