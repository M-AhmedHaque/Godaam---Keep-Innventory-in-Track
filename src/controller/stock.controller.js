import StoreStock from "../models/store_stock.model.js";
import StockMovement from "../models/stockMovement.model.js";
import Store from "../models/store.model.js";
import Product from "../models/product.model.js";
import sequelize from "../db/index.js";
import redisClient from "../config/redis.js";

const invalidateCache = (key) => {
    redisClient.del(key, (err, response) => {
        if (err) console.error("Redis Cache Invalidation Error:", err);
    });
};

const handleStockMovement = async (data) => {
    const { product_id, store_id, supplier_id, quantity, movement_type } = data;

    let stock = await StoreStock.findOne({ where: { product_id, store_id, supplier_id } });

    if (!stock) {
        stock = await StoreStock.create({ product_id, store_id, supplier_id, quantity: 0, selling_price: 0, total_stock: 0 });
    }

    if (movement_type === "stock_in") {
        stock.quantity += quantity;
        stock.total_stock += quantity;
    } else if (movement_type === "sale") {
        stock.quantity -= quantity;
        stock.total_stock -= quantity;
    } else if (movement_type === "removal") {
        stock.quantity -= quantity;
    } else if (movement_type === "return_to_supplier") {
        stock.quantity -= quantity;
    }

    await stock.save();

    await StockMovement.create({
        product_id,
        store_id,
        supplier_id,
        quantity,
        movement_type,
        movement_date: new Date(),
    });

    return { product_id, store_id, supplier_id, quantity, movement_type, updated_quantity: stock.quantity };
};

const addStock = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { store_id, product_id, quantity, supplier_id, user_id, selling_price, notes } = req.body;

        const product = await Product.findByPk(product_id);
        const store = await Store.findByPk(store_id);
        if (!product || !store) {
            return res.status(404).json({ success: false, message: "Product or Store not found" });
        }

        const supplierProduct = await SupplierProduct.findOne({ where: { supplier_id, product_id }, transaction });
        const purchase_price = supplierProduct ? supplierProduct.cost_price : 0;

        let stock = await StoreStock.findOne({ where: { store_id, product_id, supplier_id }, transaction });
        if (!stock) {
            stock = await StoreStock.create({ store_id, product_id, supplier_id, quantity, selling_price, total_stock: quantity }, { transaction });
        } else {
            stock.quantity += quantity;
            stock.total_stock += quantity;
            stock.last_updated = new Date();
            await stock.save({ transaction });
        }

        await StockMovement.create({
            product_id, store_id, supplier_id, user_id,
            quantity, movement_type: "stock_in",
            movement_date: new Date(),
            purchase_price,
            notes
        }, { transaction });

        await transaction.commit();
        emitStockUpdate({
            product_id,
            store_id,
            supplier_id,
            movement_type: "stock_in",
            updated_quantity: stock.quantity,
            cacheKeys: [`stockMovements`, `stockMovements:${store_id}:all:all`, `stockMovements:${store_id}:${product_id}:stock_in`]
          });

        res.status(201).json({ success: true, message: "Stock added successfully", data: stock });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ success: false, message: "Error adding stock", error: error.message });
    }
};

const saleStock = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { store_id, product_id, quantity, user_id, notes } = req.body;
        const stock = await StoreStock.findOne({ where: { store_id, product_id }, transaction });
        if (!stock || stock.quantity < quantity) {
            return res.status(400).json({ success: false, message: "Insufficient stock" });
        }

        const lastPurchase = await StockMovement.findOne({
            where: { product_id, store_id, movement_type: "stock_in" },
            order: [["movement_date", "DESC"]],
            transaction
        });

        const purchase_price = lastPurchase ? lastPurchase.purchase_price : 0;

        stock.quantity -= quantity;
        stock.last_updated = new Date();
        await stock.save({ transaction });

        await StockMovement.create({
            product_id, store_id, user_id,
            quantity, movement_type: "sale",
            movement_date: new Date(),
            purchase_price,
            notes
        }, { transaction });

        await transaction.commit();
        emitStockUpdate({
            product_id,
            store_id,
            supplier_id,
            movement_type: "sale",
            updated_quantity: stock.quantity,
            cacheKeys: [`stockMovements`, `stockMovements:${store_id}:all:all`, `stockMovements:${store_id}:${product_id}:stock_in`]
          });
        // Emit stock update to clients in real-time
        // io.emit("stockUpdated", {
        //     product_id,
        //     store_id,
        //     supplier_id,
        //     movement_type: "stock_in",
        //     updated_quantity: stock.quantity,
        // });
        res.status(200).json({ success: true, message: "Sale recorded successfully", data: stock });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ success: false, message: "Error processing sale", error: error.message });
    }
};

