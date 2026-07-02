import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppLayout } from './components/layout/AppLayout';
import { LoginPage } from './components/auth/LoginPage';
import { DashboardPage } from './components/dashboard/DashboardPage';
import { LeadTablePage } from './components/leads/LeadTablePage';
import { LeadDetailPage } from './components/leads/LeadDetailPage';
import { PipelinePage } from './components/pipeline/PipelinePage';
import { StatsPage } from './components/stats/StatsPage';
import { CopysPage } from './components/copys/CopysPage';
import { OnboardingPage } from './components/onboarding/OnboardingPage';
import { UserManagementPage } from './components/users/UserManagementPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 10000 },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/leads" element={<LeadTablePage />} />
            <Route path="/leads/:id" element={<LeadDetailPage />} />
            <Route path="/pipeline" element={<PipelinePage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/copys" element={<CopysPage />} />
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/users" element={<UserManagementPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
