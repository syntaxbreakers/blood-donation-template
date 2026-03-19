import { Routes, Route, Outlet } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';

// Pages
import { Home } from '../pages/Home';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { FindBlood } from '../pages/FindBlood';
import { Profile } from '../pages/Profile';
import { EditProfile } from '../pages/EditProfile';
import { About } from '../pages/About';
import { Feed } from '../pages/Feed';

// Layout wrapper
const MainLayout = () => {
  return (
    <div className="app-container">
      <Header />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="about" element={<About />} />
        <Route path="feed" element={<Feed />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
        <Route path="find-blood" element={<FindBlood />} />
        <Route path="profile" element={<Profile />} />
        <Route path="edit-profile" element={<EditProfile />} />
      </Route>
    </Routes>
  );
};
