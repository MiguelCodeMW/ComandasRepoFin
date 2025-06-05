import styles from "./ComandaDetalle.module.css";
import { NAMES } from "../../../utils/Constants/text";
import { ComandaResumenTotalesProps } from "../../../utils/types/ComandaTypes";

function ComandaResumenTotales({
  subtotal,
  ivaPorcentaje,
  totalConIva,
  monedaComanda,
}: ComandaResumenTotalesProps) {
  return (
    <div className={styles.totalesBox}>
      <p className={styles.detalleInfo}>
        {NAMES.SUBTOTAL} {subtotal.toFixed(2)} {monedaComanda}
      </p>
      <p className={styles.detalleInfo}>
        IVA ({(ivaPorcentaje * 100).toFixed(0)}%):
        {(subtotal * ivaPorcentaje).toFixed(2)} {monedaComanda}
      </p>
      <p className={styles.detalleInfo}>
        <strong>
          {NAMES.TOTAL_CON_IVA} {totalConIva.toFixed(2)} {monedaComanda}
        </strong>
      </p>
    </div>
  );
}

export default ComandaResumenTotales;
