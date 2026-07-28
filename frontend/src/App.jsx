import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Home from './pages/Home.jsx';
import ProductManager from './pages/ProductManager.jsx';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Login and Register pages removed */}
        <Route path="/manager" element={<ProductManager />} />
      </Routes>
      <Footer />
      <CartDrawer />
    </div>
  );
}
