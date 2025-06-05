import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axio";
import { ROUTES } from "../utils/Constants/routes";
import { NAMES } from "../utils/Constants/text";
import { ComandaDashboard } from "../utils/types/ComandaTypes";
import { User } from "../utils/types/UserTypes";

export function useDashboard() {
  const [comandas, setComandas] = useState<ComandaDashboard[]>([]); // Almacena la lista de comandas para el dashboard.
  const [loading, setLoading] = useState<boolean>(true); // Estado general de carga de datos principales.
  const [loadingIva, setLoadingIva] = useState<boolean>(true); // Estado de carga específico para el IVA global.
  const [loadingMoneda, setLoadingMoneda] = useState<boolean>(true); // Estado de carga específico para la moneda global.
  const [error, setError] = useState<string | null>(null); // Mensaje de error general para las comandas.
  const [errorIva, setErrorIva] = useState<string | null>(null); // Mensaje de error específico para el IVA.
  const [errorMoneda, setErrorMoneda] = useState<string | null>(null); // Mensaje de error específico para la moneda.
  const [mostrarPagadas, setMostrarPagadas] = useState<boolean>(false); // Controla si se muestran comandas pagadas (cerradas) o pendientes (abiertas).
  const [showModalIva, setShowModalIva] = useState(false); // Controla la visibilidad del modal para configurar el IVA.
  const [showModalMoneda, setShowModalMoneda] = useState(false); // Controla la visibilidad del modal para configurar la moneda.

  const [iva, setIva] = useState<number | null>(() => {
    const storedIva = localStorage.getItem("iva");
    try {
      return storedIva ? Number(storedIva) : null;
    } catch (e) {
      console.error(e);
      return null;
    }
  });

  const [moneda, setMoneda] = useState<string | null>(() => {
    const storedMoneda = localStorage.getItem("moneda_global");
    try {
      return storedMoneda ? storedMoneda : null;
    } catch (e) {
      console.error(e);
      return null;
    }
  });

  const navigate = useNavigate();

  // Intenta cargar los datos del usuario desde localStorage al inicio. Si no existe o falla, se inicializa a null.
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error("Error parsing user from localStorage", e);
      return null;
    }
  });

  // Función para obtener las comandas desde el backend.
  const fetchComandas = useCallback(async () => {
    setError(null);
    try {
      const res = await api.get(ROUTES.DASHBOARD);
      // Ajusta la asignación de comandas para manejar diferentes formatos de respuesta del backend.
      setComandas(
        Array.isArray(res.data.comandas) // Si la respuesta tiene una clave 'comandas' que es un array.
          ? res.data.comandas
          : Array.isArray(res.data) // O si la respuesta directamente es un array.
          ? res.data
          : [] // En cualquier otro caso, un array vacío.
      );
    } catch (err: any) {
      setError(
        err.response?.data?.message || err.message || NAMES.ERROR_COMANDAS
      );
      console.error(NAMES.ERROR_COMANDAS, err);
    }
  }, []); // El array de dependencias vacío indica que esta función solo se crea una vez.

  const fetchIvaGlobal = useCallback(async () => {
    setLoadingIva(true);
    setErrorIva(null);
    try {
      const res = await api.get(ROUTES.GET_IVA);
      setIva(
        res.data.iva !== undefined && res.data.iva !== null
          ? Number(res.data.iva)
          : null
      );
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        // Si el error es 404 (No encontrado), indica que el IVA no está configurado.
        setErrorIva(NAMES.IVA_NO_CONFIGURADO);
      } else {
        setErrorIva(
          err.response?.data?.message || err.message || NAMES.ERROR_IVA
        );
      }
      setIva(null);
    } finally {
      setLoadingIva(false);
    }
  }, []); // Sin dependencias.

  // Función para obtener la moneda global
  const fetchGlobalCurrency = useCallback(async () => {
    setLoadingMoneda(true);
    setErrorMoneda(null);
    try {
      const res = await api.get(ROUTES.GET_MONEDA);
      setMoneda(res.data.currency || null);
    } catch (err: any) {
      console.error(err);
      if (err.response && err.response.status === 404) {
        // Si el error es 404, indica que la moneda no está configurada.
        setErrorMoneda(NAMES.MONEDA_NO_CONFIGURADA);
      } else {
        setErrorMoneda(err.response?.data?.message || err.message);
      }
      setMoneda(null); // En caso de error, la moneda se establece a null.
    } finally {
      setLoadingMoneda(false); // Finaliza el estado de carga de la moneda.
    }
  }, []);

  // cargar datos, se ejecuta una vez al montar el componente y cada vez que cambian las funciones `fetchComandas`, `fetchIvaGlobal`, o `fetchGlobalCurrency`.
  useEffect(() => {
    setLoading(true);
    // Utiliza `Promise.all` para ejecutar todas las peticiones de fetch en paralelo,
    // mejorando la eficiencia al reducir el tiempo de carga total.
    Promise.all([fetchComandas(), fetchIvaGlobal(), fetchGlobalCurrency()])
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [fetchComandas, fetchIvaGlobal, fetchGlobalCurrency]); // Dependencias: las funciones de fetch memorizadas.

  const handleLogout = () => {
    // Elimina el token de autenticación y los datos del usuario, IVA y moneda de localStorage.
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("iva");
    localStorage.removeItem("moneda_global");
    // Resetea los estados locales a null.
    setUser(null);
    setIva(null);
    setMoneda(null);
    navigate(ROUTES.LOGIN);
  };

  // Función para guardar el nuevo valor de IVA en el backend y en localStorage.
  const handleIvaGuardado = async (nuevoIva: number) => {
    setErrorIva(null);
    try {
      await api.post(ROUTES.SET_IVA, { iva: nuevoIva });
      setIva(nuevoIva);
      localStorage.setItem("iva", nuevoIva.toString());
      setShowModalIva(false); // Cierra el modal de configuración de IVA.
    } catch (error: any) {
      console.error(error);
      // Establece el mensaje de error, priorizando el mensaje del backend o un mensaje genérico.
      setErrorIva(
        error.response?.data?.message ||
          error.response?.data?.errors?.iva?.[0] ||
          error.message ||
          NAMES.IVA_ERROR
      );
      throw error;
    }
  };

  // Función para guardar la nueva moneda en el backend y en localStorage.
  const handleMonedaGuardado = async (nuevaMoneda: string) => {
    setErrorMoneda(null);
    try {
      await api.post(ROUTES.SET_MONEDA, { currency: nuevaMoneda });
      setMoneda(nuevaMoneda); // Actualiza el estado local de la moneda.
      localStorage.setItem("moneda_global", nuevaMoneda); // Guarda la nueva moneda en localStorage.
      setShowModalMoneda(false); // Cierra el modal de configuración de moneda.
    } catch (error: any) {
      console.error(error);
      setErrorMoneda(
        error.response?.data?.message ||
          error.response?.data?.errors?.currency?.[0] ||
          error.message
      );
      throw error;
    }
  };

  // Filtrado de Comandas
  // Filtra las comandas basándose en el estado `mostrarPagadas`.
  // Si `mostrarPagadas` es true, muestra solo las comandas con estado "cerrada".
  // Si es false, muestra solo las comandas con estado "abierta".
  const comandasFiltradas = mostrarPagadas
    ? comandas.filter((comanda) => comanda.estado === "cerrada")
    : comandas.filter((comanda) => comanda.estado === "abierta");

  return {
    comandas, // Todas las comandas obtenidas.
    comandasFiltradas, // Comandas después de aplicar el filtro (abiertas o cerradas).
    // El estado de carga consolidado: true si cualquier parte está cargando.
    loading: loading || loadingIva || loadingMoneda,
    error, // Mensaje de error general.
    errorIva, // Mensaje de error del IVA.
    errorMoneda, // Mensaje de error de la moneda.
    mostrarPagadas, // Estado para controlar el filtro de comandas.
    setMostrarPagadas, // Función para cambiar el filtro.
    showModalIva, // Estado para mostrar/ocultar modal de IVA.
    setShowModalIva, // Función para cambiar el estado del modal de IVA.
    showModalMoneda, // Estado para mostrar/ocultar modal de moneda.
    setShowModalMoneda, // Función para cambiar el estado del modal de moneda.
    iva, // Valor del IVA global.
    moneda, // Símbolo de la moneda global.
    user, // Datos del usuario logueado.
    handleLogout, // Función para cerrar sesión.
    handleIvaGuardado, // Función para guardar el IVA.
    handleMonedaGuardado, // Función para guardar la moneda.
    fetchComandas, // Función para recargar las comandas.
    fetchIvaGlobal, // Función para recargar el IVA.
    fetchGlobalCurrency, // Función para recargar la moneda.
  };
}
