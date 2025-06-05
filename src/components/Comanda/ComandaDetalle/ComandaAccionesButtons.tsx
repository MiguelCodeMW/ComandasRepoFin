import { useNavigate } from "react-router-dom";
import Button from "../../Button/Button";
import styles from "./ComandaDetalle.module.css";
import { ROUTES } from "../../../utils/Constants/routes";
import { NAMES } from "../../../utils/Constants/text";
import { ComandaAccionesButtonsProps } from "../../../utils/types/ComandaTypes";

function ComandaAccionesButtons({
  comanda,
  user,
  onEditar,
  onPagar,
  onBorrar,
}: ComandaAccionesButtonsProps) {
  const navigate = useNavigate();

  if (!comanda) return null;

  return (
    <div className={styles.accionesContainer}>
      {comanda.estado !== "cerrada" && (
        <Button
          text={NAMES.ID_COMANDA_EDITAR}
          onClick={onEditar}
          className={`${styles.button} ${styles.editarButton}`}
        />
      )}
      {comanda.estado !== "cerrada" && (
        <Button
          text={NAMES.COMANDA_PAGAR}
          onClick={onPagar}
          className={`${styles.button} ${styles.pagarButton}`}
        />
      )}
      {user?.role === NAMES.ROL_ADMIN && comanda.estado !== "cerrada" && (
        <Button
          text={NAMES.COMANDA_BUTTON_BORRAR}
          onClick={onBorrar}
          className={`${styles.button} ${styles.borrarButton}`}
        />
      )}
      <Button
        text={NAMES.VOLVER}
        onClick={() => navigate(ROUTES.DASHBOARD)}
        className={`${styles.button} ${styles.dashboardButton}`}
      />
    </div>
  );
}

export default ComandaAccionesButtons;
