import { createRoot } from "react-dom/client";
import App from "./App";
import { CartProvider } from '../src/context/cartContext';
import "./index.css";

createRoot(document.getElementById("root")!).render(<CartProvider><App /></CartProvider>);
