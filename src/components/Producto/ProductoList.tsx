import { useState } from "react";
import EliminarProducto from "./EliminarProducto";
import Button from "../Button/Button";
import FormularioProducto from "./FormularioProducto";
import styles from "./Producto.module.css";
import { ProductoProps } from "../../utils/types/ComandaTypes";
import { NAMES } from "../../utils/Constants/text";
import { useDashboard } from "../../hooks/useDashboard";
import { ProductoListProps } from "../../utils/types/ComandaTypes";

function ProductoList({
  productos, // Lista de productos a mostrar.
  categorias, // Lista de categorías para asociar IDs a nombres.
  editandoProductoId, // ID del producto que actualmente está en modo edición.
  productoEnEdicion, // El objeto completo del producto que se está editando.
  onSetEditandoProductoId, // Callback para iniciar el modo de edición de un producto.
  onDeleteProducto, // Callback para manejar la eliminación de un producto.
  onProductoEditado, // Callback para manejar la actualización de un producto.
  onCancelarEdicion, // Callback para cancelar el modo de edición.
  limpiarMensajesAlCambiar, // Callback para limpiar mensajes del componente padre al interactuar con el formulario.
}: ProductoListProps) {
  const { moneda } = useDashboard();
  const [busqueda, setBusqueda] = useState("");

  const getCategoriaNombre = (categoriaId: number) => {
    const categoria = categorias.find((cat) => cat.id === categoriaId);
    return categoria ? categoria.nombre : NAMES.CATEGORIA_DESCONOCIDA;
  };

  const productosFiltrados = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className={styles.gestionProductosContainer}>
      {/* Título de la sección de gestión de productos */}
      {/* <h1 className={styles.pageTitle}>{NAMES.GESTIONAR_PRODUCTOS}</h1> */}

      {/* Contenedor del buscador de productos */}
      <div className={styles.buscadorContainer}>
        <input
          type="text"
          placeholder={NAMES.PRODUCTO_BUSCAR}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className={styles.input}
        />
      </div>

      {/* Título de la lista de productos */}
      <h2 className={styles.sectionTitle}>{NAMES.LISTA_PRODUCTOS}</h2>

      {/* Renderizado Condicional de la Lista de Productos */}
      {productos.length === 0 ? (
        // Si no hay productos en la lista general.
        <p className={`${styles.message} ${styles.infoMessage}`}>
          {NAMES.PRODUCTOS_NO_DISPONIBLES}
        </p>
      ) : productosFiltrados.length === 0 ? (
        // Si hay productos en general, pero ninguno coincide con la búsqueda.
        <p className={`${styles.message} ${styles.infoMessage}`}>
          {NAMES.COMANDA_BUSCAR_ERROR}
        </p>
      ) : (
        // Si hay productos y algunos coinciden con la búsqueda, muestra la lista.
        <ul className={styles.productList}>
          {productosFiltrados.map((producto) => (
            <li key={producto.id} className={styles.productItem}>
              {/* Renderizado Condicional: Modo Edición vs. Modo Visualización */}
              {editandoProductoId === producto.id && productoEnEdicion ? (
                // Si el producto actual está en modo edición, muestra el `FormularioProducto`.
                <FormularioProducto
                  productoInicial={productoEnEdicion}
                  categoriasDisponibles={categorias}
                  onSubmit={async (data) =>
                    await onProductoEditado(producto.id, data as ProductoProps)
                  }
                  onCancel={onCancelarEdicion}
                  textoBotonSubmit={NAMES.GUARDAR_CAMBIOS}
                  limpiarMensajesAlCambiar={limpiarMensajesAlCambiar}
                />
              ) : (
                // Si el producto no está en modo edición, muestra su información y botones de acción.
                <>
                  <div className={styles.productInfoText}>
                    <span className={styles.productName}>
                      {producto.nombre}
                    </span>
                    <div>
                      {NAMES.LABEL_PRECIO} {producto.precio.toFixed(2)}
                      <span className={styles.currencySymbol}>{moneda}</span>
                    </div>
                    <div>
                      {NAMES.LABEL_CATEGORIA}{" "}
                      {getCategoriaNombre(producto.categoria_id)}
                    </div>
                  </div>
                  <div className={styles.buttonGroup}>
                    <Button
                      text={NAMES.EDITAR}
                      onClick={() => onSetEditandoProductoId(producto.id)}
                      className={`${styles.button} ${styles.editButton}`}
                    />
                    <EliminarProducto
                      id={producto.id}
                      onProductoEliminado={onDeleteProducto}
                      className={`${styles.button} ${styles.deleteButton}`}
                    />
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ProductoList;
