import { useState, useEffect, useCallback } from "react";
import api from "../api/axio";
import { CategoriaProps } from "../utils/types/CategoriaTypes";
import { ROUTES } from "../utils/Constants/routes";
import { NAMES } from "../utils/Constants/text";
import axios, { AxiosError } from "axios";

export function useGestionCategorias() {
  // listar, crear, editar y eliminar.
  const [categorias, setCategorias] = useState<CategoriaProps[]>([]); // Almacena la lista de todas las categorías.
  const [nombreNuevaCategoria, setNombreNuevaCategoria] = useState<string>(""); // Estado para el input de texto de la nueva categoría.
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [categoriaEnEdicion, setCategoriaEnEdicion] =
    useState<CategoriaProps | null>(null); // Almacena el objeto completo de la categoría que se está editando.

  const limpiarMensajes = () => {
    setMensaje(null);
    setError(null);
  };
  // `Obtienr todas las categorías
  // `useCallback` memoriza esta función para que no se recree en cada render, lo cual es importante para las dependencias de `useEffect`.
  const fetchCategorias = useCallback(async () => {
    try {
      limpiarMensajes;
      const response = await api.get(ROUTES.CATEGORY);
      setCategorias(response.data.categorias || response.data);
    } catch (err) {
      console.error(NAMES.ALERTA_CATEGORIA_CARGAR, err);
      setError(NAMES.ALERTA_CATEGORIA_CARGAR);
    }
  }, []);

  // `useEffect` se ejecuta una vez al montar el componente y cada vez que `fetchCategorias` cambia.
  useEffect(() => {
    fetchCategorias(); // Llama a la función para cargar las categorías.
  }, [fetchCategorias]); // Dependencia: `fetchCategorias` (memorizada con useCallback).

  // Recibe el nombre de la nueva categoría y devuelve un booleano indicando éxito o fracaso.
  const handleCrearCategoria = async (
    nombreCategoria: string
  ): Promise<boolean> => {
    limpiarMensajes();
    if (!nombreCategoria.trim()) {
      setError(NAMES.ALERTA_CATEGORIA_NOMBRE);
      return false;
    }

    // Validación: Comprueba si ya existe una categoría con el mismo nombre (sin distinguir mayúsculas/minúsculas).
    if (
      categorias.some(
        (cat) =>
          cat.nombre.toLowerCase() === nombreCategoria.toLowerCase().trim()
      )
    ) {
      setError(NAMES.ALERTA_CATEGORIA_DUPLICADA);
      return false;
    }

    try {
      // Intenta obtener el token de autenticación del almacenamiento local.
      const token = localStorage.getItem("token");
      if (!token) {
        setError(NAMES.USUARIO_NO_AUTENTICADO);
        return false;
      }

      await api.post(
        ROUTES.CATEGORY,
        { nombre: nombreCategoria },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMensaje(NAMES.CATEGORIA_EXITOSA);
      await fetchCategorias(); // Recarga la lista de categorías para incluir la nueva.
      return true; // Indica éxito.
    } catch (err) {
      console.error(err);
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<any>;
        setError(
          axiosError.response?.data?.message || NAMES.ALERTA_CATEGORIA_GUARDAR
        );
      } else {
        setError(NAMES.ERROR_INESPERADO);
      }
      return false; // Indica fracaso.
    }
  };

  const iniciarEdicion = (id: number) => {
    limpiarMensajes();
    const categoria = categorias.find((cat) => cat.id === id); // Busca la categoría por ID.
    if (categoria) {
      setEditandoId(id); // Establece el ID de la categoría que se está editando.
      setCategoriaEnEdicion(categoria); // Almacena la categoría completa en edición.
    }
  };

  const cancelarEdicion = () => {
    setEditandoId(null);
    setCategoriaEnEdicion(null);
    limpiarMensajes();
  };

  // Actualizar una categoría existente.
  // Recibe el ID de la categoría y el nuevo nombre, devuelve un booleano.
  const handleEditarCategoria = async (
    id: number,
    nuevoNombre: string
  ): Promise<boolean> => {
    limpiarMensajes();
    if (!nuevoNombre.trim()) {
      setError(NAMES.ALERTA_NOMBRE);
      return false;
    }

    // Validación: Comprueba si el nuevo nombre ya lo tiene OTRA categoría (excluyendo la que se está editando).
    const otraCategoriaExistente = categorias.some(
      (cat) =>
        cat.id !== id && // Asegura que no sea la misma categoría que estamos editando.
        cat.nombre.toLowerCase() === nuevoNombre.trim().toLowerCase()
    );
    if (otraCategoriaExistente) {
      setError(NAMES.ALERTA_CATEGORIA_DUPLICADA);
      return false;
    }

    try {
      // Intenta obtener el token de autenticación.
      const token = localStorage.getItem("token");
      if (!token) {
        setError(NAMES.USUARIO_NO_AUTENTICADO);
        return false;
      }
      await api.put(
        ROUTES.CATEGORY_DETAIL.replace(":id", id.toString()),
        { nombre: nuevoNombre },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Actualiza el estado local de categorías
      setCategorias((prev) =>
        prev.map((cat) =>
          cat.id === id ? { ...cat, nombre: nuevoNombre.trim() } : cat
        )
      );
      setMensaje(NAMES.CATEGORIA_ACTUALIZADA);
      cancelarEdicion();
      return true; // Indica éxito.
    } catch (err) {
      console.error(NAMES.ALERTA_CATEGORIA_ACTUALIZAR, err);
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<any>;
        setError(
          axiosError.response?.data?.message ||
            NAMES.ALERTA_CATEGORIA_ACTUALIZAR
        );
      } else {
        setError(NAMES.ERROR_INESPERADO);
      }
      return false;
    }
  };

  const handleEliminarCategoriaCallback = (
    id: number,
    errorMessage: string | null
  ) => {
    limpiarMensajes();
    if (errorMessage) {
      setError(errorMessage);
    } else {
      // Si no hay error, filtra la categoría eliminada del estado local.
      setCategorias((prev) => prev.filter((cat) => cat.id !== id));
      setMensaje(NAMES.CATEGORIA_ELIMINAR_EXITOSA);
    }
  };

  return {
    categorias, // Lista de todas las categorías.
    nombreNuevaCategoria, // Valor del input para una nueva categoría.
    setNombreNuevaCategoria, // Función para actualizar el input de nueva categoría.
    mensaje, // Mensaje de éxito.
    error, // Mensaje de error.
    editandoId, // ID de la categoría en edición.
    categoriaEnEdicion, // Objeto de la categoría en edición.
    fetchCategorias, // Función para recargar la lista de categorías.
    handleCrearCategoria, // Función para crear una categoría.
    iniciarEdicion, // Función para iniciar el modo edición.
    cancelarEdicion, // Función para cancelar el modo edición.
    handleEditarCategoria, // Función para guardar la edición.
    handleEliminarCategoriaCallback, // Función para manejar el resultado de la eliminación.
    limpiarMensajes, // Función para limpiar todos los mensajes.
  };
}
