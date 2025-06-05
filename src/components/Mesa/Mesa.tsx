import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axio";
import Button from "../Button/Button";
import LoadingSpinner from "../LoadingSpinner/LoadingSpinner";
import ErrorMessage from "../ErrorMessage/ErrorMessage";
import { ROUTES } from "../../utils/Constants/routes";
import { MesaData } from "../../utils/types/ComandaTypes";
import styles from "./TotalMesas.module.css";
import { NAMES } from "../../utils/Constants/text";
import { useDashboard } from "../../hooks/useDashboard";

function TotalMesas() {
  const navigate = useNavigate();
  const { user } = useDashboard();

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [totalMesasInput, setTotalMesasInput] = useState<string>("");
  const [mesasExistentes, setMesasExistentes] = useState<MesaData[]>([]);

  // Esto evita que el input se "resetee" al escribir
  const isInputInitialized = useRef(false);

  const limpiarMensajes = () => {
    setMensaje(null);
    setError(null);
  };

  // Esta función solo carga las mesas
  const fetchMesas = useCallback(async () => {
    setLoading(true);
    limpiarMensajes();
    try {
      const response = await api.get<MesaData[]>(ROUTES.MESAS);
      const fetchedMesas: MesaData[] = response.data;
      setMesasExistentes(fetchedMesas);

      // Solo inicializa el input una vez al cargar las mesas por primera vez
      if (!isInputInitialized.current) {
        setTotalMesasInput(fetchedMesas.length.toString());
        isInputInitialized.current = true;
      }
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message || err.message || NAMES.ERROR_CARGA_MESAS
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Efecto para la carga inicial de mesas
  useEffect(() => {
    fetchMesas();
  }, [fetchMesas]);

  const handleTotalMesasChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Permitir solo números y que el input pueda estar vacío temporalmente mientras se escribe.
    if (/^\d*$/.test(value)) {
      setTotalMesasInput(value);
    }
    limpiarMensajes();
  };

  const handleConfigurarMesas = async () => {
    limpiarMensajes();
    setLoading(true);

    const newTotal = parseInt(totalMesasInput, 10);
    if (isNaN(newTotal) || newTotal < 0) {
      setError(NAMES.ERROR_NUMERO_MESAS);
      setLoading(false);
      return;
    }

    if (user?.role !== NAMES.ROL_ADMIN) {
      setError("Solo los administradores pueden configurar las mesas.");
      setLoading(false);
      return;
    }

    const confirmacion = window.confirm(
      `¿Estás seguro de que quieres establecer el total de mesas a ${newTotal}? Esto podría eliminar o crear mesas.`
    );
    if (!confirmacion) {
      setLoading(false);
      return;
    }

    try {
      const response = await api.post(ROUTES.TOTAL_MESAS, {
        total_mesas: newTotal,
      });
      setMensaje(response.data.message || NAMES.MESAS_ACTUALIZADAS);
      await fetchMesas();
    } catch (err: any) {
      console.error(err);
      setError(
        err.response?.data?.message ||
          err.message ||
          NAMES.MESAS_ACTUALIZAR_ERROR
      );
    } finally {
      setLoading(false);
    }
  };

  const handleMesaClick = (mesa: MesaData) => {
    if (mesa.estado === "libre") {
      navigate(ROUTES.CREATE_COMANDA, { state: { selectedMesaId: mesa.id } });
    } else {
      console.log(`Mesa ${mesa.numero} está ocupada.`);
    }
  };

  const mesasLibres = mesasExistentes.filter(
    (mesa) => mesa.estado === "libre"
  ).length;
  const mesasOcupadas = mesasExistentes.filter(
    (mesa) => mesa.estado === "ocupada"
  ).length;

  const isAdmin = user?.role === NAMES.ROL_ADMIN;

  if (loading && !mesasExistentes.length && !error) {
    return <LoadingSpinner />;
  }

  if (error && !mesasExistentes.length && !loading) {
    // Si hay un error inicial y no hay mesas para mostrar
    return <ErrorMessage message={error} onRetry={fetchMesas} />;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{NAMES.CONFIGURACION_MESAS}</h1>

      {mensaje && (
        <p className={`${styles.message} ${styles.success}`}>{mensaje}</p>
      )}
      {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}

      {/* Formulario de configuración de mesas - visible SOLO para administradores */}
      {isAdmin && (
        <div className={styles.formGroup}>
          <label htmlFor="total-mesas-input" className={styles.label}>
            Número total de mesas:
          </label>
          <input
            id="total-mesas-input"
            type="number"
            min="0"
            value={totalMesasInput}
            onChange={handleTotalMesasChange}
            className={styles.input}
            disabled={loading || !isAdmin}
          />
          <Button
            text={NAMES.ACTUALIZAR}
            onClick={handleConfigurarMesas}
            className={`${styles.button} ${styles.pagarButton}`}
            disabled={
              loading ||
              totalMesasInput === "" ||
              parseInt(totalMesasInput) < 0 ||
              !isAdmin
            }
          />
        </div>
      )}
      {!isAdmin && ( // Mostrar mensaje de admin si no es admin
        <p className={styles.adminMessage}>{NAMES.ADMIN_MESAS_REQUERIDO}</p>
      )}

      {/* NUEVO: Resumen y listado en fila */}
      <div className={styles.detailsRow}>
        {/* Resumen del Estado Actual de las Mesas */}
        <div className={styles.mesaSummary}>
          <h3>{NAMES.ESTADO_ACTUAL_MESAS}</h3>
          <p>
            <strong>{NAMES.TOTAL_MESAS_ACTUAL}</strong> {mesasExistentes.length}
          </p>
          <p>
            <strong>{NAMES.MESAS_LIBRES}</strong> {mesasLibres}
          </p>
          <p>
            <strong>{NAMES.MESAS_OCUPADAS}</strong> {mesasOcupadas}
          </p>
        </div>

        {/* Listado Detallado de Mesas */}
        <div className={styles.mesaListContainer}>
          <h3>{NAMES.LISTADO_MESAS}</h3>
          {mesasExistentes.length === 0 && !loading ? (
            <p className={styles.message}>{NAMES.NO_MESAS_REGISTRADAS}</p>
          ) : (
            <ul className={styles.mesaList}>
              {mesasExistentes.map((mesa) => (
                <li
                  key={mesa.id}
                  className={`${styles.mesaItem} ${styles[mesa.estado]} ${
                    mesa.estado === "libre" ? styles.clickableMesa : ""
                  }`}
                  onClick={() => handleMesaClick(mesa)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={(e) => e.key === "Enter" && handleMesaClick(mesa)}
                >
                  {NAMES.MESA} {mesa.numero} - {NAMES.ESTADO}: {mesa.estado}
                </li>
              ))}
            </ul>
          )}
          {loading && mesasExistentes.length > 0 && <LoadingSpinner />}{" "}
        </div>
      </div>

      <Button
        text={NAMES.VOLVER}
        onClick={() => navigate(ROUTES.DASHBOARD)}
        className={`${styles.button} ${styles.dashboardButton}`}
      />
    </div>
  );
}

export default TotalMesas;
