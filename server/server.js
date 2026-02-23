import app from "./app.js";
const PORT = process.env.SERVER_PORT || 4000;


app.listen(PORT, '0.0.0.0', () => {

  console.log(`🚀 SEB Backend running on port ${PORT}`);
});
