import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error específico cuando el usuario empieza a escribir
    setErrors(prev => ({
      ...prev,
      [name]: ""
    }));
  };

  const validatePassword = (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const errors = [];
    if (password.length < minLength) {
      errors.push(`La contraseña debe tener al menos ${minLength} caracteres`);
    }
    if (!hasUpperCase) {
      errors.push("Debe contener al menos una letra mayúscula");
    }
    if (!hasLowerCase) {
      errors.push("Debe contener al menos una letra minúscula");
    }
    if (!hasNumbers) {
      errors.push("Debe contener al menos un número");
    }
    if (!hasSpecialChar) {
      errors.push("Debe contener al menos un carácter especial (!@#$%^&*(),.?\":{}|<>)");
    }

    return errors;
  };

  const validateForm = () => {
    let isValid = true;
    const newErrors = {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    };

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio";
      isValid = false;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = "El email es obligatorio";
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = "Por favor, ingresa un email válido";
      isValid = false;
    }

    // Validar contraseña
    const passwordErrors = validatePassword(formData.password);
    if (!formData.password) {
      newErrors.password = "La contraseña es obligatoria";
      isValid = false;
    } else if (passwordErrors.length > 0) {
      newErrors.password = passwordErrors.join("\n");
      isValid = false;
    }

    // Validar confirmación de contraseña
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Debes confirmar tu contraseña";
      isValid = false;
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Las contraseñas no coinciden";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setSuccess(false);
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/register`,
        {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          role: "cliente"
        }
      );

      if (response.data) {
        setSuccess(true);
        setFormData({
          name: "",
          email: "",
          password: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
    } catch (error) {
      console.error("Error en el registro:", error);
      if (error.response?.data?.message === "El email ya está registrado") {
        setErrors(prev => ({
          ...prev,
          email: "Este email ya está registrado"
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          email: "Error al registrar el usuario. Por favor, intenta nuevamente."
        }));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">Registro de Cliente</h1>
        
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            ✅ Registro exitoso. Serás redirigido al login...
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nombre completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : ""
              }`}
              placeholder="Ingresa tu nombre completo"
              required
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : ""
              }`}
              placeholder="ejemplo@correo.com"
              required
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.password ? "border-red-500" : ""
              }`}
              placeholder="Mínimo 8 caracteres"
              required
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-500 whitespace-pre-line">{errors.password}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              La contraseña debe contener:
            </p>
            <ul className="mt-1 text-sm text-gray-500 list-disc list-inside">
              <li>Al menos 8 caracteres</li>
              <li>Una letra mayúscula</li>
              <li>Una letra minúscula</li>
              <li>Un número</li>
              <li>Un carácter especial (&#33;&#64;&#35;&#36;&#37;&#94;&#38;&#42;&#40;&#41;&#44;&#46;&#63;&#58;&#34;&#123;&#125;&#124;&#60;&#62;)</li>
            </ul>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.confirmPassword ? "border-red-500" : ""
              }`}
              placeholder="Repite tu contraseña"
              required
            />
            {errors.confirmPassword && (
              <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || success}
            className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
              loading || success
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            }`}
          >
            {loading ? "Registrando..." : success ? "Registro Exitoso" : "Registrarse"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes una cuenta?{" "}
            <a href="/login" className="text-blue-500 hover:text-blue-600">
              Inicia sesión
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;
