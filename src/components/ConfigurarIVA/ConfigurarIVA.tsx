import { useState, useEffect } from "react";
import styles from "./ConfigurarIVA.module.css";
import Button from "../Button/Button";
import { NAMES } from "../../utils/Constants/text";
import { ConfigurarIVAProps } from "../../utils/types/CommonTypes";

function ConfigurarIVA({
  onGuardado,
  ivaActual,
  onCancelar,
  errorExterno,
}: ConfigurarIVAProps) {
  const [ivaInput, setIvaInput] = useState<string>("");
  const [mensajeLocal, setMensajeLocal] = useState<string | null>(null);
  const [errorLocal, setErrorLocal] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    setIvaInput(ivaActual !== null ? ivaActual.toString() : "0.21");
  }, [ivaActual]);

  const handleGuardarClick = async () => {
    setMensajeLocal(null); // Limpia cualquier mensaje de éxito previo.
    setErrorLocal(null); // Limpia cualquier mensaje de error previo.

    const ivaNumero = parseFloat(ivaInput);

    if (isNaN(ivaNumero) || ivaNumero < 0 || ivaNumero > 1) {
      setErrorLocal(NAMES.IVA_VALOR);
      return;
    }

    setIsSubmitting(true); // Establece el estado de envío a `true` (deshabilita botones/input).
    try {
      await onGuardado(ivaNumero);
      setMensajeLocal(NAMES.IVA_EXITO);
    } catch (e: any) {
      console.error(NAMES.IVA_ERROR, e);
      setErrorLocal(e.message || NAMES.IVA_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.modalBackdrop}>
      {" "}
      <div className={styles.modalContent}>
        {" "}
        <h2>{NAMES.IVA_LABEL}</h2>
        {errorExterno && !errorLocal && (
          <p className={styles.errorMessage}>{errorExterno}</p>
        )}
        {/* Muestra el error local si existe. */}
        {errorLocal && <p className={styles.errorMessage}>{errorLocal}</p>}
        {/* Muestra el mensaje de éxito local si existe. */}
        {mensajeLocal && (
          <p className={styles.successMessage}>{mensajeLocal}</p>
        )}
        {/* Grupo de Entrada del IVA */}
        <div className={styles.inputGroup}>
          <label htmlFor="ivaInput">
            {NAMES.IVA_APLICADO} (ej: 0.21 para 21%)
          </label>
          <input
            type="number"
            id="ivaInput"
            value={ivaInput}
            onChange={(e) => {
              setIvaInput(e.target.value);
              setErrorLocal(null);
              setMensajeLocal(null);
            }}
            placeholder="0.21"
            step="0.01"
            min="0"
            max="1"
            className={styles.input}
            disabled={isSubmitting} // Deshabilita el input si la operación de guardado está en curso.
          />
        </div>
        <div className={styles.buttonGroup}>
          {" "}
          <Button
            onClick={handleGuardarClick}
            disabled={isSubmitting}
            text={isSubmitting ? NAMES.CARGANDO : NAMES.GUARDAR_IVA}
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

export default ConfigurarIVA;
