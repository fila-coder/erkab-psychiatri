import { Routes, Route } from 'react-router-dom';
import { PublicLayout } from './layouts/PublicLayout';
import { AppLayout } from './layouts/AppLayout';
import { RequireAuth } from './components/RequireAuth';
import { Home } from './pages/Home';
import { Find } from './pages/Find';
import { HowItWorks } from './pages/HowItWorks';
import { Trust } from './pages/Trust';
import { ForPsychiatrists } from './pages/ForPsychiatrists';
import { Privacy } from './pages/Privacy';
import { Emergency } from './pages/Emergency';
import { Terms } from './pages/Terms';
import { Faq } from './pages/Faq';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { CancellationPolicy } from './pages/CancellationPolicy';
import { ProviderPublicProfile } from './pages/ProviderPublicProfile';
import { NotFound } from './pages/NotFound';
import { SignIn } from './pages/auth/SignIn';
import { SignUp } from './pages/auth/SignUp';
import { AccountRedirect } from './pages/AccountRedirect';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { Intake } from './pages/patient/Intake';
import { Book } from './pages/patient/Book';
import { ProviderDashboard } from './pages/provider/ProviderDashboard';
import { Application } from './pages/provider/Application';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Applications } from './pages/admin/Applications';
import { Pricing } from './pages/admin/Pricing';
import { Session } from './pages/session/Session';

const patientNav = [
  { to: '/patient', label: 'Overview' },
  { to: '/patient/intake', label: 'Intake' },
  { to: '/find', label: 'Find psychiatrist' },
];

const providerNav = [
  { to: '/provider', label: 'Overview' },
  { to: '/provider/application', label: 'Application' },
];

const adminNav = [
  { to: '/admin', label: 'Overview' },
  { to: '/admin/applications', label: 'Applications' },
  { to: '/admin/pricing', label: 'Pricing' },
];

export default function App() {
  return (
    <Routes>
      {/* Public marketing */}
      <Route element={<PublicLayout />}>
        <Route index element={<Home />} />
        <Route path="find" element={<Find />} />
        <Route path="psychiatrist/:providerId" element={<ProviderPublicProfile />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="cancellation-policy" element={<CancellationPolicy />} />
        <Route path="how-it-works" element={<HowItWorks />} />
        <Route path="trust" element={<Trust />} />
        <Route path="for-psychiatrists" element={<ForPsychiatrists />} />
        <Route path="privacy" element={<Privacy />} />
        <Route path="terms" element={<Terms />} />
        <Route path="faq" element={<Faq />} />
        <Route path="emergency" element={<Emergency />} />
        <Route path="auth/sign-in" element={<SignIn />} />
        <Route path="auth/sign-up" element={<SignUp />} />
        <Route path="*" element={<NotFound />} />
      </Route>

      <Route path="account" element={<AccountRedirect />} />
      <Route path="psychiatrist" element={<AccountRedirect />} />

      <Route
        path="session/:appointmentId"
        element={
          <RequireAuth roles={['PATIENT', 'PSYCHIATRIST', 'ADMIN']}>
            <AppLayout nav={[]} title="Session" />
          </RequireAuth>
        }
      >
        <Route index element={<Session />} />
      </Route>

      {/* Patient */}
      <Route
        path="patient"
        element={
          <RequireAuth roles={['PATIENT']}>
            <AppLayout nav={patientNav} title="Patient" />
          </RequireAuth>
        }
      >
        <Route index element={<PatientDashboard />} />
        <Route path="intake" element={<Intake />} />
      </Route>
      <Route
        path="patient/book/:providerId"
        element={
          <RequireAuth roles={['PATIENT']}>
            <AppLayout nav={patientNav} title="Patient" />
          </RequireAuth>
        }
      >
        <Route index element={<Book />} />
      </Route>

      {/* Psychiatrist */}
      <Route
        path="provider"
        element={
          <RequireAuth roles={['PSYCHIATRIST']}>
            <AppLayout nav={providerNav} title="Provider" />
          </RequireAuth>
        }
      >
        <Route index element={<ProviderDashboard />} />
        <Route path="application" element={<Application />} />
      </Route>

      {/* Admin */}
      <Route
        path="admin"
        element={
          <RequireAuth roles={['ADMIN']}>
            <AppLayout nav={adminNav} title="Admin" />
          </RequireAuth>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="applications" element={<Applications />} />
        <Route path="pricing" element={<Pricing />} />
      </Route>

    </Routes>
  );
}
