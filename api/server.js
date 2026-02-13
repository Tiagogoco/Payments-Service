import "dotenv/config";
import app from "./src/app.js";
import { connectDB } from "./src/config/db.js";

connectDB();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servicio de pagos corriendo en el puerto ${PORT}`);
});
