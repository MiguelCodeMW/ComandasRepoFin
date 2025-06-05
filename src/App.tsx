import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import CreateUserForm from "./components/User/CreateUserForm";
import LoginForm from "./components/User/LoginForm";
import Dashboard from "./components/Dashboard";
import PrivateRoute from "./utils/PrivateRoute";
import ComandaDetails from "./components/Comanda/ComandaDetalle/ComandaDetalle";
import CrearComanda from "./components/Comanda/CrearComanda/CrearComanda";
import GestionCategoriasPage from "./components/Categoria/GestionCategoriasPage";
import FormularioCategoria from "./components/Categoria/FormularioCategoria";
import GestionProductosPage from "./components/Producto";
import FormularioProducto from "./components/Producto/FormularioProducto";
import TotalMesas from "./components/Mesa/Mesa";

import { ROUTES } from "./utils/Constants/routes";
import "./styles/global.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={ROUTES.LOGIN} />} />
        <Route path={ROUTES.LOGIN} element={<LoginForm />} />
        <Route path={ROUTES.CREATE_USER} element={<CreateUserForm />} />

        <Route
          path={ROUTES.DASHBOARD}
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path={ROUTES.COMANDA_DETAIL}
          element={
            <PrivateRoute>
              <ComandaDetails />
            </PrivateRoute>
          }
        />
        <Route
          path={ROUTES.CREATE_COMANDA}
          element={
            <PrivateRoute>
              <CrearComanda />
            </PrivateRoute>
          }
        />

        {/* Rutas para Categorías */}
        <Route
          path={ROUTES.CATEGORY}
          element={
            <PrivateRoute>
              <GestionCategoriasPage />
            </PrivateRoute>
          }
        />
        <Route
          path={ROUTES.CREATE_CATEGORY}
          element={
            <PrivateRoute>
              <FormularioCategoria />
            </PrivateRoute>
          }
        />

        <Route
          path={ROUTES.PRODUCT}
          element={
            <PrivateRoute>
              <GestionProductosPage />
            </PrivateRoute>
          }
        />
        <Route
          path={ROUTES.CREATE_PRODUCT}
          element={
            <PrivateRoute>
              <FormularioProducto />
            </PrivateRoute>
          }
        />

        <Route
          path={ROUTES.TOTAL_MESAS}
          element={
            <PrivateRoute>
              <TotalMesas />
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
