import React from 'react';
import { AuthContext } from '../../context/auth';
import { useContext, useEffect, useState } from 'react';
import Header from '../../components/Header';
import './dashboard.css';
import Title from '../../components/Title';
import { FiPlus, FiMessageSquare, FiSearch, FiEdit2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import {
  collection,
  getDocs,
  orderBy,
  limit,
  startAfter,
  query
} from 'firebase/firestore';
import { db } from '../../services/firebaseConnection';
import { format } from 'date-fns';

const listRef = collection(db, 'chamados');

export default function Dashboard() {
  const { logout } = useContext(AuthContext);
  //lista de chamados vindo do firebase
  const [chamados, setChamados] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEmpty, setIsEmpty] = useState(false);
  const [lastDocs, setLastDocs] = useState([]);
  // enquanto busca mais items
  const [loadingMore, setloadingMore] = useState(false);

  useEffect(() => {
    //carregar chamados
    async function loadChamados() {
      const q = query(listRef, orderBy('created', 'desc'), limit(5));
      const querySnapshot = await getDocs(q);
      setChamados([]);

      //pegar os dados do ultimo documento
      await updateStates(querySnapshot);
      setLoading(false);
    }
    loadChamados();

    return () => {};
  }, []);

  //montar lista de chamados
  async function updateStates(querySnapshot) {
    const isCollectionEmpty = querySnapshot.size === 0; //se estiver vazio recebe true
    if (!isCollectionEmpty) {
      let lista = [];

      //pegar os dados do ultimo documento
      querySnapshot.forEach(doc => {
        lista.push({
          id: doc.id,
          assunto: doc.data().assunto,
          cliente: doc.data().cliente,
          clienteId: doc.data().clienteId,
          created: doc.data().created,
          createdFormat: format(doc.data().created.toDate(), 'dd/MM/yyyy'),
          status: doc.data().status,
          complemento: doc.data().complemento
        });
      });
      //pegar o ultimo renderizado
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      // a state recebe o ultimo documento renderizado
      setLastDocs(lastDoc);
      //coloca os dados no estado chamados
      setChamados(chamados => [...chamados, ...lista]);
    } else {
      setIsEmpty(true);
    }
    setloadingMore(false);
  }

  //buscar mais itens a partir do ultimo documento renderizado
  async function handleMore() {
    setloadingMore(true);
    const q = query(
      listRef,
      orderBy('created', 'desc'),
      startAfter(lastDocs),
      limit(5)
    );
    const querySnapshot = await getDocs(q);
    //buscar os itens e mostrar na tela
    await updateStates(querySnapshot);
  }

  if (loading) {
    return (
      <div>
        <Header />
        <div className="content">
          <Title name="Tickets">
            <FiMessageSquare size={25} />
          </Title>
          <div className="container dashboard">
            <span>Buscando chamados...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="content">
        <Title name="Tickets">
          <FiMessageSquare size={25} />
        </Title>
        <>
          {chamados.length === 0 ? (
            <div className="container dashboard">
              <span>Nenhum chamado encontrado</span>
              <Link to="/new" className="new">
                <FiPlus color="#fff" size={25} /> Novo Chamado
              </Link>
            </div>
          ) : (
            <>
              <Link to="/new" className="new">
                <FiPlus color="#fff" size={25} /> Novo Chamado
              </Link>
              <table>
                <thead>
                  <tr>
                    <th scope="col">Cliente</th>
                    <th scope="col">Assunto</th>
                    <th scope="col">Status</th>
                    <th scope="col">Cadastrado em</th>
                    <th scope="col">#</th>
                  </tr>
                </thead>

                <tbody>
                  {chamados.map((item, index) => {
                    return (
                      <tr key={index}>
                        <td data-label="Cliente">{item.cliente}</td>
                        <td data-label="Assunto">{item.assunto}</td>
                        <td data-label="Status">
                          <span
                            className="badge"
                            style={{
                              backgroundColor:
                                item.status === 'Aberto' ? '#5cb85c' : '#999'
                            }}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td data-label="Cadastrado">{item.createdFormat}</td>
                        <td data-label="#">
                          <button
                            className="action"
                            style={{ backgroundColor: '#3583f6' }}
                          >
                            <FiSearch color="#fff" size={17} />
                          </button>
                          <Link
                            to={`/new/${item.id}`}
                            className="action"
                            style={{ backgroundColor: '#f6a935' }}
                          >
                            <FiEdit2 color="#fff" size={17} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {/* //se não estiver vazio e não estiver carregando mais */}
              {loadingMore && <h3>Buscando itens...</h3>}
              {!loadingMore && !isEmpty && (
                <button className="btn-more" onClick={handleMore}>
                  Buscar mais
                </button>
              )}
            </>
          )}
        </>
      </div>
      {/* <button onClick={handleLogout}>Sair da conta</button> */}
    </div>
  );
}
