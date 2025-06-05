import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../../components/Button/Button";
import ProductoSelectorList from "../../../components/Producto/ProductoSelectorList";
import ProductosSeleccionadosList from "./ProductosSeleccionadosList";
import styles from "./Comandas.module.css";
import { NAMES } from "../../../utils/Constants/text";
import { ROUTES } from "../../../utils/Constants/routes";
import { useCrearComanda } from "../../../hooks/useCrearComanda";
import { CategoriaProps } from "../../../utils/types/CategoriaTypes";
import { ProductoProps } from "../../../utils/types/ComandaTypes";

function CrearComanda() {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    categorias,
    productos,
    productosSeleccionados,
    comandaIdParaEditar,
    mensaje,
    error,
    loading,
    mesasDisponibles,
    mesaSeleccionadaId,
    handleSeleccionarProducto,
    handleAumentarCantidad,
    handleDisminuirCantidad,
    handleSeleccionarMesa,
    handleFinalizarComanda,
  } = useCrearComanda();

  const [busqueda, setBusqueda] = useState("");
  const [categoriaSeleccionadaId, setCategoriaSeleccionadaId] = useState<
    number | null
  >(null); // Almacena el ID de la categoría de producto seleccionada.

  // Preseleccionar Mesa (desde navegación)
  useEffect(() => {
    // Extrae `selectedMesaId` del estado de la navegación.
    const { selectedMesaId } = (location.state || {}) as {
      selectedMesaId?: number;
    };

    // Si hay un ID de mesa preseleccionado y ya tenemos las mesas disponibles cargadas.
    if (selectedMesaId && mesasDisponibles.length > 0) {
      // Busca la mesa correspondiente en la lista de mesas disponibles y que esté libre.
      const mesaToPreselect = mesasDisponibles.find(
        (mesa) => mesa.id === selectedMesaId && mesa.estado === "libre"
      );

      // Si se encuentra una mesa válida para preseleccionar.
      if (mesaToPreselect) {
        handleSeleccionarMesa({
          target: { value: String(mesaToPreselect.id) }, // Convierte el ID a string como lo haría un evento de select.
        } as React.ChangeEvent<HTMLSelectElement>);
      }
    }
  }, [location.state, mesasDisponibles, handleSeleccionarMesa]);

  //Seleccionar la Primera Categoría por Defecto
  useEffect(() => {
    // Si hay categorías cargadas y ninguna categoría está seleccionada,
    // selecciona la primera categoría de la lista.
    if (categorias.length > 0 && categoriaSeleccionadaId === null) {
      setCategoriaSeleccionadaId(categorias[0].id);
    }
  }, [categorias, categoriaSeleccionadaId]);

  // Filtra los productos para mostrar solo los que coinciden con la búsqueda
  const productosMostrados: ProductoProps[] = productos.filter((p) => {
    const coincideConBusqueda = p.nombre
      .toLowerCase()
      .includes(busqueda.toLowerCase());

    // Si hay un término de búsqueda, solo se considera la coincidencia con la búsqueda.
    if (busqueda.trim() !== "") {
      return coincideConBusqueda;
    }

    // Si no hay búsqueda, se filtra por categoría seleccionada.
    const esDeCategoriaSeleccionada =
      categoriaSeleccionadaId === null || // Si no hay categoría seleccionada, muestra todos.
      p.categoria_id === categoriaSeleccionadaId; // O si coincide con la categoría seleccionada.

    return esDeCategoriaSeleccionada;
  });

  if (loading) {
    return <div className={styles.message}>{NAMES.CARGANDO_DATOS_COMANDA}</div>;
  }

  return (
    <div className={styles.comandaContainer}>
      <h1 className={styles.comandaTitulo}>
        {comandaIdParaEditar ? NAMES.ID_COMANDA_EDITAR : NAMES.ID_COMANDA_CREAR}
        {comandaIdParaEditar ? ` #${comandaIdParaEditar}` : ""}
      </h1>

      {error && <p className={`${styles.message} ${styles.error}`}>{error}</p>}
      {mensaje && (
        <p className={`${styles.message} ${styles.success}`}>{mensaje}</p>
      )}

      {/* Selector de Mesas */}
      <div className={styles.mesaSelectorContainer}>
        <label htmlFor="mesa-select" className={styles.label}>
          {NAMES.SELECCIONAR_MESA}:
        </label>
        <select
          id="mesa-select"
          value={mesaSeleccionadaId === null ? "null" : mesaSeleccionadaId}
          onChange={handleSeleccionarMesa}
          className={styles.select}
          disabled={loading}
        >
          <option value="null">{NAMES.SIN_MESA}</option>{" "}
          {/* Opción para "Sin mesa" */}
          {mesasDisponibles.map((mesa) => (
            <option key={mesa.id} value={mesa.id}>
              Mesa {mesa.numero} (
              {mesa.estado === "libre" ? "Libre" : "Ocupada"})
            </option>
          ))}
        </select>
        <small className={styles.textMuted}>
          {/* Muestra el número de mesas libres. */}
          {
            mesasDisponibles.filter((mesa) => mesa.estado === "libre").length
          }{" "}
          mesas libres
        </small>
      </div>

      {/* Barra de Categorías para Filtrar Productos */}
      <div className={styles.categoriasBar}>
        {categorias.map((categoria: CategoriaProps) => (
          <Button
            key={categoria.id}
            text={categoria.nombre}
            onClick={() => {
              setCategoriaSeleccionadaId(categoria.id);
              setBusqueda("");
            }}
            className={`${styles.categoriaButton} ${
              categoria.id === categoriaSeleccionadaId
                ? styles.categoriaButtonActive
                : ""
            }`}
          />
        ))}
      </div>

      {/* Campo de Búsqueda de Productos */}
      <div className={styles.buscadorContainer}>
        <input
          type="text"
          placeholder={NAMES.COMANDA_BUSCAR_PRODUCTOS}
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className={styles.input}
        />
      </div>

      {/* Sección Principal de Selección de Productos y Productos Seleccionados */}
      {!loading && !error && (
        <>
          <div className={styles.selectorProductosContainer}>
            {productosMostrados.length > 0 ? (
              <ProductoSelectorList
                productos={productosMostrados}
                onProductoClick={handleSeleccionarProducto} // Callback para añadir un producto.
              />
            ) : (
              <p className={styles.message}>{NAMES.COMANDA_BUSCAR_ERROR}</p>
            )}
          </div>

          <div className={styles.seleccionadosContainer}>
            <h3>{NAMES.COMANDA_PRODUCTOS_SELECCIONADOS}</h3>
            <ProductosSeleccionadosList
              productos={productosSeleccionados}
              onAumentar={handleAumentarCantidad}
              onDisminuir={handleDisminuirCantidad}
            />
          </div>
        </>
      )}

      <div className={styles.finalizarWrapper}>
        <Button
          text={
            comandaIdParaEditar
              ? NAMES.ID_COMANDA_ACTUALIZAR
              : NAMES.ID_COMANDA_FINALIZAR
          }
          onClick={handleFinalizarComanda}
          className={styles.botonFinalizar}
          disabled={loading || productosSeleccionados.length === 0}
        />
        <Button
          text={NAMES.VOLVER}
          onClick={() => navigate(ROUTES.DASHBOARD)}
          className={styles.volverButton}
        />
      </div>
    </div>
  );
}

export default CrearComanda;
