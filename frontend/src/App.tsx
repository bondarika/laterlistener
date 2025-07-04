import './App.css';
import { BrowserRouter, Routes } from 'react-router-dom';

{
  /* 
  это для авторизации (переместить скорее всего надо будет)
import WebApp from '@twa-dev/sdk';
const params = new URLSearchParams(WebApp.initData);
const userData = JSON.parse(params.get('user') || 'null');
*/
}

function App() {
  return (
    <BrowserRouter>
      <Routes>{/*роутинг*/}</Routes>
    </BrowserRouter>
  );
}

export default App;
