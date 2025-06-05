import { useNavigate } from "react-router-dom";
import Button from "../Button/Button";
import ProductoList from "./ProductoList";
import FormularioProducto from "./FormularioProducto";
import styles from "./Producto.module.css";
import { ROUTES } from "../../utils/Constants/routes";
import { NAMES } from "../../utils/Constants/text";
import { useGestionProductos } from "../../hooks/useGestionProductos";
import { ProductoProps } from "../../utils/types/ComandaTypes";

function GestionProductosPage() {
  const {
    productos, // Lista de todos los productos.
    categorias, // Lista de categorías disponibles (necesaria para el formulario de producto).
    mensaje, // Mensajes de éxito o información.
    error, // Mensajes de error.
    editandoProductoId, // ID del producto que se está editando (si aplica).
    productoEnEdicion, // Objeto completo del producto en edición.
    handleCrearProducto, // Función para manejar la creación de un nuevo producto.
    iniciarEdicionProducto, // Función para activar el modo de edición de un producto.
    cancelarEdicionProducto, // Función para cancelar el modo de edición.
    handleEditarProducto, // Función para manejar la actualización de un producto.
    handleProductoEliminadoCallback, // Callback para manejar el resultado de una eliminación.
    limpiarMensajes, // Función para limpiar los mensajes de estado (éxito/error).
  } = useGestionProductos();

  const navigate = useNavigate(); // Hook para la navegación programática.

  return (
    <div className={styles.gestionProductosContainer}>
      <h1 className={styles.pageTitle}>{NAMES.CATEGORIAS_PRODUCTOS}</h1>{" "}
      {/* Título de la página */}
      {/* Muestra mensajes de éxito si existen */}
      {mensaje && (
        <p className={`${styles.message} ${styles.successMessage}`}>
          {mensaje}
        </p>
      )}
      {/* Muestra mensajes de error si existen */}
      {error && (
        <p className={`${styles.message} ${styles.errorMessage}`}>{error}</p>
      )}
      {/* Formulario para Crear Nuevo Producto (solo visible si no se está editando) */}
      {!editandoProductoId && (
        <>
          <h2 className={styles.sectionTitle}>{NAMES.PRODUCTO_GUARDAR}</h2>
          <FormularioProducto
            onSubmit={async (producto) => {
              const { id, ...productoDataParaCrear } =
                producto as ProductoProps;
              return await handleCrearProducto(productoDataParaCrear);
            }}
            categoriasDisponibles={categorias}
            textoBotonSubmit={NAMES.PRODUCTO_GUARDAR}
            limpiarMensajesAlCambiar={limpiarMensajes}
          />
        </>
      )}
      <ProductoList
        productos={productos}
        categorias={categorias}
        editandoProductoId={editandoProductoId}
        productoEnEdicion={productoEnEdicion}
        onSetEditandoProductoId={iniciarEdicionProducto} // Callback para iniciar la edición de un producto.
        onDeleteProducto={handleProductoEliminadoCallback} // Callback para manejar la eliminación de un producto.
        onProductoEditado={handleEditarProducto} // Callback para manejar la actualización de un producto.
        onCancelarEdicion={cancelarEdicionProducto}
        limpiarMensajesAlCambiar={limpiarMensajes}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginTop: "var(--spacing-xl)",
        }}
      >
        <Button
          text={NAMES.VOLVER}
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className={`${styles.button} ${styles.backButton}`}
        />
      </div>
    </div>
  );
}

export default GestionProductosPage;
