import { useState, useEffect, useContext } from 'react';
import './new.css';
import Header from '../../components/Header';
import Title from '../../components/Title';
import { FiPlusCircle } from 'react-icons/fi';
import { AuthContext } from '../../context/auth';
import { db } from '../../services/firebaseConnection';
import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
const listRef = collection(db, 'customers');

export default function New() {
  const { user } = useContext(AuthContext);

  const [customers, setCustomers] = useState([]);
  const [complemento, setComplemento] = useState('');
  const [assunto, setAssunto] = useState('Suporte');
  const [status, setStatus] = useState('Aberto');
  const [loadCustomers, setLoadCustomers] = useState(true);
  const [customerSelected, setCustomerSelected] = useState(0);

  useEffect(() => {
    async function loadCustomers() {
      const querySnapshot = await getDocs(listRef)
        .then(snapshot => {
          let lista = [];
          snapshot.forEach(doc => {
            lista.push({
              id: doc.id,
              nomeFantasia: doc.data().nomeFantasia
            });
          });
          if (lista.length === 0) {
            console.log('Nenhuma empresa encontrada');
            setCustomers([{ id: 1, nomeFantasia: 'Freela' }]);
            setLoadCustomers(false);
            return;
          }
          setCustomers(lista);
          setLoadCustomers(false);
        })
        .catch(error => {
          console.log('Erro ao buscar os clientes ', error);
          setLoadCustomers(false);
          setCustomers([{ id: 1, nomeFantasia: 'Freela' }]);
        });
    }
    loadCustomers();
  }, []);

  function handleOptionChange(e) {
    setStatus(e.target.value);
  }

  function handleChangeSelect(e) {
    setAssunto(e.target.value);
    console.log(e.target.value);
  }

  function handleChangeCustomer(e) {
    setCustomerSelected(e.target.value);
  }

  return (
    <div>
      <Header />
      <div className="content">
        <Title name="Novo chamado">
          <FiPlusCircle size={25} />
        </Title>

        <div className="container">
          <form className="form-profile">
            <label>Clientes</label>
            {loadCustomers ? (
              <input
                type="text"
                disabled={true}
                value="Carregando clientes..."
              />
            ) : (
              <select value={customerSelected} onChange={handleChangeCustomer}>
                {' '}
                {customers.map((item, index) => {
                  return (
                    <option key={index} value={index}>
                      {item.nomeFantasia}
                    </option>
                  );
                })}
              </select>
            )}

            <label>Assunto</label>
            <select value={assunto} onChange={handleChangeSelect}>
              <option value="suporte">Suporte</option>
              <option value="visita tecnica">Visita Técnica</option>
              <option value="financeiro">Financeiro</option>
            </select>

            <label>Status</label>
            <div className="status">
              <input
                type="radio"
                name="radio"
                value="Aberto"
                onChange={handleOptionChange}
                checked={status === 'Aberto'}
              />
              <span>Em Aberto</span>
              <input
                type="radio"
                name="radio"
                value="Progresso"
                onChange={handleOptionChange}
                checked={status === 'Progresso'}
              />
              <span>Progresso</span>
              <input
                type="radio"
                name="radio"
                value="Atendido"
                onChange={handleOptionChange}
                checked={status === 'Atendido'}
              />
              <span>Atendido</span>
            </div>
            <label>Complemento</label>
            <textarea
              type="text"
              placeholder="Descreva seu problema (opcional)"
              value={complemento}
              onChange={e => setComplemento(e.target.value)}
            />
            <button type="submit">Registrar</button>
          </form>
        </div>
      </div>
    </div>
  );
}
