import { useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import api from "../api/axio";
import {
  ProductoProps,
  ProductoSeleccionado,
  MesaData,
  ComandaData,
} from "../utils/types/ComandaTypes";
import { CategoriaProps } from "../utils/types/CategoriaTypes";
import { ROUTES } from "../utils/Constants/routes";
import { NAMES } from "../utils/Constants/text";

export function useCrearComanda() {
  // Define un hook personalizado para la lógica de creación/edición de comandas.

  // Estados para almacenar los datos que se obtienen del backend o se manejan en el UI.
  const [categorias, setCategorias] = useState<CategoriaProps[]>([]); // Estado para almacenar la lista de categorías de productos.
  const [productos, setProductos] = useState<ProductoProps[]>([]); // Estado para almacenar la lista de productos disponibles.
  const [productosSeleccionados, setProductosSeleccionados] = useState<
    ProductoSeleccionado[]
  >([]); // Estado para los productos que el usuario ha añadido a la comanda, incluyendo su cantidad.
  const [userId, setUserId] = useState<number | null>(null); // Estado para almacenar el ID del usuario logueado.

  const [searchParams] = useSearchParams(); // Hook para leer parámetros de consulta de la URL.
  const navigate = useNavigate();
  const location = useLocation(); // Hook para acceder al objeto 'location', que incluye el estado de navegación.

  // Extrae el ID de la comanda de los parámetros de búsqueda de la URL.
  // Será 'null' si estamos creando una nueva comanda y hay un ID si estamos editando.
  const comandaIdParaEditar = searchParams.get("id");

  //Estados para mensajes y carga
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  //Estados específicos para el IVA
  const [ivaActualComanda, setIvaActualComanda] = useState<number | null>(null);
  const [loadingIvaComanda, setLoadingIvaComanda] = useState<boolean>(true);
  const [errorIvaComanda, setErrorIvaComanda] = useState<string | null>(null);
  const [mesasDisponibles, setMesasDisponibles] = useState<MesaData[]>([]);
  const [mesaSeleccionadaId, setMesaSeleccionadaId] = useState<number | null>(
    null
  );
  const [loadingMesas, setLoadingMesas] = useState<boolean>(true);
  const [errorMesas, setErrorMesas] = useState<string | null>(null);
  const [initialSelectedMesaId, setInitialSelectedMesaId] = useState<
    number | null
  >(null);

  // useEffect para obtener initialSelectedMesaId usando `useLocation`
  // Este efecto se ejecuta cuando cambia `location.state`.
  useEffect(() => {
    // `location.state` es el objeto que contiene el estado pasado con `Maps` (ej. navigate('/ruta', { state: { miDato: 'valor' } }))
    const state = location.state as { selectedMesaId?: number } | undefined;

    // Si existe un estado y contiene `selectedMesaId` que es un número, lo usa.
    if (state && typeof state.selectedMesaId === "number") {
      setInitialSelectedMesaId(state.selectedMesaId);
      // Limpia el estado de navegación. Previene que si el usuario navega a otra página y luego vuelve a esta (con el botón de atrás), la mesa no se preseleccione de nuevo si no se desea.
      navigate(ROUTES.CREATE_COMANDA, { replace: true, state: {} });
    }
  }, [location.state, navigate]); // Dependencias: `location.state` para reaccionar a cambios en el estado de navegación y `Maps` para la función de navegación.

  // Función para limpiar los mensajes de éxito y error.
  const limpiarMensajes = () => {
    setMensaje(null);
    setError(null);
  };

  // Función para obtener el IVA global desde el backend
  // `useCallback` memoriza esta función para que no se recree innecesariamente en cada render,
  const fetchIvaForComanda = useCallback(async () => {
    setLoadingIvaComanda(true);
    setErrorIvaComanda(null);
    try {
      const res = await api.get(ROUTES.GET_IVA);
      const ivaObtenido = res.data.iva;

      if (ivaObtenido !== undefined && ivaObtenido !== null) {
        setIvaActualComanda(Number(ivaObtenido));
      } else {
        setIvaActualComanda(0.21);
      }
    } catch (err: any) {
      console.error(NAMES.ERROR_IVA, err);
      setErrorIvaComanda(NAMES.IVA_NO_CONFIGURADO);
      setIvaActualComanda(0.21);
    } finally {
      setLoadingIvaComanda(false);
    }
  }, []); // Sin dependencias, esta función solo se crea una vez.

  // Función para obtener las mesas disponibles
  const fetchMesas = useCallback(async () => {
    setLoadingMesas(true);
    setErrorMesas(null);
    try {
      const response = await api.get(ROUTES.MESAS);
      const fetchedMesas: MesaData[] = response.data;
      setMesasDisponibles(fetchedMesas);
      return fetchedMesas;
    } catch (err: any) {
      console.error(err);
      setErrorMesas(NAMES.ERROR_CARGA_MESAS);
      return []; // Devuelve un array vacío en caso de error.
    } finally {
      setLoadingMesas(false);
    }
  }, []);

  //Función principal para cargar todos los datos iniciales
  const fetchData = useCallback(async () => {
    setLoading(true);
    limpiarMensajes();
    try {
      // Cargar el IVA y las mesas en paralelo usando `Promise.all` para mayor eficiencia.
      // `_` se usa para ignorar el resultado de `fetchIvaForComanda` ya que actualiza su propio estado.
      const [_, fetchedMesas] = await Promise.all([
        fetchIvaForComanda(),
        fetchMesas(), // `fetchMesas` devuelve las mesas, las cuales se almacenan en `fetchedMesas`.
      ]);

      const userResponse = await api.get(ROUTES.USER);
      setUserId(userResponse.data.id || userResponse.data.user?.id || null);

      // Obtener categorías y productos en paralelo.
      const [categoriasResponse, productosResponse] = await Promise.all([
        api.get(ROUTES.CATEGORY),
        api.get(ROUTES.PRODUCT),
      ]);
      setCategorias(
        categoriasResponse.data.categorias || categoriasResponse.data
      ); // Actualiza categorías, manejando posibles formatos de respuesta.
      setProductos(productosResponse.data.productos || productosResponse.data);

      // Modo Edición / Creación
      if (comandaIdParaEditar) {
        // Si hay un `comandaIdParaEditar`, estamos en modo edición.
        const comandaResponse = await api.get(
          ROUTES.COMANDA_DETAIL.replace(":id", comandaIdParaEditar)
        );
        const comandaAEditar: ComandaData = comandaResponse.data.comanda;

        if (comandaAEditar) {
          // Si la comanda existe, carga sus productos seleccionados.
          if (comandaAEditar.detalles) {
            setProductosSeleccionados(
              comandaAEditar.detalles.map((detalle: any) => ({
                id: detalle.producto.id,
                nombre: detalle.producto.nombre,
                precio: detalle.producto.precio,
                categoria_id: detalle.producto.categoria_id,
                cantidad: detalle.cantidad,
              }))
            );
          }
          // Si la comanda tiene una mesa asignada, la preselecciona.
          if (
            comandaAEditar.mesa_id !== undefined &&
            comandaAEditar.mesa_id !== null
          ) {
            setMesaSeleccionadaId(comandaAEditar.mesa_id);
          } else {
            setMesaSeleccionadaId(null);
          }
          // En modo edición, se asegura de que la mesa actual de la comanda esté disponible en la lista de opciones, incluso si su estado es "ocupada".
          setMesasDisponibles(
            fetchedMesas.filter(
              (mesa: MesaData) =>
                mesa.estado === "libre" || mesa.id === comandaAEditar.mesa_id
            )
          );
        }
      } else {
        // Si NO hay `comandaIdParaEditar`, estamos en modo creación.
        // Primero intenta usar el `initialSelectedMesaId` si existe y la mesa está libre.
        if (
          initialSelectedMesaId !== null &&
          fetchedMesas.some(
            (mesa) =>
              mesa.id === initialSelectedMesaId && mesa.estado === "libre"
          )
        ) {
          setMesaSeleccionadaId(initialSelectedMesaId);
        } else {
          // Si no hay `initialSelectedMesaId` o no es válido, inicializa a `null` (Sin Mesa).
          setMesaSeleccionadaId(null);
        }
        // En modo creación, solo se muestran las mesas que están "libres" para seleccionar.
        setMesasDisponibles(
          fetchedMesas.filter((mesa: MesaData) => mesa.estado === "libre")
        );
      }
    } catch (err: any) {
      console.error(NAMES.ERROR_CARGA, err);
      setError(NAMES.ERROR_CARGA);
      setIvaActualComanda(0.21);
    } finally {
      setLoading(false);
    }
  }, [
    comandaIdParaEditar, // re-ejecuta si cambiamos entre crear y editar.
    fetchIvaForComanda, // asegura que la función de IVA esté actualizada.
    fetchMesas, // asegura que la función de mesas esté actualizada.
    initialSelectedMesaId, //para que la lógica de preselección de mesa se ejecute correctamente.
  ]);

  useEffect(() => {
    fetchData(); // Llama a la función que carga todos los datos iniciales.
  }, [fetchData]); //se ejecuta cuando `fetchData` cambia.

  // Añade un producto a la lista de seleccionados o aumenta su cantidad si ya existe.
  const handleSeleccionarProducto = (producto: ProductoProps) => {
    setProductosSeleccionados((prev) => {
      const productoExistente = prev.find((p) => p.id === producto.id); // Busca si el producto ya está en la lista.
      if (productoExistente) {
        // Si existe, mapea la lista para aumentar la cantidad del producto existente.
        return prev.map((p) =>
          p.id === producto.id ? { ...p, cantidad: p.cantidad + 1 } : p
        );
      } else {
        // Si no existe, añade el producto a la lista con cantidad 1.
        return [...prev, { ...producto, cantidad: 1 }];
      }
    });
  };

  // Aumenta la cantidad de un producto ya seleccionado.
  const handleAumentarCantidad = (id: number) => {
    setProductosSeleccionados((prev) =>
      prev.map((p) => (p.id === id ? { ...p, cantidad: p.cantidad + 1 } : p))
    );
  };

  // Disminuye la cantidad de un producto ya seleccionado. Elimina el producto si la cantidad llega a 0.
  const handleDisminuirCantidad = (id: number) => {
    setProductosSeleccionados(
      (prev) =>
        prev
          .map((p) => (p.id === id ? { ...p, cantidad: p.cantidad - 1 } : p)) // Disminuye la cantidad.
          .filter((p) => p.cantidad > 0) // Filtra para eliminar productos cuya cantidad sea 0 o menos.
    );
  };

  // Función para manejar la selección de mesa
  const handleSeleccionarMesa = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedValue = event.target.value; // Obtiene el valor seleccionado del dropdown.
    // Si el valor es "null" (una cadena), establece `mesaSeleccionadaId` a `null`.
    // De lo contrario, lo convierte a número.
    setMesaSeleccionadaId(
      selectedValue === "null" ? null : Number(selectedValue)
    );
  };

  // Función para finalizar (crear o actualizar) la comanda
  const handleFinalizarComanda = async () => {
    limpiarMensajes();
    if (!userId) {
      setError(NAMES.ERROR_ID);
      return;
    }
    if (productosSeleccionados.length === 0) {
      setError(NAMES.COMANDA_SIN_PRODUCTOS);
      return;
    }

    // Determina el IVA a enviar, usando el `ivaActualComanda` si existe, o 0.21 como fallback.
    const ivaParaEnviar = ivaActualComanda !== null ? ivaActualComanda : 0.21;

    try {
      // Construye el payload (los datos a enviar al backend).
      const comanda = {
        user_id: userId,
        estado: "abierta", // Por defecto, una comanda recién creada/editada se marca como abierta.
        productos: productosSeleccionados.map((p) => ({
          producto_id: p.id,
          cantidad: p.cantidad,
        })), // Mapea los productos seleccionados al formato esperado por el backend.
        iva: ivaParaEnviar,
        mesa_id: mesaSeleccionadaId,
      };

      if (comandaIdParaEditar) {
        await api.put(
          ROUTES.COMANDA_DETAIL.replace(":id", comandaIdParaEditar),
          comanda
        );
        setMensaje(NAMES.COMANDA_ACTUALIZADA_EXITO); // Mensaje de éxito para actualización.
      } else {
        // Si estamos creando, realiza una petición POST para crear una nueva comanda.
        await api.post(ROUTES.COMANDA, {
          ...comanda,
          fecha: new Date().toISOString(), // Añade la fecha actual para nuevas comandas.
        });
        setMensaje(NAMES.COMANDA_EXITOSA); // Mensaje de éxito para creación.
      }
      setProductosSeleccionados([]);
      setMesaSeleccionadaId(null);
      await fetchMesas(); // Vuelve a cargar las mesas para actualizar su estado (la mesa ocupada, por ejemplo).
      setTimeout(() => navigate(ROUTES.DASHBOARD), 1000);
    } catch (err: any) {
      console.error(err);
      const backendErrorMessage =
        err.response?.data?.message || NAMES.ERROR_INESPERADO;
      setError(`${NAMES.ERROR_INESPERADO} ${backendErrorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return {
    categorias, // Lista de categorías de productos.
    productos, // Lista de todos los productos disponibles.
    productosSeleccionados, // Productos que el usuario ha añadido a la comanda.
    comandaIdParaEditar, // ID de la comanda si está en modo edición.
    mensaje, // Mensaje de éxito/informativo.
    error, // Mensaje de error.
    // El estado de carga es la combinación de todos los estados de carga (principal, IVA, mesas).
    loading: loading || loadingIvaComanda || loadingMesas,
    ivaActualComanda, // Porcentaje de IVA actual para la comanda.
    // La lista de mesas disponibles se filtra para mostrar solo las libres,
    // pero en modo edición, también incluye la mesa que ya tiene asignada la comanda.
    mesasDisponibles: mesasDisponibles.filter(
      (mesa) => mesa.estado === "libre" || mesa.id === mesaSeleccionadaId
    ),
    mesaSeleccionadaId, // ID de la mesa actualmente seleccionada.
    handleSeleccionarProducto, // Función para añadir/aumentar productos.
    handleAumentarCantidad, // Función para aumentar cantidad de un producto.
    handleDisminuirCantidad, // Función para disminuir cantidad de un producto.
    handleSeleccionarMesa, // Función para seleccionar una mesa.
    handleFinalizarComanda, // Función para guardar/actualizar la comanda.
    limpiarMensajes, // Función para limpiar mensajes de estado.
  };
}
