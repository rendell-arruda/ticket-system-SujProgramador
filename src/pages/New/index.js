import { useState, useEffect, useContext } from 'react';
import './new.css';
import Header from '../../components/Header';
import Title from '../../components/Title';
import { FiPlusCircle } from 'react-icons/fi';
import { AuthContext } from '../../context/auth';
import { db } from '../../services/firebaseConnection';
import { collection, getDocs, getDoc, doc, addDoc } from 'firebase/firestore';
import { toast } from 'react-toastify';
import { useParams } from 'react-router-dom';

const listRef = collection(db, 'customers');

export default function New() {
  const { user } = useContext(AuthContext);
  const { id } = useParams();

  //lista de clientes que virá do firebase
  const [customers, setCustomers] = useState([]);

  const [complemento, setComplemento] = useState('');
  const [assunto, setAssunto] = useState('Suporte');
  const [status, setStatus] = useState('Aberto');

  //carregando os clientes
  const [loadCustomers, setLoadCustomers] = useState(true);
  //cliente selecionado
  const [customerSelected, setCustomerSelected] = useState(0);

  //quando adicionar ou quando atualizar
  const [idCustomer, setIdCustomer] = useState(false);

  //carregando os clientes ao abrir a pagina
  useEffect(() => {
    async function loadCustomers() {
      const querySnapshot = await getDocs(listRef)
        .then(snapshot => {
          let lista = [];
          //percorrendo a lista de clientes que veio pelo snapshot
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

          if (id) {
            loadId(lista);
          }
        })
        .catch(error => {
          console.log('Erro ao buscar os clientes ', error);
          setLoadCustomers(false);
          setCustomers([{ id: 1, nomeFantasia: 'Freela' }]);
        });
    }
    loadCustomers();
  }, [id]);

  async function loadId(lista) {
    const docRef = doc(db, 'chamados', id);
    await getDoc(docRef)
      .then(snapshot => {
        setAssunto(snapshot.data().assunto);
        setStatus(snapshot.data().status);
        setComplemento(snapshot.data().complemento);

        let index = lista.findIndex(
          item => item.id === snapshot.data().clienteId
        );

        setCustomerSelected(index);
        setIdCustomer(true);
      })
      .catch(error => {
        console.log(error);
        setIdCustomer(false);
      });
  }

  // atualiza a usestate do status do chamado
  function handleOptionChange(e) {
    setStatus(e.target.value);
  }
  //atualiza o assunto do chamado
  function handleChangeSelect(e) {
    setAssunto(e.target.value);
  }

  function handleChangeCustomer(e) {
    setCustomerSelected(e.target.value);
  }

  async function handleRegister(e) {
    e.preventDefault();
    if (idCustomer) {
      alert('tem id, editando chamado');
      return;
    }
    //registrar um chamado
    await addDoc(collection(db, 'chamados'), {
      created: new Date(),
      cliente: customers[customerSelected].nomeFantasia,
      clienteId: customers[customerSelected].id,
      assunto: assunto,
      complemento: complemento,
      status: status,
      userId: user.uid
    })
      .then(() => {
        toast.success('Chamado registrado com sucesso!');
        //deixar o complemento vazio
        setComplemento('');
        //deixar o status em aberto que é o padrão
        setCustomerSelected(0);
      })
      .catch(error => {
        toast.error('Erro ao registrar, tente mais tarde!');
        console.log('Erro ao registrar o chamado', error);
      });
  }

  return (
    <div>
      <Header />
      <div className="content">
        <Title name="Novo chamado">
          <FiPlusCircle size={25} />
        </Title>

        <div className="container">
          <form className="form-profile" onSubmit={handleRegister}>
            <label>Clientes</label>
            {/* se estiver carregando os clientes, aparece a mensagem */}
            {loadCustomers ? (
              <input
                type="text"
                disabled={true}
                value="Carregando clientes..."
              />
            ) : (
              //se não estiver carregando os clientes, aparece o select
              <select value={customerSelected} onChange={handleChangeCustomer}>
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
                // a bolinha estar marcada com o status
                checked={status === 'Aberto'}
              />
              <span>Em Aberto</span>
              <input
                type="radio"
                name="radio"
                value="Progresso"
                onChange={handleOptionChange}
                // a bolinha estar marcada com o status
                checked={status === 'Progresso'}
              />
              <span>Progresso</span>
              <input
                type="radio"
                name="radio"
                value="Atendido"
                onChange={handleOptionChange}
                // a bolinha estar marcada com o status
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
