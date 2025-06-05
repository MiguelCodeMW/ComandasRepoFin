import { useState, useEffect, useCallback, useMemo } from "react";
import api from "../api/axio";
import { ProductoProps, NuevoProductoData } from "../utils/types/ComandaTypes";
import { CategoriaProps } from "../utils/types/CategoriaTypes";
import { ROUTES } from "../utils/Constants/routes";
import { NAMES } from "../utils/Constants/text";

export function useGestionProductos() {
  const [productos, setProductos] = useState<ProductoProps[]>([]); // Almacena la lista de todos los productos.
  const [categorias, setCategorias] = useState<CategoriaProps[]>([]); // Almacena la lista de todas las categorías disponibles.
  const [mensaje, setMensaje] = useState<string | null>(null); // Mensajes de éxito o informativos para el usuario.
  const [error, setError] = useState<string | null>(null);

  const [nuevoProducto, setNuevoProducto] = useState<NuevoProductoData>({
    nombre: "",
    precio: 0,
    categoria_id: 0,
  });

  const [editandoProductoId, setEditandoProductoId] = useState<number | null>(
    null
  ); // ID del producto que se está editando (null si no hay edición).
  const [productoEnEdicion, setProductoEnEdicion] =
    useState<ProductoProps | null>(null);

  const [busqueda, setBusqueda] = useState("");

  const limpiarMensajes = () => {
    setMensaje(null);
    setError(null);
  };

  const fetchProductos = useCallback(async () => {
    limpiarMensajes();
    try {
      const response = await api.get(ROUTES.PRODUCT);
      setProductos(response.data.productos || response.data);
    } catch (err) {
      console.error(err);
      setError(NAMES.ALERTA_PRODUCTO_CARGAR);
    }
  }, []);

  const fetchCategorias = useCallback(async () => {
    try {
      const response = await api.get(ROUTES.CATEGORY);
      setCategorias(response.data.categorias || response.data);
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Se ejecuta una vez al montar el componente y cada vez que `fetchProductos` o `fetchCategorias` cambian.
  useEffect(() => {
    fetchProductos(); // Carga los productos.
    fetchCategorias(); // Carga las categorías.
  }, [fetchProductos, fetchCategorias]); // Dependencias: ambas funciones de fetch.

  const limpiarFormularioCreacion = () => {
    setNuevoProducto({ nombre: "", precio: 0, categoria_id: 0 });
  };

  const handleCrearProducto = async (productoData: NuevoProductoData) => {
    limpiarMensajes();

    //Comprueba si ya existe un producto con el mismo nombre (sin distinguir mayúsculas/minúsculas).
    const productoExistente = productos.some(
      (p) => p.nombre.toLowerCase() === productoData.nombre.trim().toLowerCase()
    );
    if (productoExistente) {
      setError(NAMES.ALERTA_PRODUCTO_DUPLICADO);
      return false; // Indica fallo en la creación.
    }

    // Comprueba que los campos requeridos no estén vacíos o inválidos.
    if (
      !productoData.nombre.trim() ||
      productoData.precio <= 0 ||
      !productoData.categoria_id
    ) {
      setError(NAMES.ALERTA_PRODUCTO_CAMPOS_REQUERIDOS);
      return false; // Indica fallo.
    }

    try {
      const response = await api.post(ROUTES.PRODUCT, productoData);
      setProductos((prev) => [
        ...prev,
        response.data.producto || response.data,
      ]);
      setMensaje(NAMES.PRODUCTO_EXITOSO);
      limpiarFormularioCreacion();
      return true; // Indica éxito.
    } catch (err: any) {
      setError(err.response?.data?.message || NAMES.ALERTA_PRODUCTO_GUARDAR);
      console.error(NAMES.ALERTA_PRODUCTO_GUARDAR, err);
      return false; // Indica fracaso.
    }
  };

  const iniciarEdicionProducto = (id: number) => {
    limpiarMensajes();
    const producto = productos.find((p) => p.id === id);
    if (producto) {
      setEditandoProductoId(id);
      setProductoEnEdicion(producto); // Almacena el objeto completo del producto en edición.
    }
  };

  const cancelarEdicionProducto = () => {
    setEditandoProductoId(null);
    setProductoEnEdicion(null);
    limpiarMensajes();
  };

  const handleEditarProducto = async (
    id: number,
    productoData: ProductoProps
  ) => {
    limpiarMensajes();
    if (
      !productoData.nombre.trim() ||
      productoData.precio <= 0 ||
      !productoData.categoria_id
    ) {
      setError(NAMES.ALERTA_PRODUCTO_CAMPOS_REQUERIDOS);
      return false; // Indica fallo.
    }

    // Validación: Comprueba si el nuevo nombre ya lo tiene OTRO producto (excluyendo el que se está editando).
    const otroProductoExistente = productos.some(
      (p) =>
        p.id !== id && // Asegura que no sea el mismo producto que estamos editando.
        p.nombre.toLowerCase() === productoData.nombre.trim().toLowerCase()
    );
    if (otroProductoExistente) {
      setError(NAMES.ALERTA_PRODUCTO_DUPLICADO);
      return false; // Indica fallo.
    }

    try {
      await api.put(
        ROUTES.PRODUCT_DETAIL.replace(":id", id.toString()),
        productoData
      );
      // Actualiza el estado local de `productos`: mapea la lista y reemplaza el producto editado por los nuevos datos.
      setProductos((prev) => prev.map((p) => (p.id === id ? productoData : p)));
      setMensaje(NAMES.PRODUCTO_ACTUALIZADO);
      cancelarEdicionProducto();
      return true; // Indica éxito.
    } catch (err: any) {
      setError(err.response?.data?.message);
      console.error(err);
      return false;
    }
  };

  const handleProductoEliminadoCallback = (
    id: number,
    errorMessage: string | null
  ) => {
    limpiarMensajes();
    if (errorMessage) {
      setError(errorMessage);
    } else {
      // Si no hay error, filtra el producto eliminado del estado local de `productos`.
      setProductos((prev) => prev.filter((p) => p.id !== id));
      setMensaje(NAMES.PRODUCTO_ELIMINAR_EXITOSA);
    }
  };

  // `productosFiltrados`: Utiliza `useMemo` para memorizar el resultado del filtro de productos.
  // Esto previene que la lista se recalcule en cada render si `productos` o `busqueda` no han cambiado, optimizando el rendimiento.
  const productosFiltrados = useMemo(() => {
    // Filtra la lista de `productos` basándose en el texto de `busqueda`.
    return productos.filter(
      (p) => p.nombre.toLowerCase().includes(busqueda.toLowerCase()) // Compara nombres sin distinguir mayúsculas/minúsculas.
    );
  }, [productos, busqueda]); // Dependencias: la lista `productos` y el texto de `busqueda`.

  return {
    productos, // Lista completa de productos (sin filtrar).
    categorias, // Lista de categorías.
    mensaje, // Mensaje de éxito.
    error, // Mensaje de error.
    nuevoProducto, // Estado del formulario de creación.
    setNuevoProducto, // Función para actualizar el estado del formulario de creación.
    editandoProductoId, // ID del producto en edición.
    productoEnEdicion, // Objeto del producto en edición.
    fetchProductos, // Función para recargar los productos.
    fetchCategorias, // Función para recargar las categorías.
    handleCrearProducto, // Función para crear un producto.
    iniciarEdicionProducto, // Función para iniciar el modo edición.
    cancelarEdicionProducto, // Función para cancelar el modo edición.
    handleEditarProducto, // Función para guardar la edición.
    handleProductoEliminadoCallback, // Callback para manejar la eliminación.
    limpiarMensajes, // Función para limpiar todos los mensajes.
    busqueda, // Texto de búsqueda.
    setBusqueda, // Función para actualizar el texto de búsqueda.
    productosFiltrados, // Lista de productos filtrados (resultado de la búsqueda).
  };
}
