import styles from "../Comanda/CrearComanda/Comandas.module.css";
import { ProductoSelectorListProps } from "../../utils/types/ComandaTypes";

import { NAMES } from "../../utils/Constants/text";
import { useDashboard } from "../../hooks/useDashboard";

function ProductoSelectorList({
  productos, // La lista de productos a mostrar para la selección.
  onProductoClick,
}: ProductoSelectorListProps) {
  const { moneda } = useDashboard();

  if (productos.length === 0) {
    return <p className={styles.message}>{NAMES.PRODUCTOS_NO_DISPONIBLES}</p>;
  }

  return (
    <ul className={styles.productosLista}>
      {productos.map((producto) => (
        <li
          key={producto.id}
          className={styles.productoItem}
          onClick={() => onProductoClick(producto)}
        >
          <div className={styles.productoInfo}>{producto.nombre}</div>{" "}
          <div className={styles.productoPrecio}>
            {producto.precio.toFixed(2)} {moneda}{" "}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default ProductoSelectorList;
