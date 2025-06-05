import api from "../../api/axio";
import { ROUTES } from "../../utils/Constants/routes";
import { EliminarProductoProps } from "../../utils/types/ComandaTypes";
import styles from "./Producto.module.css";
import Button from "../Button/Button";
import { NAMES } from "../../utils/Constants/text";

function EliminarProducto({
  id,
  onProductoEliminado,
  className,
}: EliminarProductoProps) {
  const handleDelete = async () => {
    const confirmDelete = window.confirm(NAMES.PRODUCTO_ELIMINAR_CONFIRMACION);
    if (!confirmDelete) return;

    try {
      await api.delete(ROUTES.PRODUCT_DETAIL.replace(":id", id.toString()));
      onProductoEliminado(id, null);
    } catch (error: any) {
      console.error(NAMES.ALERTA_PRODUCTO_ELIMINAR, error);
      const apiErrorMessage =
        error.response?.data?.message || NAMES.ALERTA_PRODUCTO_ELIMINAR;
      onProductoEliminado(id, apiErrorMessage);
    }
  };

  return (
    <Button
      text={NAMES.ELIMINAR}
      onClick={handleDelete}
      className={`${styles.button} ${styles.deleteButton} ${className || ""}`}
    />
  );
}

export default EliminarProducto;
