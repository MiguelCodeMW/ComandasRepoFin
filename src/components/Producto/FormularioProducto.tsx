import React, { useState, useEffect } from "react";
import Button from "../Button/Button";
import styles from "./Producto.module.css";
import { NAMES } from "../../utils/Constants/text";
import {
  ProductoProps,
  NuevoProductoData,
} from "../../utils/types/ComandaTypes";
import { CategoriaProps } from "../../utils/types/CategoriaTypes";
import { useDashboard } from "../../hooks/useDashboard";
import { FormularioProductoProps } from "../../utils/types/ComandaTypes";

function FormularioProducto({
  onSubmit = async () => true,
  onCancel,
  productoInicial,
  categoriasDisponibles = [],
  textoBotonSubmit = NAMES.GUARDAR,
  limpiarMensajesAlCambiar,
}: FormularioProductoProps = {}) {
  const [formData, setFormData] = useState<
    Omit<NuevoProductoData, "precio"> & { precio: string }
  >(
    productoInicial
      ? {
          ...productoInicial,
          precio: String(productoInicial.precio ?? ""),
        }
      : { nombre: "", precio: "", categoria_id: 0 }
  );
  const { moneda } = useDashboard();

  useEffect(() => {
    if (productoInicial) {
      setFormData({
        ...productoInicial,
        precio: String(productoInicial.precio ?? ""),
      });
    } else {
      setFormData({ nombre: "", precio: "", categoria_id: 0 });
    }
  }, [productoInicial]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "categoria_id" ? Number(value) : value,
    }));

    if (limpiarMensajesAlCambiar) {
      limpiarMensajesAlCambiar();
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const success = await onSubmit({
      ...formData,
      precio: Number(formData.precio),
    });

    if (success && !productoInicial) {
      setFormData({ nombre: "", precio: "", categoria_id: 0 });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.formContainer}>
      <label>
        {NAMES.LABEL_NOMBRE}
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          placeholder={NAMES.PLACEHOLDER_PRODUCTO}
          className={styles.input}
          required
        />
      </label>
      <label>
        {NAMES.PRODUCTO_PRECIO}{" "}
        <span className={styles.currencySymbol}>{moneda || "$"}</span>{" "}
        <input
          type="number"
          name="precio"
          value={formData.precio}
          onChange={handleChange}
          placeholder={NAMES.PLACEHOLDER_PRECIO}
          className={styles.input}
          step="0.01"
          min="0"
          required
        />
      </label>
      <label>
        {NAMES.LABEL_CATEGORIA}
        <select
          name="categoria_id"
          value={formData.categoria_id || ""}
          onChange={handleChange}
          className={styles.select}
          required
        >
          <option value="" disabled>
            {NAMES.PRODUCTO_SELECCIONAR_CATEGORIA}
          </option>
          {categoriasDisponibles.map((categoria: CategoriaProps) => (
            <option key={categoria.id} value={categoria.id}>
              {categoria.nombre}
            </option>
          ))}
        </select>
      </label>
      <div className={styles.buttonGroup}>
        <Button
          text={textoBotonSubmit}
          type="submit"
          className={`${styles.button} ${styles.saveButton}`}
        />
        {onCancel && (
          <Button
            text={NAMES.CANCELAR}
            onClick={onCancel}
            type="button"
            className={`${styles.button} ${styles.cancelButton}`}
          />
        )}
      </div>
    </form>
  );
}

export default FormularioProducto;
