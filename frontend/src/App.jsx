import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Balance from "./pages/Balance";
import "./App.css"

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Dashboard />} />

        <Route path="/students" element={<Students />} />

        <Route path="/products" element={<Products />} />

        <Route path="/orders" element={<Orders />} />

        <Route path="/balance" element={<Balance />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;