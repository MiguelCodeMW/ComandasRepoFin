import { useEffect, useState } from "react";
import { useDashboard } from "../../hooks/useDashboard";
import ConfigurarIVA from "../ConfigurarIVA/ConfigurarIVA";
import ConfigurarMoneda from "../ConfigurarMoneda/ConfigurarMoneda";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import Button from "../Button/Button";
import styles from "./Dashboard.module.css";
import { NAMES } from "../../utils/Constants/text";
import { ROUTES } from "../../utils/Constants/routes";
import DashboardComandasList from "./DashboardComandasList";

function Dashboard() {
  const {
    comandasFiltradas, // Comandas ya filtradas por estado (abiertas/cerradas).
    loading, // Estado de carga general.
    error, // Mensaje de error general.
    errorIva, // Mensaje de error específico del IVA.
    errorMoneda, // Mensaje de error específico de la moneda.
    mostrarPagadas, // Booleano para alternar entre comandas pagadas y pendientes.
    setMostrarPagadas, // Función para cambiar el estado de `mostrarPagadas`.
    showModalIva, // Booleano para mostrar/ocultar el modal de configuración de IVA.
    setShowModalIva, // Función para cambiar el estado de `showModalIva`.
    showModalMoneda, // Booleano para mostrar/ocultar el modal de configuración de moneda.
    setShowModalMoneda, // Función para cambiar el estado de `showModalMoneda`.
    iva, // Valor actual del IVA.
    moneda, // Símbolo de la moneda actual.
    user, // Datos del usuario logueado.
    handleLogout, // Función para cerrar sesión.
    handleIvaGuardado, // Función para guardar el IVA.
    handleMonedaGuardado, // Función para guardar la moneda.
  } = useDashboard();

  // Estado local para controlar la visibilidad de las opciones de administración.
  const [showAdminSettings, setShowAdminSettings] = useState(false);

  // si el usuario es administrador y el IVA y la moneda no están configurados.
  useEffect(() => {
    // Se activa solo para usuarios con rol de administrador.
    if (
      user?.role === NAMES.ROL_ADMIN &&
      iva === null && // Si el IVA no está cargado.
      moneda === null && // Si la moneda no está cargada.
      !loading && // Si ya terminó de cargar los datos iniciales.
      !errorIva && // Si no hay un error al cargar el IVA.
      !errorMoneda && // Si no hay un error al cargar la moneda.
      !showModalIva && // Si el modal de IVA no está ya visible.
      !showModalMoneda // Si el modal de Moneda no está ya visible.
    ) {
      setShowModalIva(true); // Muestra el modal para configurar el IVA.
    }
  }, [
    user,
    iva,
    moneda,
    loading,
    setShowModalIva,
    errorIva,
    errorMoneda,
    showModalIva,
    showModalMoneda,
  ]);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Si hay un error y no hay comandas filtradas (es decir, la carga inicial falló por completo),
  if (error && !comandasFiltradas.length && !loading) {
    return (
      <ErrorMessage
        message={error || NAMES.ERROR_CARGA} //
        onRetry={() => window.location.reload()}
      />
    );
  }

  return (
    <div className={styles.container}>
      {/* Header del Dashboard */}
      <header className={styles.header}>
        <h1>{NAMES.DASHBOARD_TITULO}</h1>
        <div className={styles.userInfoContainer}>
          {user && (
            <span className={styles.userInfo}>
              Hola, {user.name} ({user.role})
            </span>
          )}
          <Button
            onClick={handleLogout}
            text={NAMES.LOGOUT_BOTON}
            className={styles.logoutButton}
          />
        </div>
      </header>

      {/* Sección de Administración (solo visible para administradores) */}
      {user?.role === NAMES.ROL_ADMIN && (
        <div className={styles.adminSectionContainer}>
          <Button
            onClick={() => setShowAdminSettings(!showAdminSettings)}
            text={
              showAdminSettings ? NAMES.OCULTAR_AJUSTES : NAMES.MOSTRAR_AJUSTES
            }
            className={`${styles.headerButton} ${styles.settingsButton}`}
          />
          {showAdminSettings && (
            <div className={styles.adminButtonsContainer}>
              <Button
                onClick={() => setShowModalIva(true)}
                text={`${NAMES.CONFIGURAR_IVA} (Actual: ${
                  iva !== null
                    ? `${(iva * 100).toFixed(0)}%`
                    : NAMES.IVA_NO_CONFIGURADO
                })`}
                className={styles.headerButton}
              />
              <Button
                onClick={() => setShowModalMoneda(true)}
                text={`${NAMES.CONFIGURAR_MONEDA} (Actual: ${
                  moneda !== null ? moneda : NAMES.MONEDA_NO_CONFIGURADA
                })`}
                className={styles.headerButton}
              />
              <Button
                navigateTo={ROUTES.CATEGORY}
                text={NAMES.CATEGORIAS_BUTTON}
                className={styles.headerButton}
              />
              <Button
                navigateTo={ROUTES.PRODUCT}
                text={NAMES.CATEGORIAS_PRODUCTOS}
                className={styles.headerButton}
              />
              {errorIva && !showModalIva && (
                <p className={styles.inlineError}>{errorIva}</p>
              )}
              {errorMoneda && !showModalMoneda && (
                <p className={styles.inlineError}>{errorMoneda}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modales de Configuración (IVA y Moneda) */}
      {showModalIva && user?.role === NAMES.ROL_ADMIN && (
        <ConfigurarIVA
          onGuardado={async (nuevoIva) => {
            await handleIvaGuardado(nuevoIva);
          }}
          ivaActual={iva}
          onCancelar={() => {
            setShowModalIva(false);
          }}
          errorExterno={errorIva}
        />
      )}

      {showModalMoneda && user?.role === NAMES.ROL_ADMIN && (
        <ConfigurarMoneda
          onGuardado={async (nuevaMoneda) => {
            await handleMonedaGuardado(nuevaMoneda);
          }}
          monedaActual={moneda}
          onCancelar={() => {
            setShowModalMoneda(false);
          }}
          errorExterno={errorMoneda}
        />
      )}

      {/* Botones de Acción de Comandas */}
      <div className={styles.comandaActionButtonsContainer}>
        <Button
          onClick={() => setMostrarPagadas(!mostrarPagadas)}
          text={
            mostrarPagadas
              ? NAMES.DASHBOARD_VER_PENDIENTES
              : NAMES.DASHBOARD_VER_PAGADAS
          }
          className={styles.headerButton}
        />
        <Button
          navigateTo={ROUTES.CREATE_COMANDA}
          text={NAMES.CREAR_COMANDA}
          className={styles.headerButton}
        />
        <Button
          navigateTo={ROUTES.TOTAL_MESAS}
          text={NAMES.CONFIGURAR_MESAS}
          className={styles.headerButton}
        />
      </div>

      {/* Título de la Lista de Comandas */}
      <h2 className={styles.listTitle}>
        {mostrarPagadas
          ? NAMES.DASHBOARD_COMANDAS_PAGADAS
          : NAMES.DASHBOARD_COMANDAS_PENDIENTES}
      </h2>

      <DashboardComandasList
        comandas={comandasFiltradas}
        mostrarPagadas={mostrarPagadas}
      />
      {/* Mensaje de Error (si existe y hay comandas mostradas) */}
      {error && comandasFiltradas.length > 0 && (
        <p className={styles.inlineError}>{error}</p>
      )}
    </div>
  );
}

export default Dashboard;
