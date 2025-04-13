import { handleStockMovement } from "../controller/stock.controller.js";
export const stockSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        socket.on("stock_update", async (data) => {
            console.log("Stock update received:", data);

            const updatedStock = await handleStockMovement(data);

            io.emit("stock_updated", updatedStock);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });
};
