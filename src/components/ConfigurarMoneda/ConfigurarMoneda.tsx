import { useState, useEffect } from "react";
import styles from "./ConfigurarMoneda.module.css";
import Button from "../Button/Button";
import { NAMES } from "../../utils/Constants/text";
import { ConfigurarMonedaProps } from "../../utils/types/CommonTypes";

function ConfigurarMoneda({
  onGuardado,
  monedaActual,
  onCancelar,
  errorExterno,
}: ConfigurarMonedaProps) {
  const [monedaInput, setMonedaInput] = useState<string>("");
  const [mensajeLocal, setMensajeLocal] = useState<string | null>(null);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Establece el valor inicial del input con la moneda actual o un valor por defecto (ej: EUR)
    setMonedaInput(monedaActual !== null ? monedaActual.toUpperCase() : "EUR");
  }, [monedaActual]); // Ejecutar cuando monedaActual cambie

  const handleGuardarClick = async () => {
    setMensajeLocal(null);
    setErrorLocal(null);

    const monedaValue = monedaInput.trim().toUpperCase();

    // Validación básica para código ISO de 3 letras
    if (!/^[A-Z]{3}$/.test(monedaValue)) {
      setErrorLocal(NAMES.MONEDA_VALOR_INVALIDO);
      return;
    }

    setIsSubmitting(true);
    try {
      await onGuardado(monedaValue);
      setMensajeLocal(NAMES.MONEDA_GUARDADA_EXITO);
    } catch (e: any) {
      console.error(NAMES.MONEDA_ERROR, e);
      setErrorLocal(e.message || NAMES.MONEDA_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      <div className={styles.modalContent}>
        <h2>{NAMES.MONEDA_LABEL}</h2>
        {/* Mostrar error externo si existe y no hay error local (para evitar duplicidad) */}
        {errorExterno && !errorLocal && (
          <p className={styles.errorMessage}>{errorExterno}</p>
        )}
        {/* Mostrar error local si existe */}
        {errorLocal && <p className={styles.errorMessage}>{errorLocal}</p>}
        {/* Mostrar mensaje de éxito local si existe */}
        {mensajeLocal && (
          <p className={styles.successMessage}>{mensajeLocal}</p>
        )}
        <div className={styles.inputGroup}>
          <label htmlFor="monedaInput">{NAMES.MONEDA_APLICADA}</label>
          <input
            type="text"
            id="monedaInput"
            value={monedaInput}
            onChange={(e) => {
              setMonedaInput(e.target.value);
              setErrorLocal(null);
              setMensajeLocal(null);
            }}
            placeholder="EUR"
            maxLength={3}
            className={styles.input}
            disabled={isSubmitting}
          />
        </div>
        <div className={styles.buttonGroup}>
          <Button
            onClick={handleGuardarClick}
            disabled={isSubmitting}
            text={isSubmitting ? NAMES.CARGANDO : NAMES.GUARDAR_MONEDA}
            className={styles.button}
          />
          <Button
            onClick={onCancelar}
            disabled={isSubmitting}
            text={NAMES.CANCELAR}
            className={`${styles.button} ${styles.cancelButton}`}
          />
        </div>
      </div>
    </div>
  );
}

export default ConfigurarMoneda;
