import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import LandingPage from "./pages/landingpage";
import DetailBerita from "./pages/detaiBerita.jsx";
import SplashVideo from "./components/SplashVideo.jsx";
import RegisterPage from "./components/register.jsx";
import LoginPage from "./components/login.jsx";
import UserDashboard from "./pages/user/Dashboard.jsx";
import FormDaftar from "./pages/user/FormDaftar.jsx";
import UserLayout from "./components/UserLayout.jsx";
import Submisi from "./pages/user/Submisi.jsx";
import ProfileUser from "./pages/Profile.jsx";
import AdminLayout from "./components/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/DashboardAdmin.jsx";
import SeleksiPeserta from "./pages/admin/Seleksi.jsx";
import ProfileAdmin from "./pages/Profile.jsx";
import Pengaturan from "./pages/admin/Pengaturan.jsx";
import DataPeserta from "./pages/admin/DataPeserta.jsx";
import PenilaianAdmin from "./pages/admin/PenilaianAdmin.jsx";
import JuriLayout from "./components/JuriLayout.jsx";
import DashboardJuri from "./pages/Juri/DashboardJuri.jsx";
import PenilaianJuri from "./pages/Juri/PenilaianJuri.jsx";
import ProfileJuri from "./pages/Profile.jsx";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/berita/:id" element={<DetailBerita />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/participant" element={
          <UserLayout>
            <UserDashboard />
          </UserLayout>
        } />
        <Route path="/FormDaftar" element={
          <UserLayout>
          <FormDaftar />
          </UserLayout>
          } />
          <Route path="/Submisi" element={
          <UserLayout>
          <Submisi />
          </UserLayout>
          } />
          <Route path="/Submisi" element={
          <UserLayout>
          <Submisi />
          </UserLayout>
          } />
          <Route path="/Submisi" element={
          <UserLayout>
          <Submisi />
          </UserLayout>
          } />
          <Route path="/Profile" element={
          <UserLayout>
          <ProfileUser />
          </UserLayout>
          } />
          <Route path="/admin/*" element={
          <AdminLayout>
            <AdminDashboard />
          </AdminLayout>
        } />
        <Route path="/admin/seleksi" element={
          <AdminLayout>
            <SeleksiPeserta />
          </AdminLayout>
        } />
        <Route path="/admin/penilaian" element={
          <AdminLayout>
            <PenilaianAdmin />
          </AdminLayout>
        } />
        <Route path="/admin/peserta" element={
          <AdminLayout>
            <DataPeserta />
          </AdminLayout>
        } />
        <Route path="/admin/pengaturan" element={
          <AdminLayout>
            <Pengaturan />
          </AdminLayout>
        } />
        <Route path="/admin/profile" element={
          <AdminLayout>
            <ProfileAdmin />
          </AdminLayout>
        } />
        <Route path="/Juri/*" element={
          <JuriLayout>
            <DashboardJuri />
          </JuriLayout>
        } />
        <Route path="/Juri/Penilaian" element={
          <JuriLayout>
            <PenilaianJuri />
          </JuriLayout>
        } />
        <Route path="/Juri/Profile" element={
          <JuriLayout>
            <ProfileJuri />
          </JuriLayout>
        } />
      </Routes>
    </Router>
  );
}

export default App;