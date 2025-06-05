import styles from "./ComandaDetalle.module.css";
import { NAMES } from "../../../utils/Constants/text";
import { useComandaDetalle } from "../../../hooks/useComandaDetalle";
import ComandaDetallesItemsList from "./ComandaDetallesItemsList";
import ComandaResumenTotales from "./ComandaResumenTotales";
import ComandaAccionesButtons from "./ComandaAccionesButtons";

function ComandaDetalle() {
  const {
    comanda, // El objeto de la comanda completa.
    subtotal, // El subtotal de la comanda (sin IVA).
    ivaPorcentaje, // El porcentaje de IVA aplicado.
    totalConIva, // El total final de la comanda (con IVA).
    mensaje,
    error,
    loading,
    user, // Información del usuario
    handleEditarComanda,
    handlePagarComanda,
    handleBorrarComanda,
  } = useComandaDetalle();

  if (loading) {
    return <div className={styles.message}>{NAMES.COMANDA_CARGANDO}</div>;
  }

  // Si hay un error o la comanda no se encontró, muestra un mensaje de error.
  if (error || !comanda) {
    return (
      <div className={styles.messageContainer}>
        {error ? `Error: ${error}` : NAMES.COMANDA_NO_ENCONTRADA}
      </div>
    );
  }

  const monedaDeComanda =
    comanda.moneda_aplicada || localStorage.getItem("moneda_global") || "€";

  return (
    <div className={styles.comandaDetalleContainer}>
      <h1 className={styles.comandaDetalleTitulo}>
        {NAMES.ID_COMANDA_TITULO} #{comanda.id}{" "}
      </h1>
      <p className={styles.comandaDetalleInfo}>Estado: {comanda.estado}</p>
      <p className={styles.comandaDetalleInfo}>
        Fecha: {new Date(comanda.fecha).toLocaleString()}{" "}
      </p>
      {/* Muestra el número de mesa si la comanda está asociada a una. */}
      {comanda.mesa && comanda.mesa.numero && (
        <p className={styles.comandaDetalleInfo}>
          {NAMES.MESA}: {comanda.mesa.numero}
        </p>
      )}

      {/* Componente para listar los ítems/productos de la comanda */}
      <ComandaDetallesItemsList
        detalles={comanda.detalles} // Pasa los detalles (productos) de la comanda.
        monedaComanda={monedaDeComanda} // Pasa la moneda para mostrar precios.
      />

      {/* Componente para mostrar el resumen de totales (subtotal, IVA, total) */}
      <ComandaResumenTotales
        subtotal={subtotal}
        ivaPorcentaje={ivaPorcentaje}
        totalConIva={totalConIva}
        monedaComanda={monedaDeComanda}
      />

      {/* Sección de Mensajes (éxito o error) */}
      {mensaje && (
        <p
          className={`${styles.message} ${
            error ? styles.error : styles.success
          }`}
        >
          {mensaje}
        </p>
      )}

      <ComandaAccionesButtons
        comanda={comanda} // Pasa el objeto de la comanda para la lógica de botones.
        user={user} // Pasa el usuario para la lógica de permisos.
        onEditar={handleEditarComanda} // Callback para la acción de editar.
        onPagar={handlePagarComanda} // Callback para la acción de pagar.
        onBorrar={handleBorrarComanda} // Callback para la acción de borrar.
      />
    </div>
  );
}

export default ComandaDetalle;
