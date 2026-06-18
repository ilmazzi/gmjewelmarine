import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';

// Public pages
import PublicLayout from '@/components/layout/PublicLayout';
import Home from '@/pages/Home';
import Catalog from '@/pages/Catalog';
import ListingDetail from '@/pages/ListingDetail';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import SectionPage from '@/pages/SectionPage';
import BrandPage from '@/pages/BrandPage';
import NewsPage from '@/pages/NewsPage';
import NewsDetail from '@/pages/NewsDetail';
import Login from '@/pages/Login';

// Admin pages
import AdminLayout from '@/pages/admin/AdminLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminListings from '@/pages/admin/AdminListings';
import AdminListingForm from '@/pages/admin/AdminListingForm';
import AdminCategories from '@/pages/admin/AdminCategories';
import AdminMessages from '@/pages/admin/AdminMessages';
import AdminSettings from '@/pages/admin/AdminSettings';
import AdminBrands from '@/pages/admin/AdminBrands';
import AdminNews from '@/pages/admin/AdminNews';
import AdminUsers from '@/pages/admin/AdminUsers';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white">
        <div className="w-10 h-10 border-2 border-border border-t-signal rounded-full animate-spin"></div>
      </div>
    );
  }

  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    }
  }

  return (
    <Routes>
      {/* Public site */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/catalogo" element={<Catalog />} />
        <Route path="/sezione/:section" element={<SectionPage />} />
        <Route path="/sezione/:section/:brand" element={<BrandPage />} />
        <Route path="/annuncio/:id" element={<ListingDetail />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/news/:id" element={<NewsDetail />} />
        <Route path="/chi-siamo" element={<AboutPage />} />
        <Route path="/contatti" element={<ContactPage />} />
      </Route>

      <Route path="/login" element={<Login />} />

      {/* Admin CMS */}
      <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/login" replace />} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="annunci" element={<AdminListings />} />
          <Route path="annunci/:id" element={<AdminListingForm />} />
          <Route path="categorie" element={<AdminCategories />} />
          <Route path="messaggi" element={<AdminMessages />} />
          <Route path="marchi" element={<AdminBrands />} />
          <Route path="news" element={<AdminNews />} />
          <Route path="utenti" element={<AdminUsers />} />
          <Route path="impostazioni" element={<AdminSettings />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App