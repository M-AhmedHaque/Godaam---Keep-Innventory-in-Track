import { handleStockMovement } from "../controller/stock.controller.js";
export const stockSocket = (io) => {
    io.on("connection", (socket) => {
        console.log("Client connected:", socket.id);

        socket.on("stock_update", async (data) => {
            console.log("Stock update received:", data);

            // Process stock movement in DB
            const updatedStock = await handleStockMovement(data);

            // Notify all clients of stock change
            io.emit("stock_updated", updatedStock);
        });

        socket.on("disconnect", () => {
            console.log("Client disconnected:", socket.id);
        });
    });
};