const removeStock = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { store_id, product_id, quantity, user_id, notes } = req.body;

        const stock = await StoreStock.findOne({ where: { store_id, product_id }, transaction });
        if (!stock || stock.quantity < quantity) {
            return res.status(400).json({ success: false, message: "Insufficient stock" });
        }

        const lastPurchase = await StockMovement.findOne({
            where: { product_id, store_id, movement_type: "stock_in" },
            order: [["movement_date", "DESC"]],
            transaction
        });

        const purchase_price = lastPurchase ? lastPurchase.purchase_price : 0;

        stock.quantity -= quantity;
        stock.total_stock -= quantity;
        stock.last_updated = new Date();
        await stock.save({ transaction });

        await StockMovement.create({
            product_id, store_id, user_id,
            quantity, movement_type: "removal",
            movement_date: new Date(),
            purchase_price,  
            notes
        }, { transaction });

        await transaction.commit();
        emitStockUpdate({
            product_id,
            store_id,
            supplier_id,
            movement_type: "removal",
            updated_quantity: stock.quantity,
            cacheKeys: [`stockMovements`, `stockMovements:${store_id}:all:all`, `stockMovements:${store_id}:${product_id}:stock_in`]
          });
        // Emit stock update to clients in real-time
        // io.emit("stockUpdated", {
        //     product_id,
        //     store_id,
        //     supplier_id,
        //     movement_type: "stock_in",
        //     updated_quantity: stock.quantity,
        // });
        res.status(200).json({ success: true, message: "Stock removed successfully", data: stock });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ success: false, message: "Error removing stock", error: error.message });
    }
};

const getStockMovements = async (req, res) => {
    try {
        const { store_id, product_id, movement_type } = req.query;
        const cacheKey = `stockMovements:${store_id || 'all'}:${product_id || 'all'}:${movement_type || 'all'}`;
        const cachedData = await redisClient.get(cacheKey);
        if (cachedData) {
            return res.status(200).json({ success: true, data: JSON.parse(cachedData) });
        }
        
        const whereClause = {};

        if (store_id) whereClause.store_id = store_id;
        if (product_id) whereClause.product_id = product_id;
        if (movement_type) whereClause.movement_type = movement_type;

        const movements = await StockMovement.findAll({
            where: whereClause,
            include: [{ model: Product, attributes: ["name"] }, { model: Store, attributes: ["name"] }]
        });
        redisClient.setex(cacheKey, 300, JSON.stringify(movements));
        res.status(200).json({ success: true, data: movements });

    } catch (error) {
        res.status(500).json({ success: false, message: "Error fetching stock movements", error: error.message });
    }
};

const returnStockToSupplier = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { storeId, productId, supplierId, quantity, reason, userId } = req.body;

        if (!storeId || !productId || !supplierId || !quantity || !userId) {
            return res.status(400).json({ error: "Missing required fields." });
        }

        const stock = await StoreStock.findOne({
            where: { store_id: storeId, product_id: productId, supplier_id: supplierId },
            transaction
        });

        if (!stock || stock.quantity < quantity) {
            await transaction.rollback();
            return res.status(400).json({ error: "Insufficient stock to return." });
        }

        const lastPurchase = await StockMovement.findOne({
            where: { product_id: productId, store_id: storeId, supplier_id: supplierId, movement_type: "stock_in" },
            order: [["movement_date", "DESC"]],
            transaction
        });

        const purchase_price = lastPurchase ? lastPurchase.purchase_price : 0;

        await StockMovement.create({
            product_id: productId,
            store_id: storeId,
            supplier_id: supplierId,
            user_id: userId,  
            quantity,
            movement_type: "return_to_supplier",
            movement_date: new Date(),
            purchase_price,  
            notes: reason,  
        }, { transaction });

        stock.quantity -= quantity;
        await stock.save({ transaction });

        await transaction.commit();
        emitStockUpdate({
            product_id:productId,
            store_id:storeId,
            supplier_id:supplierId,
            movement_type: "return_to_supplier",
            updated_quantity: stock.quantity,
            cacheKeys: [`stockMovements`, `stockMovements:${store_id}:all:all`, `stockMovements:${store_id}:${product_id}:stock_in`]
          });
        return res.status(200).json({ message: "Stock returned successfully." });

    } catch (error) {
        await transaction.rollback();
        console.error("Error returning stock:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


export {addStock,saleStock,removeStock,getStockMovements,returnStockToSupplier,handleStockMovement}
