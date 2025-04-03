// const { StoreStock, StockMovement, Store, Product, User } = require("../models");
import StoreStock from "../models/store_stock.model.js";
import StockMovement from "../models/stockMovement.model.js";
import Store from "../models/store.model.js";
import Product from "../models/product.model.js";
import sequelize from "../db/index.js";

// Add stock to a store
const addStock = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { store_id, product_id, quantity, supplier_id, user_id, selling_price, notes } = req.body;

        const product = await Product.findByPk(product_id);
        const store = await Store.findByPk(store_id);
        if (!product || !store) {
            return res.status(404).json({ success: false, message: "Product or Store not found" });
        }

        // Fetch purchase price from SupplierProduct
        const supplierProduct = await SupplierProduct.findOne({ where: { supplier_id, product_id }, transaction });
        const purchase_price = supplierProduct ? supplierProduct.cost_price : 0;

        // Ensure StoreStock entry includes supplier_id
        let stock = await StoreStock.findOne({ where: { store_id, product_id, supplier_id }, transaction });
        if (!stock) {
            stock = await StoreStock.create({ store_id, product_id, supplier_id, quantity, selling_price, total_stock: quantity }, { transaction });
        } else {
            stock.quantity += quantity;
            stock.total_stock += quantity;
            stock.last_updated = new Date();
            await stock.save({ transaction });
        }

        // Log stock movement with purchase price
        await StockMovement.create({
            product_id, store_id, supplier_id, user_id,
            quantity, movement_type: "stock_in",
            movement_date: new Date(),
            purchase_price, // ✅ Now tracking purchase price
            notes
        }, { transaction });

        await transaction.commit();
        res.status(201).json({ success: true, message: "Stock added successfully", data: stock });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ success: false, message: "Error adding stock", error: error.message });
    }
};


// Process a sale (reduce stock)
const saleStock = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { store_id, product_id, quantity, user_id, notes } = req.body;

        const stock = await StoreStock.findOne({ where: { store_id, product_id }, transaction });
        if (!stock || stock.quantity < quantity) {
            return res.status(400).json({ success: false, message: "Insufficient stock" });
        }

        // Fetch last purchase price for cost calculation
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
            purchase_price, // ✅ Now tracking cost for profit calculation
            notes
        }, { transaction });

        await transaction.commit();
        res.status(200).json({ success: true, message: "Sale recorded successfully", data: stock });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ success: false, message: "Error processing sale", error: error.message });
    }
};

// Remove stock manually (damage, expiry, etc.)
const removeStock = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { store_id, product_id, quantity, user_id, notes } = req.body;

        const stock = await StoreStock.findOne({ where: { store_id, product_id }, transaction });
        if (!stock || stock.quantity < quantity) {
            return res.status(400).json({ success: false, message: "Insufficient stock" });
        }

        // Fetch last purchase price for cost tracking
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
            purchase_price, // ✅ Now tracking purchase price for loss calculations
            notes
        }, { transaction });

        await transaction.commit();
        res.status(200).json({ success: true, message: "Stock removed successfully", data: stock });

    } catch (error) {
        await transaction.rollback();
        res.status(500).json({ success: false, message: "Error removing stock", error: error.message });
    }
};

