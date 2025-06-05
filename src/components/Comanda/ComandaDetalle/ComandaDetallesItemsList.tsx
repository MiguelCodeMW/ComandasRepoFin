import styles from "./ComandaDetalle.module.css";
import { NAMES } from "../../../utils/Constants/text";
import {
  ComandaDetalle,
  ComandaDetallesItemsListProps,
} from "../../../utils/types/ComandaTypes";

function ComandaDetallesItemsList({
  detalles, //productos en la comanda.
  monedaComanda,
}: ComandaDetallesItemsListProps) {
  if (detalles.length === 0) {
    return <p className={styles.message}>{NAMES.DETALLES_NO_DISPONIBLES}</p>;
  }

  return (
    <>
      <h2 className={styles.detallesTitulo}>{NAMES.DETALLES_TITULO}</h2>
      <ul className={styles.detallesLista}>
        {detalles.map((detalle: ComandaDetalle) => (
          <li key={detalle.id} className={styles.detalleItem}>
            <p className={styles.detalleInfo}>
              {NAMES.DETALLES_PRODUCTO} {detalle.producto.nombre}
            </p>
            <p className={styles.detalleInfo}>
              {NAMES.DETALLES_CANTIDAD} {detalle.cantidad}
            </p>
            <p className={styles.detalleInfo}>
              {NAMES.DETALLES_PRECIO_UNITARIO}{" "}
              {detalle.producto.precio.toFixed(2)} {monedaComanda}
            </p>
            <p className={styles.detalleInfo}>
              {NAMES.DETALLES_TOTAL}{" "}
              {(detalle.cantidad * detalle.producto.precio).toFixed(2)}{" "}
              {monedaComanda}
            </p>
          </li>
        ))}
      </ul>
    </>
  );
}

export default ComandaDetallesItemsList;
