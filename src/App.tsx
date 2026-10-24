import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { ActivePatientProvider } from './context/ActivePatientContext';
import { AppRoutes } from './routes/AppRoutes';
import { DevRoleSwitcher } from './components/common/DevRoleSwitcher';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ActivePatientProvider>
          <BrowserRouter>
            <AppRoutes />
            <DevRoleSwitcher />
          </BrowserRouter>
        </ActivePatientProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
