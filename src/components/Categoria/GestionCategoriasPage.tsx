import { useNavigate } from "react-router-dom";
import Button from "../Button/Button";
import CategoriaList from "./CategoriaList";
import FormularioCategoria from "./FormularioCategoria";
import styles from "./Categoria.module.css";
import { ROUTES } from "../../utils/Constants/routes";
import { NAMES } from "../../utils/Constants/text";
import { useGestionCategorias } from "../../hooks/useGestionCategorias";

function GestionCategoriasPage() {
  const {
    categorias, // La lista de categorías.
    mensaje, // Mensaje de éxito/información.
    error, // Mensaje de error.
    editandoId, // ID de la categoría que se está editando.
    categoriaEnEdicion, // Objeto completo de la categoría en edición.
    handleCrearCategoria, // Función para crear una categoría.
    iniciarEdicion, // Función para iniciar el modo edición.
    cancelarEdicion, // Función para cancelar el modo edición.
    handleEditarCategoria, // Función para guardar los cambios de una categoría.
    handleEliminarCategoriaCallback, // Callback para manejar el resultado de una eliminación.
    limpiarMensajes, // Función para limpiar los mensajes de estado.
  } = useGestionCategorias();

  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>{NAMES.CATEGORIAS_BUTTON}</h1>

      {mensaje && (
        <p className={`${styles.message} ${styles.success}`}>{mensaje}</p>
      )}
      {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}

      {/* Formulario para Crear Nueva Categoría */}
      {/* Este formulario solo se muestra si NO hay ninguna categoría en modo de edición (`!editandoId`). */}
      {!editandoId && (
        <>
          <h2 className={styles.titleForm}>{NAMES.CATEGORIA_NUEVA}</h2>
          <FormularioCategoria
            onSubmit={async (nombreInput) => {
              const success = await handleCrearCategoria(nombreInput);
              return success;
            }}
            textoBotonSubmit={NAMES.CATEGORIA_GUARDAR}
            placeholder={NAMES.PLACEHOLDER_NOMBRE}
            limpiarMensajesAlCambiar={limpiarMensajes}
          />
        </>
      )}

      <h2 className={styles.titleList}>{NAMES.CATEGORIAS_LISTA}</h2>

      <CategoriaList
        categorias={categorias} // Pasa la lista de categorías.
        editandoId={editandoId} // Pasa el ID de la categoría en edición para controlar la UI.
        categoriaEnEdicion={categoriaEnEdicion} // Pasa el objeto completo de la categoría en edición para precargar el formulario.
        onEdit={iniciarEdicion} // Pasa la función para iniciar la edición de una categoría.
        onCategoriaEditada={handleEditarCategoria} // Pasa la función para manejar la actualización de una categoría.
        onCancelar={cancelarEdicion} // Pasa la función para cancelar la edición.
        onEliminar={handleEliminarCategoriaCallback} // Pasa la función para manejar el resultado de la eliminación.
        limpiarMensajesAlCambiar={limpiarMensajes} // Pasa la función para limpiar mensajes.
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
          className={styles.dashboardButton}
        />
      </div>
    </div>
  );
}

export default GestionCategoriasPage;
