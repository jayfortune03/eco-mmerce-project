import './App.css';
import 'react-toastify/dist/ReactToastify.css';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import { io } from 'socket.io-client';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './views/Home';
import Login from './views/Login';
import Register from './views/Register';
import AddNewProduct from './views/AddNewProduct';
import Products from './views/Products';
import ProductDetails from './views/ProductDetails';
import UserDashboard from './views/UserDashboard';
import Orders from './views/Orders';
import { checkToken } from './stores/action';
import ChatRoom from './views/ChatRoom';

const socket = io('http://localhost:4000');

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkToken());
  }, [dispatch]);

  return (
    <BrowserRouter>
      <div className="App">
        <ToastContainer />
        <Navbar />
        <Switch>
          <Route path="/" exact>
            <Home />
          </Route>
          <Route path="/products/:id">
            <ProductDetails socket={socket} />
          </Route>
          <Route path="/products">
            <Products />
          </Route>
          <Route path="/dashboard">
            <UserDashboard />
          </Route>
          <Route path="/chat/:targetId">
            <ChatRoom socket={socket} />
          </Route>
          <Route path="/login">
            <Login />
          </Route>
          <Route path="/register">
            <Register />
          </Route>
          <Route path="/seller" exact>
            <h1>Seller</h1>
          </Route>
          <Route path="/seller/login">
            <Login />
          </Route>
          <Route path="/seller/register">
            <Register />
          </Route>
          <Route path="/seller/addproduct">
            <AddNewProduct />
          </Route>
          <Route path="/seller/orders">
            <Orders />
          </Route>
        </Switch>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
