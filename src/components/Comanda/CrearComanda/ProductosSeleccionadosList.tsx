import styles from "./Comandas.module.css";
import { NAMES } from "../../../utils/Constants/text";
import {
  ProductosSeleccionadosListProps,
  ProductoSeleccionado,
} from "../../../utils/types/ComandaTypes";
import { useDashboard } from "../../../hooks/useDashboard";
import Button from "../../Button/Button";
function ProductosSeleccionadosList({
  productos,
  onAumentar,
  onDisminuir,
}: ProductosSeleccionadosListProps) {
  const { moneda } = useDashboard();
  if (productos.length === 0) {
    return <p className={styles.message}>No hay productos seleccionados.</p>;
  }

  return (
    <ul className={styles.seleccionadosLista}>
      {productos.map((producto: ProductoSeleccionado) => (
        <li key={producto.id} className={styles.seleccionadoItem}>
          <div className={styles.selectableWrapper}>
            <span className={styles.seleccionadoInfo}>
              {producto.nombre} - {NAMES.DETALLES_CANTIDAD} {producto.cantidad}{" "}
              - {NAMES.LABEL_PRECIO} {producto.precio.toFixed(2)} {moneda} -{" "}
              {NAMES.COMANDA_PRECIO_TOTAL}
              {(producto.precio * producto.cantidad).toFixed(2)} {moneda}
            </span>
            <div className={styles.seleccionadoControles}>
              <Button
                text="+"
                onClick={() => onAumentar(producto.id)}
                className={styles.controlBtn} // Mantén la clase CSS para los estilos
              />
              <Button
                text="−"
                onClick={() => onDisminuir(producto.id)}
                className={styles.controlBtn} // Mantén la clase CSS para los estilos
              />
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

export default ProductosSeleccionadosList;
