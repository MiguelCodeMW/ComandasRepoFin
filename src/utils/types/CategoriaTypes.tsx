// src/types/CategoriaTypes.ts

export type CategoriaProps = {
  id: number;
  nombre: string;
};

export type CategoriaListProps = {
  categorias: CategoriaProps[];
  editandoId: number | null;
  categoriaEnEdicion: CategoriaProps | null;
  onEdit: (id: number) => void;
  onCategoriaEditada: (id: number, nuevoNombre: string) => Promise<boolean>;
  onCancelar: () => void;
  onEliminar: (id: number, errorMessage: string | null) => void;
  limpiarMensajesAlCambiar?: () => void;
};

export type EliminarCategoriaProps = {
  id: number;
  onCategoriaEliminada: (id: number, errorMessage: string | null) => void;
  className?: string;
};

export type FormularioCategoriaProps = {
  onSubmit?: (nombre: string) => Promise<boolean>;
  onCancel?: () => void;
  categoriaInicial?: CategoriaProps | null;
  textoBotonSubmit?: string;
  placeholder?: string;
  limpiarMensajesAlCambiar?: () => void;
};
