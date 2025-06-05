import styles from "./LoadingSpinner.module.css";
import { NAMES } from "../../utils/Constants/text";

const LoadingSpinner = () => {
  return (
    <div className={styles.spinnerContainer}>
      <div className={styles.spinner}></div>
      <p>{NAMES.CARGANDO}</p>
    </div>
  );
};

export default LoadingSpinner;
