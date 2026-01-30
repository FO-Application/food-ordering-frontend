import './styles/global.css';
import { Routes, Route } from 'react-router-dom';
import Header from './modules/Core/components/Header/Header';
import Footer from './modules/Core/components/Footer/Footer';
import HomePage from './modules/Home/pages/HomePage';
import Cuisines from './modules/Cuisines/pages/Cuisines/Cuisines';
import RestaurantDetail from './modules/Restaurant/pages/RestaurantDetail/RestaurantDetail';

function App() {
  return (
    <div className="app">
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/cuisines/:slug" element={<Cuisines />} />
        <Route path="/restaurant/:slug" element={<RestaurantDetail />} />
      </Routes>
      <Footer />
    </div>
  );
}

export default App;
