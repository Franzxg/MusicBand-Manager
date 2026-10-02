import { BrowserRouter, Route, Routes } from 'react-router-dom'
import AppLayout from './components/AppLayout'
import DatesProvider from './components/DatesProvider'
import { GuestRoute, ProtectedRoute } from './components/RouteGuards'
import AuthProvider from './context/AuthProvider'
import LanguageProvider from './context/LanguageProvider'
import NotificationProvider from './context/NotificationProvider'
import ThemeModeProvider from './context/ThemeModeProvider'
import BandPage from './pages/BandPage'
import DashboardPage from './pages/DashboardPage'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import GuidePage from './pages/GuidePage'
import LivePage from './pages/LivePage'
import LoginPage from './pages/LoginPage'
import NotFoundPage from './pages/NotFoundPage'
import ProfilePage from './pages/ProfilePage'
import RegisterPage from './pages/RegisterPage'
import ResetPasswordPage from './pages/ResetPasswordPage'

export default function App() {
  return (
    <ThemeModeProvider>
      <LanguageProvider>
        <DatesProvider>
          <NotificationProvider>
            <BrowserRouter>
              <AuthProvider>
                <Routes>
                  <Route element={<GuestRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                  </Route>
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/guide" element={<GuidePage />} />
  
                  <Route element={<ProtectedRoute />}>
                    <Route element={<AppLayout />}>
                      <Route path="/" element={<DashboardPage />} />
                      <Route path="/bands/:bandId" element={<BandPage />} />
                      <Route path="/bands/:bandId/lives/:liveId" element={<LivePage />} />
                      <Route path="/profile" element={<ProfilePage />} />
                    </Route>
                  </Route>
  
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </AuthProvider>
            </BrowserRouter>
          </NotificationProvider>
        </DatesProvider>
      </LanguageProvider>
    </ThemeModeProvider>
  )
}