const getStockMovements = async (req, res) => {
    try {
        const { store_id, product_id, movement_type } = req.query;
        const whereClause = {};

        if (store_id) whereClause.store_id = store_id;
        if (product_id) whereClause.product_id = product_id;
        if (movement_type) whereClause.movement_type = movement_type;

        const movements = await StockMovement.findAll({
            where: whereClause,
            include: [{ model: Product, attributes: ["name"] }, { model: Store, attributes: ["name"] }]
        });

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

        // Fetch last purchase price
        const lastPurchase = await StockMovement.findOne({
            where: { product_id: productId, store_id: storeId, supplier_id: supplierId, movement_type: "stock_in" },
            order: [["movement_date", "DESC"]],
            transaction
        });

        const purchase_price = lastPurchase ? lastPurchase.purchase_price : 0;

        // Create stock movement entry
        await StockMovement.create({
            product_id: productId,
            store_id: storeId,
            supplier_id: supplierId,
            user_id: userId, // ✅ Passed from request now
            quantity,
            movement_type: "return_to_supplier",
            movement_date: new Date(),
            purchase_price, // ✅ Track actual purchase price
            notes: reason, // ✅ Store return reason
        }, { transaction });

        // Update stock quantity
        stock.quantity -= quantity;
        await stock.save({ transaction });

        await transaction.commit();
        return res.status(200).json({ message: "Stock returned successfully." });

    } catch (error) {
        await transaction.rollback();
        console.error("Error returning stock:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};


export {addStock,saleStock,removeStock,getStockMovements,returnStockToSupplier}

// //  Get Stock Levels for a Store
// const getStoreStock = async (req, res) => {
//     try {
//         const { storeId } = req.params;
//         const stock = await StoreStock.findAll({
//             where: { store_id: storeId },
//             include: [{ model: Product, attributes: ["id", "name", "description", "status"] }]
//         });

//         return res.json(stock);
//     } catch (error) {
//         return res.status(500).json({ message: "Error fetching store stock", error: error.message });
//     }
// };

// Get Stock Details for a Specific Product in a Store
// const getStockDetails = async (req, res) => {
//     try {
//         const { storeId, productId } = req.params;
//         const stock = await StoreStock.findOne({
//             where: { store_id: storeId, product_id: productId },
//             include: [{ model: Product, attributes: ["id", "name", "description", "status"] }]
//         });

//         if (!stock) return res.status(404).json({ message: "Stock record not found" });

//         return res.json(stock);
//     } catch (error) {
//         return res.status(500).json({ message: "Error fetching stock details", error: error.message });
//     }
// };



//Update Stock Levels (Quantity, Selling Price)
// const updateStock = async (req, res) => {
//     try {
//         const { storeId, productId } = req.params;
//         const { quantity, selling_price } = req.body;

//         const stock = await StoreStock.findOne({ where: { store_id: storeId, product_id: productId } });

//         if (!stock) return res.status(404).json({ message: "Stock record not found" });

//         stock.quantity = quantity;
//         stock.selling_price = selling_price;
//         stock.last_updated = new Date();

//         await stock.save();

//         return res.json({ message: "Stock updated successfully", stock });
//     } catch (error) {
//         return res.status(500).json({ message: "Error updating stock", error: error.message });
//     }
// };


// // ✅ 4. Record Stock Movement (Stock In, Sale, Removal)
// const recordStockMovement = async (req, res) => {
//     try {
//         const { product_id, store_id, supplier_id, user_id, quantity, movement_type, notes } = req.body;

//         // Validate movement type
//         if (!["stock_in", "sale", "removal"].includes(movement_type)) {
//             return res.status(400).json({ message: "Invalid movement type" });
//         }

//         // Get the stock record
//         let stock = await StoreStock.findOne({ where: { store_id, product_id } });

//         if (!stock) return res.status(404).json({ message: "Stock record not found" });

//         // Adjust stock based on movement type
//         if (movement_type === "stock_in") {
//             stock.quantity += quantity;
//             stock.total_stock += quantity;
//         } else if (movement_type === "sale" || movement_type === "removal") {
//             if (stock.quantity < quantity) return res.status(400).json({ message: "Not enough stock available" });

//             stock.quantity -= quantity;
//             stock.total_stock -= quantity;
//         }

//         // Update stock record
//         stock.last_updated = new Date();
//         await stock.save();

//         // Create a stock movement entry
//         await StockMovement.create({
//             product_id,
//             store_id,
//             supplier_id,
//             user_id,
//             quantity,
//             movement_type,
//             notes
//         });

//         return res.json({ message: "Stock movement recorded successfully" });
//     } catch (error) {
//         return res.status(500).json({ message: "Error recording stock movement", error: error.message });
//     }
// };
// Get stock movements with filters (by store, product, or movement type)


// export {getStockDetails,getStoreStock,getStockMovements,recordStockMovement,updateStock}

// import Stock from "../models/store_stock.model.js";
// import Product from "../models/product.model.js";

// const getCurrentStock = async (productId) => {
//     const stockMovements = await Stock.findAll({ where: { product_id: productId } });
//     return stockMovements.reduce(
//         (sum, item) => sum + (item.movement_type === "BUY" ? item.quantity : -item.quantity),
//         0
//     );
// };

// const buyStock = async(req,res)=>{
//     const { quantity } = req.body;
//     const productId = req.params.id;

//     if (!quantity || quantity <= 0) {
//         return res.status(400).json({ error: "Invalid quantity" });
//     }

//     // Ensure product exists
//     const product = await Product.findByPk(productId);
//     if (!product) {
//         return res.status(404).json({ error: "Product not found" });
//     }

//     // Add stock
//     await Stock.create({ product_id: productId, quantity, movement_type: "BUY" });
//     res.json({ message: `Added ${quantity} units to stock` });
// }

// const sellStock = async(req,res)=>{
//     const { quantity } = req.body;
//     const productId = req.params.id;

//     if (!quantity || quantity <= 0) {
//         return res.status(400).json({ error: "Invalid quantity" });
//     }

//     // Ensure product exists
//     const product = await Product.findByPk(productId);
//     if (!product) {
//         return res.status(404).json({ error: "Product not found" });
//     }

//     // Check if enough stock is available
//     const currentStock = await getCurrentStock(productId);
//     if (currentStock < quantity) {
//         return res.status(400).json({ error: "Not enough stock available" });
//     }

//     // Deduct stock
//     await Stock.create({ product_id: productId, quantity, movement_type: "SELL" });
//     res.json({ message: `Sold ${quantity} units` });
// }
// const getInventory = async(req,res)=>{
//     const productId = req.params.id;

//     // Ensure product exists
//     const product = await Product.findByPk(productId);
//     if (!product) {
//         return res.status(404).json({ error: "Product not found" });
//     }

//     const totalStock = await getCurrentStock(productId);
//     res.json({ productId, totalStock });
// }

// export {
//     buyStock,
//     sellStock,
//     getInventory
// }