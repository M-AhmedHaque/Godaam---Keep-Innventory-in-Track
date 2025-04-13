import { EventEmitter } from "events";

const stockEventEmitter = new EventEmitter();

const STOCK_UPDATED = "stock_updated";

const emitStockUpdate = (payload) => {
  stockEventEmitter.emit(STOCK_UPDATED, payload);
};

export { stockEventEmitter, emitStockUpdate, STOCK_UPDATED };
