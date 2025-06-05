import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/axio";
import { ComandaData } from "../utils/types/ComandaTypes";
import { User } from "../utils/types/UserTypes";
import { NAMES } from "../utils/Constants/text";
import { ROUTES } from "../utils/Constants/routes";

export function useComandaDetalle() {
  const { id } = useParams<{ id: string }>(); // Obtiene el parámetro 'id' de la URL.
  const navigate = useNavigate();

  // Declaración de estados usando useState:
  const [comanda, setComanda] = useState<ComandaData | null>(null); // Estado para almacenar los datos de la comanda. Inicialmente nulo.
  const [loading, setLoading] = useState<boolean>(true); // Estado para indicar si se está cargando información.
  const [error, setError] = useState<string | null>(null); // Estado para almacenar mensajes de error.
  const [mensaje, setMensaje] = useState<string | null>(null); // Estado para almacenar mensajes de éxito o informativos.
  const [user, setUser] = useState<User | null>(null); // Estado para almacenar los datos del usuario logueado.

  const [subtotal, setSubtotal] = useState<number>(0); // Estado para el subtotal de la comanda (suma de precios de productos sin IVA).
  const [ivaPorcentaje, setIvaPorcentaje] = useState<number>(0.21); // Estado para el porcentaje de IVA. Valor por defecto 0.21 (21%).
  const [totalConIva, setTotalConIva] = useState<number>(0); // Estado para el total de la comanda con IVA incluido.

  // Función para limpiar los mensajes de error y éxito.
  const limpiarMensajes = () => {
    setMensaje(null); // Establece el mensaje a nulo.
    setError(null); // Establece el error a nulo.
  };

  // Función memorizada para obtener el porcentaje de IVA global desde el backend.
  const fetchGlobalIva = useCallback(async () => {
    try {
      const res = await api.get(ROUTES.GET_IVA); // Realiza una petición GET para obtener el IVA global.
      return Number(res.data.iva); // Devuelve el IVA como número.
    } catch (err) {
      console.error("Error al obtener IVA global para detalle:", err); // Muestra un error si falla la petición.
      return 0.21; // En caso de error, devuelve 0.21
    }
  }, []); // El array de dependencias vacío indica que esta función solo se crea una vez.

  //  Se ejecuta al montar el componente y cuando 'id' o 'fetchGlobalIva' cambian.
  useEffect(() => {
    const fetchData = async () => {
      // Función asíncrona para cargar los datos de la comanda y el usuario.
      setLoading(true); // Establece el estado de carga a verdadero.
      limpiarMensajes(); // Limpia cualquier mensaje existente.
      try {
        // Petición para obtener los detalles de la comanda.
        const comandaResponse = await api.get(
          ROUTES.COMANDA_DETAIL.replace(":id", id || "")
        );
        const comanda: ComandaData = comandaResponse.data.comanda; // Extrae los datos de la comanda de la respuesta.
        setComanda(comanda); // Actualiza el estado de la comanda.

        // Petición para obtener los datos del usuario logueado.
        const userResponse = await api.get(ROUTES.USER);
        setUser(userResponse.data.user || userResponse.data); // Actualiza el estado del usuario.

        // Si la comanda y sus detalles existen, calcula el subtotal y el IVA.
        if (comanda && comanda.detalles) {
          const calculatedSubtotal = comanda.detalles.reduce(
            (sum, detalle) => sum + detalle.cantidad * detalle.producto.precio,
            0
          ); // Calcula el subtotal sumando el precio * cantidad de cada detalle.
          setSubtotal(calculatedSubtotal); // Actualiza el estado del subtotal.

          let currentIva: number;
          // Verifica si la comanda tiene un IVA guardado.
          if (comanda.iva !== null && comanda.iva !== undefined) {
            currentIva = comanda.iva; // Si tiene IVA guardado, usa ese valor.
          } else {
            // Si la comanda NO tiene IVA guardado, obtiene el IVA global actual del backend.
            currentIva = await fetchGlobalIva();
            console.log(currentIva);
          }
          setIvaPorcentaje(currentIva); // Actualiza el estado del porcentaje de IVA.
          setTotalConIva(calculatedSubtotal * (1 + currentIva)); // Calcula y actualiza el total con IVA.
        }
      } catch (err: any) {
        console.error(NAMES.ERROR_CARGA_DETALLE_COMANDA, err); // Muestra un error si falla la carga.
        setError(NAMES.ERROR_CARGA_DETALLE_COMANDA); // Establece el mensaje de error.
        setComanda(null); // Resetea la comanda a nulo en caso de error.
      } finally {
        setLoading(false); // Siempre establece el estado de carga a falso al finalizar.
      }
    };

    if (id) {
      // Si existe un ID, llama a fetchData.
      fetchData();
    } else {
      setLoading(false); // Si no hay ID, la carga ha terminado.
      setError(NAMES.COMANDA_ID_NO_PROPORCIONADO); // Muestra un error indicando que no se proporcionó ID.
    }
  }, [id, fetchGlobalIva]); // Dependencias: el efecto se ejecuta si 'id' o 'fetchGlobalIva' cambian.

  // Función para manejar la edición de una comanda.
  const handleEditarComanda = () => {
    navigate(`${ROUTES.CREATE_COMANDA}?id=${id}`);
  };

  // Función asíncrona para manejar el pago de una comanda.
  const handlePagarComanda = async () => {
    limpiarMensajes(); // Limpia mensajes previos.
    if (!comanda) {
      setError(NAMES.COMANDA_NO_ENCONTRADA_PAGAR); // Si no hay comanda, establece un error.
      return;
    }

    if (comanda.estado === "cerrada") {
      setMensaje("La comanda ya está cerrada."); // Si la comanda ya está cerrada, muestra un mensaje.
      return;
    }

    try {
      setLoading(true); // Establece el estado de carga a verdadero.

      const ivaParaPagar =
        comanda.iva !== null && comanda.iva !== undefined
          ? comanda.iva
          : ivaPorcentaje; // Determina qué IVA usar para el pago: el de la comanda o el global.

      // Realiza una petición PUT para marcar la comanda como pagada.
      const response = await api.put(
        ROUTES.COMANDA_PAGAR.replace(":id", id || ""),
        { iva: ivaParaPagar } // Envía el IVA utilizado.
      );

      setComanda(response.data.comanda); // Actualiza la comanda con los datos de la respuesta.
      setSubtotal(response.data.subtotal); // Actualiza el subtotal con los datos de la respuesta.
      setIvaPorcentaje(response.data.iva); // Actualiza el IVA con los datos de la respuesta.
      setTotalConIva(response.data.total_con_iva); // Actualiza el total con IVA con los datos de la respuesta.
      setMensaje(response.data.message); // Establece el mensaje de éxito.
      setError(null); // Limpia cualquier error.
      setTimeout(() => navigate(ROUTES.DASHBOARD), 1400);
    } catch (err: any) {
      console.error(NAMES.ERROR_PAGAR_COMANDA, err); // Muestra un error si falla el pago.
      const backendErrorMessage = err.response?.data?.message || err.message; // Obtiene el mensaje de error del backend o el mensaje genérico.
      setError(`${NAMES.ERROR_PAGAR_COMANDA}: ${backendErrorMessage}`); // Establece el mensaje de error completo.
      setMensaje(null); // Limpia cualquier mensaje de éxito.
    } finally {
      setLoading(false); // Siempre establece el estado de carga a falso.
    }
  };

  // Función asíncrona para manejar el borrado de una comanda.
  const handleBorrarComanda = async () => {
    limpiarMensajes(); // Limpia mensajes previos.
    if (!comanda) {
      setError(NAMES.COMANDA_NO_ENCONTRADA_BORRAR); // Si no hay comanda, establece un error.
      return;
    }
    const confirmDelete = window.confirm(NAMES.CONFIRM_BORRAR_COMANDA); // Pide confirmación al usuario antes de borrar.
    if (!confirmDelete) return; // Si el usuario cancela, no hace nada.

    try {
      setLoading(true); // Establece el estado de carga a verdadero.
      // Realiza una petición DELETE para borrar la comanda.
      await api.delete(ROUTES.COMANDA_DETAIL.replace(":id", id || ""));
      setMensaje(NAMES.COMANDA_BORRADA_EXITO); // Establece el mensaje de éxito.
      setTimeout(() => navigate(ROUTES.DASHBOARD), 1000); // Redirige al dashboard después de 1 segundos.
    } catch (err: any) {
      console.error(NAMES.ERROR_BORRAR_COMANDA, err); // Muestra un error si falla el borrado.
      setError(NAMES.ERROR_BORRAR_COMANDA); // Establece el mensaje de error.
    } finally {
      setLoading(false); // Siempre establece el estado de carga a falso.
    }
  };

  // Retorna un objeto con todos los estados y funciones que este hook proporciona a los componentes que lo usen.
  return {
    comanda, // Datos de la comanda.
    subtotal, // Subtotal de la comanda.
    ivaPorcentaje, // Porcentaje de IVA.
    totalConIva, // Total de la comanda con IVA.
    mensaje, // Mensaje informativo/de éxito.
    error, // Mensaje de error.
    loading, // Estado de carga.
    user, // Datos del usuario.
    handleEditarComanda, // Función para editar la comanda.
    handlePagarComanda, // Función para pagar la comanda.
    handleBorrarComanda, // Función para borrar la comanda.
    limpiarMensajes, // Función para limpiar mensajes.
  };
}
