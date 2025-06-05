export type ConfigurarMonedaProps = {
  onGuardado: (nuevaMoneda: string) => Promise<void>;
  monedaActual: string | null;
  onCancelar: () => void;
  errorExterno?: string | null;
};

export type ErrorMessageProps = {
  message: string;
  onRetry?: () => void;
};

export interface ConfigurarIVAProps {
  onGuardado: (nuevoIva: number) => Promise<void>;
  ivaActual: number | null;
  onCancelar: () => void;
  errorExterno?: string | null;
}
