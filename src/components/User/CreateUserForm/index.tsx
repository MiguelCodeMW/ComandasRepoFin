import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../api/axio";
import { User } from "../../../utils/types/RegisterTypes";
import Button from "../../Button/Button";
import styles from "../LoginForm/LoginForm.module.css";
import { ROUTES } from "../../../utils/Constants/routes";
import { NAMES } from "../../../utils/Constants/text";

function CreateUserForm() {
  const [formData, setFormData] = useState<User>({
    name: "",
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
      const res = await api.post(ROUTES.CREATE_USER, formData);
      setMessage(NAMES.REGISTRO_EXITOSO);
      console.log(res.data);

      navigate(ROUTES.LOGIN);
    } catch (error: any) {
      setMessage(NAMES.REGISTRO_ERROR);
      console.error(error.response?.data || error.message);
    }
  };

  return (
    <div className={styles.formContainer}>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h1>{NAMES.REGISTRO_TITULO}</h1>
        <input
          type="text"
          name="name"
          placeholder={NAMES.PLACEHOLDER_NOMBRE_REGISTRO}
          onChange={handleChange}
          value={formData.name}
          className="input"
        />
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
          text={NAMES.REGISTRO_BOTON}
          type="submit"
          className="btn padded"
        />
        <Button
          text={NAMES.VOLVER}
          onClick={() => navigate(ROUTES.LOGIN)}
          className="btn padded"
        />
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
}

export default CreateUserForm;
