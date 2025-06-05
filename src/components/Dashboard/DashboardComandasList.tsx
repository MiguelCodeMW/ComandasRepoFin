import { useNavigate } from "react-router-dom";
import styles from "./Dashboard.module.css";
import { ComandaDashboard } from "../../utils/types/ComandaTypes";
import { ROUTES } from "../../utils/Constants/routes";
import { NAMES } from "../../utils/Constants/text";
import { DashboardComandasListProps } from "../../utils/types/ComandaTypes";

function DashboardComandasList({
  comandas, // Lista de comandas a mostrar (ya filtradas por el hook `useDashboard`).
  mostrarPagadas, // Booleano que indica si se están mostrando comandas pagadas o pendientes.
}: DashboardComandasListProps) {
  const navigate = useNavigate();

  // Si no hay comandas en la lista
  if (comandas.length === 0) {
    return (
      <p className={styles.message}>
        {mostrarPagadas // Si `mostrarPagadas` es true, el mensaje es para comandas pagadas.
          ? NAMES.DASHBOARD_NO_COMANDAS_PAGADAS
          : NAMES.DASHBOARD_NO_COMANDAS_PENDIENTES}{" "}
        {/* Si es false, para pendientes. */}
      </p>
    );
  }

  return (
    <ul className={styles.list}>
      {comandas.map((comanda: ComandaDashboard) => (
        <li
          key={comanda.id}
          className={`${styles.item} ${styles[comanda.estado]}`}
          onClick={() =>
            navigate(
              ROUTES.COMANDA_DETAIL.replace(":id", comanda.id.toString())
            )
          }
        >
          {/* Muestra el número de comanda y, si tiene una mesa asignada, también el número de mesa. */}
          {comanda.mesa
            ? `${NAMES.COMANDA} - ${NAMES.MESA} ${comanda.mesa.numero}`
            : `${NAMES.COMANDA} #${comanda.id}`}{" "}
          {/* Si no tiene mesa, solo muestra "Comanda #ID". */}
          <p className={styles.itemText}>
            {NAMES.ESTADO}: {comanda.estado}
          </p>
          <p className={styles.itemText}>
            {NAMES.FECHA} {new Date(comanda.fecha).toLocaleString()}{" "}
          </p>
          {/* Muestra el nombre del usuario si está disponible en la comanda. */}
          {comanda.usuario?.name && (
            <p className={styles.itemText}>
              {NAMES.USUARIO} {comanda.usuario.name}
            </p>
          )}
          {/* Muestra el número de mesa si está asignada a la comanda. */}
          {comanda.mesa && comanda.mesa.numero && (
            <p className={styles.itemText}>
              {NAMES.MESA}: {comanda.mesa.numero}
            </p>
          )}
          {/* Muestra el total con IVA si está disponible. */}
          {comanda.total_con_iva !== undefined && (
            <p className={styles.itemText}>
              {NAMES.TOTAL} {comanda.total_con_iva.toFixed(2)}{" "}
              {/* Formatea el total a dos decimales. */}
              {comanda.moneda_aplicada || // Utiliza la moneda específica de la comanda si existe.
                localStorage.getItem("moneda_global") || // Si no, usa la moneda global del localStorage.
                "€"}{" "}
              {/* Si no hay ninguna, usa "€" por defecto. */}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

export default DashboardComandasList;
