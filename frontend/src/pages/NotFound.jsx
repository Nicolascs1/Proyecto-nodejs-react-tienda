import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <h1 className="text-5xl font-bold text-red-500">404</h1>
      <p className="text-xl mt-2">Página no encontrada</p>
      <Link to="/" className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg">
        Volver al inicio
      </Link>
    </div>
  );
}

export default NotFound;
