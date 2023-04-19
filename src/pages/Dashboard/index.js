import React from 'react';
import { AuthContext } from '../../context/auth';
import { useContext } from 'react';

export default function Dashboard() {
  const { logout } = useContext(AuthContext);

  async function handleLogout() {
    await logout();
  }
  return (
    <div>
      <h1>Tela de Dashboard</h1>
      <button onClick={handleLogout}>Sair da conta</button>
    </div>
  );
}
