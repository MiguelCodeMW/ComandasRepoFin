import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axio";
import Button from "../../Button/Button";
import styles from "./LoginForm.module.css";
import { ROUTES } from "../../../utils/Constants/routes";
import { NAMES } from "../../../utils/Constants/text";

function LoginForm() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const res = await api.post(ROUTES.LOGIN, formData);
      const token = res.data.token;
      localStorage.setItem(NAMES.TOKEN, token);

      // Obtener datos del usuario autenticado y guardarlos en localStorage
      const userRes = await api.get(ROUTES.USER, {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.setItem(NAMES.USER, JSON.stringify(userRes.data));

      setMessage(NAMES.LOGIN_EXITOSO);
      navigate(ROUTES.DASHBOARD);
    } catch (error: any) {
      setMessage(NAMES.LOGIN_ERROR);
      console.error(error.response?.data || error.message);
    }
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1>Iniciar Sesión</h1>
        <input
          type="email"
          name="email"
          placeholder={NAMES.PLACEHOLDER_EMAIL}
          onChange={handleChange}
          value={formData.email}
          className="input"
        />
        <input
          type="password"
          name="password"
          placeholder={NAMES.PLACEHOLDER_PASSWORD}
          onChange={handleChange}
          value={formData.password}
          className="input"
        />
        <Button
          text={NAMES.LOGIN_TITULO}
          type="submit"
          className="btn padded"
        />
        <Button
          text={NAMES.REGISTRO_TITULO}
          onClick={() => navigate(ROUTES.CREATE_USER)}
          className="btn padded"
        />
        {message && <p className="message">{message}</p>}
      </form>
    </div>
  );
}

export default LoginForm;
