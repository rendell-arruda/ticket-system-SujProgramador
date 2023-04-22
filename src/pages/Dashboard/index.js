import React from 'react';
import { AuthContext } from '../../context/auth';
import { useContext } from 'react';
import Header from '../../components/Header';

export default function Dashboard() {
  const { logout } = useContext(AuthContext);

  async function handleLogout() {
    await logout();
  }
  return (
    <div>
      <Header />
      <h1>Tela de Dashboard</h1>
      <button onClick={handleLogout}>Sair da conta</button>
    </div>
  );
}
