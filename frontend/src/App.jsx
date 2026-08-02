import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/auth/Login";
import RegisterSchool from "./pages/auth/RegisterSchool";
import NotFound from "./pages/NotFound";

import SuperAdminDashboard from "./pages/superadmin/SuperAdminDashboard";
import Schools from "./pages/superadmin/Schools";

import AdminDashboard from "./pages/admin/AdminDashboard";
import Students from "./pages/admin/Students";
import StudentDetail from "./pages/admin/StudentDetail";
import Classes from "./pages/admin/Classes";
import Teachers from "./pages/admin/Teachers";
import Subjects from "./pages/admin/Subjects";
import Attendance from "./pages/admin/Attendance";
import Grades from "./pages/admin/Grades";
import Invoices from "./pages/admin/Invoices";

import TeacherDashboard from "./pages/teacher/TeacherDashboard";

import ParentDashboard from "./pages/parent/ParentDashboard";
import ParentChildDetail from "./pages/parent/ParentChildDetail";
import ParentInvoices from "./pages/parent/ParentInvoices";

function HomeRoute() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "SUPER_ADMIN") return <SuperAdminDashboard />;
  if (user.role === "ADMIN") return <AdminDashboard />;
  if (user.role === "TEACHER") return <TeacherDashboard />;
  if (user.role === "PARENT") return <ParentDashboard />;
  return <NotFound />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register-school" element={<RegisterSchool />} />

          <Route path="/" element={<HomeRoute />} />

          {/* Super admin */}
          <Route
            path="/schools"
            element={
              <ProtectedRoute roles={["SUPER_ADMIN"]}>
                <Schools />
              </ProtectedRoute>
            }
          />

          {/* Admin (school director) */}
          <Route
            path="/students"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <Students />
              </ProtectedRoute>
            }
          />
          <Route
            path="/students/:id"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <StudentDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/classes"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <Classes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/teachers"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <Teachers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/subjects"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <Subjects />
              </ProtectedRoute>
            }
          />

          {/* Shared admin + teacher */}
          <Route
            path="/attendance"
            element={
              <ProtectedRoute roles={["ADMIN", "TEACHER"]}>
                <Attendance />
              </ProtectedRoute>
            }
          />
          <Route
            path="/grades"
            element={
              <ProtectedRoute roles={["ADMIN", "TEACHER"]}>
                <Grades />
              </ProtectedRoute>
            }
          />
          <Route
            path="/invoices"
            element={
              <ProtectedRoute roles={["ADMIN"]}>
                <Invoices />
              </ProtectedRoute>
            }
          />

          {/* Parent */}
          <Route
            path="/children/:id"
            element={
              <ProtectedRoute roles={["PARENT"]}>
                <ParentChildDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/parent-invoices"
            element={
              <ProtectedRoute roles={["PARENT"]}>
                <ParentInvoices />
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
