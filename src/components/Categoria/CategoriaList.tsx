import EliminarCategoria from "./EliminarCategoria";
import Button from "../Button/Button";
import FormularioCategoria from "./FormularioCategoria";
import styles from "./Categoria.module.css";
import { NAMES } from "../../utils/Constants/text";
import { CategoriaListProps } from "../../utils/types/CategoriaTypes";

function CategoriaList({
  categorias, // La lista de categorías a mostrar.
  editandoId, // El ID de la categoría que actualmente se está editando (si hay alguna).
  categoriaEnEdicion, // El objeto completo de la categoría que se está editando.
  onEdit, // Función callback para iniciar el modo de edición de una categoría.
  onCategoriaEditada, // Función callback para manejar la edición de una categoría.
  onCancelar, // Función callback para cancelar el modo de edición.
  onEliminar, // Función callback para manejar la eliminación de una categoría.
  limpiarMensajesAlCambiar, // Función callback para limpiar mensajes cuando cambia el formulario.
}: CategoriaListProps) {
  // `CategoriaList` es un componente funcional que renderiza una lista de categorías.
  // Permite visualizar categorías, iniciar su edición, guardar cambios y eliminarlas.

  return (
    <ul className={styles.categoriaList}>
      {/* Mapea cada categoría en la lista para renderizar un elemento de lista. */}
      {categorias.map((categoria) => (
        <li key={categoria.id} className={styles.categoriaItem}>
          {editandoId === categoria.id && categoriaEnEdicion ? (
            <FormularioCategoria
              categoriaInicial={categoriaEnEdicion}
              onSubmit={async (nuevoNombre) => {
                return await onCategoriaEditada(categoria.id, nuevoNombre);
              }}
              onCancel={onCancelar}
              textoBotonSubmit={NAMES.GUARDAR_CAMBIOS}
              limpiarMensajesAlCambiar={limpiarMensajesAlCambiar}
            />
          ) : (
            // Si NO está en modo edición, muestra el nombre de la categoría y los botones de acción.
            <>
              <span className={styles.categoriaName}>{categoria.nombre}</span>
              <div className={styles.buttonGroup}>
                <Button
                  text={NAMES.EDITAR}
                  onClick={() => onEdit(categoria.id)}
                  className={`${styles.button} ${styles.edit}`}
                />
                <EliminarCategoria
                  id={categoria.id}
                  onCategoriaEliminada={onEliminar}
                  className={`${styles.button} ${styles.delete}`}
                />
              </div>
            </>
          )}
        </li>
      ))}
    </ul>
  );
}

export default CategoriaList;
