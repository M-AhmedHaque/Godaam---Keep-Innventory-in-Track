import Store from "../models/store.model.js";
import Product from "../models/product.model.js";
import StockMovement from "../models/stockMovement.model.js";
import User from "../models/user.model.js";
import StoreStock from "../models/store_stock.model.js";
import sequelize from "../db/index.js";

const createStore = async (req, res) => {
    const transaction = await sequelize.transaction();
    try {
        const { name, address } = req.body;
        if (!name || !address) {
            return res.status(400).json({ error: "Store name and address are required." });
        }
        // Create new store
        const store = await Store.create({ name, address }, { transaction });
        await transaction.commit();
        return res.status(201).json({ message: "Store created successfully.", store });
    } catch (error) {
        await transaction.rollback();
        console.error("Error creating store:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const getAllStores = async (req, res) => {
    try {
        const stores = await Store.findAll();
        return res.status(200).json({ message: "Stores fetched successfully.", stores });
    } catch (error) {
        console.error("Error fetching stores:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const getStoreDetails = async (req, res) => {
    try {
        const storeId = req.params.id;
        const store = await Store.findByPk(storeId, {
            include: [
                {
                    model: Product,
                    through: { attributes: ['quantity', 'selling_price', 'total_stock'] },
                    include: [{ model: Image, attributes: ["image_url"] }] // Optional: Fetch product images
                }
            ]
        });
        if (!store) {
            return res.status(404).json({ error: "Store not found." });
        }
        return res.status(200).json({ message: "Store details fetched successfully.", store });
    } catch (error) {
        console.error("Error fetching store details:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const updateStore = async (req, res) => {
    const storeId = req.params.id;
    const { name, address } = req.body;
    try {
        const store = await Store.findByPk(storeId);
        if (!store) {
            return res.status(404).json({ error: "Store not found." });
        }
        store.name = name || store.name;
        store.address = address || store.address;
        await store.save();
        return res.status(200).json({ message: "Store updated successfully.", store });
    } catch (error) {
        console.error("Error updating store:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const deleteStore = async (req, res) => {
    const storeId = req.params.id;
    const transaction = await sequelize.transaction();
    try {
        const store = await Store.findByPk(storeId, { transaction });
        if (!store) {
            await transaction.rollback();
            return res.status(404).json({ error: "Store not found." });
        }
        // Delete associated data (like users, stock) if necessary
        await User.update({ store_id: null }, { where: { store_id: storeId }, transaction });
        await StoreStock.destroy({ where: { store_id: storeId }, transaction });
        await StockMovement.destroy({ where: { store_id: storeId }, transaction });
        await store.destroy({ transaction });
        // await store.destroy({ transaction });
        await transaction.commit();
        return res.status(200).json({ message: "Store deleted successfully." });
    } catch (error) {
        await transaction.rollback();
        console.error("Error deleting store:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get Stock Details for a all Product in a Store
const getStoreStock = async (req, res) => {
    try {
        const storeId = req.params.id;
        const storeStock = await StoreStock.findAll({
            where: { store_id: storeId },
            include: [{ model: Product, attributes: ["id", "name", "description", "status"] },
            { model: Supplier, attributes: ["id", "name"] }
        ]    
        });
        if (!storeStock.length) {
            return res.status(404).json({ error: "No stock found for this store." });
        }
        return res.status(200).json({ message: "Store stock fetched successfully.", storeStock });
    } catch (error) {
        console.error("Error fetching store stock:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

// Get Stock Details for a Specific Product in a Store
const getStockDetails = async (req, res) => {
    try {
        const { storeId, productId } = req.params;
        const stock = await StoreStock.findOne({
            where: { store_id: storeId, product_id: productId },
            include: [{ model: Product, attributes: ["id", "name", "description", "status"] },
            { model: Supplier, attributes: ["id", "name"] }
        ]
        });
        if (!stock) return res.status(404).json({ message: "Stock record not found" });
        return res.json(stock);
    } catch (error) {
        return res.status(500).json({ message: "Error fetching stock details", error: error.message });
    }
};

const calculateProfit = async (req,res) => {
    try {
        const storeId = req.params.id
        // Fetch stock movements for the store
        const stockMovements = await StockMovement.findAll({
            where: { store_id: storeId },
            attributes: ["movement_type", "quantity", "purchase_price"],
            include: [{ model: StoreStock, attributes: ["selling_price"] }]
        });

        let totalSalesRevenue = 0;
        let totalCostOfSoldItems = 0;
        let totalLossesDueToRemoval = 0;
        let totalSupplierReturnCost = 0;

        for (const movement of stockMovements) {
            const { movement_type, quantity, purchase_price } = movement;
            const selling_price = movement.StoreStock ? movement.StoreStock.selling_price : 0;

            switch (movement_type) {
                case "sale":
                    totalSalesRevenue += selling_price * quantity;
                    totalCostOfSoldItems += purchase_price * quantity;
                    break;

                case "removal":
                    totalLossesDueToRemoval += purchase_price * quantity;
                    break;

                case "return_to_supplier":
                    totalSupplierReturnCost += purchase_price * quantity;
                    break;
            }
        }

        // Profit calculation
        const profit =
            totalSalesRevenue - totalCostOfSoldItems - totalLossesDueToRemoval - totalSupplierReturnCost;

        return {
            totalSalesRevenue,
            totalCostOfSoldItems,
            totalLossesDueToRemoval,
            totalSupplierReturnCost,
            profit,
        };
    } catch (error) {
        console.error("Error calculating profit:", error);
        throw new Error("Internal Server Error");
    }
};


export {
    createStore,
    getAllStores,
    getStoreDetails,
    updateStore,
    deleteStore,
    getStoreStock,
    getStockDetails,
    calculateProfit
};



// // will be removed
// const addStockToStore = async (req, res) => {
//     const transaction = await sequelize.transaction();
//     try {
//         const { storeId, productId,supplierId, quantity, sellingPrice } = req.body;

//         if (!storeId || !productId || !quantity || !sellingPrice) {
//             return res.status(400).json({ error: "All fields are required." });
//         }

//         const store = await Store.findByPk(storeId);
//         const product = await Product.findByPk(productId);

//         if (!store || !product) {
//             return res.status(404).json({ error: "Store or Product not found." });
//         }

//         // Check if the product already exists in store stock
//         let storeStock = await StoreStock.findOne({ where: { store_id: storeId, product_id: productId }, transaction });

//         if (!storeStock) {
//             storeStock = await StoreStock.create(
//                 { store_id: storeId, product_id: productId, quantity, selling_price: sellingPrice, total_stock: quantity },
//                 { transaction }
//             );
//         } else {
//             storeStock.quantity += quantity;
//             storeStock.total_stock += quantity;
//             await storeStock.save({ transaction });
//         }

//         // Log stock movement
//         await StockMovement.create(
//             { store_id: storeId, product_id: productId, quantity, movement_type: "stock_in", user_id: req.user.id,supplier_id: supplierId || null },
//             { transaction }
//         );

//         await transaction.commit();
//         return res.status(200).json({ message: "Stock added to store successfully.", storeStock });
//     } catch (error) {
//         await transaction.rollback();
//         console.error("Error adding stock to store:", error);
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// };

// // will be removed
// const removeStockFromStore = async (req, res) => {
//     const transaction = await sequelize.transaction();

//     try {
//         const { storeId, productId, quantity } = req.body;

//         if (!storeId || !productId || !quantity) {
//             return res.status(400).json({ error: "Store ID, Product ID, and Quantity are required." });
//         }

//         const store = await Store.findByPk(storeId);
//         const product = await Product.findByPk(productId);

//         if (!store || !product) {
//             return res.status(404).json({ error: "Store or Product not found." });
//         }

//         const storeStock = await StoreStock.findOne({ where: { store_id: storeId, product_id: productId }, transaction });

//         // if (!storeStock || storeStock.quantity < quantity) {
//         //     return res.status(400).json({ error: "Insufficient stock." });
//         // }
//         if (!storeStock || storeStock.total_stock < quantity) {
//             return res.status(400).json({ error: "Insufficient total stock." });
//         }

//         storeStock.quantity -= quantity;
//         storeStock.total_stock -= quantity;
//         await storeStock.save({ transaction });

//         // Log stock movement
//         await StockMovement.create(
//             { store_id: storeId, product_id: productId, quantity, movement_type: "sale", user_id: req.user.id },
//             { transaction }
//         );

//         await transaction.commit();
//         return res.status(200).json({ message: "Stock removed from store successfully.", storeStock });
//     } catch (error) {
//         await transaction.rollback();
//         console.error("Error removing stock from store:", error);
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// };

// // will be removed
// const getStockMovements = async (req, res) => {
//     try {
//         const storeId = req.params.id;

//         const stockMovements = await StockMovement.findAll({
//             where: { store_id: storeId },
//             include: [
//                 { model: Product },
//                 { model: User, attributes: ["name"] },
//                 { model: Supplier, attributes: ["name"] }
//             ]
//         });

//         if (!stockMovements.length) {
//             return res.status(404).json({ error: "No stock movements found for this store." });
//         }

//         return res.status(200).json({ message: "Stock movements fetched successfully.", stockMovements });
//     } catch (error) {
//         console.error("Error fetching stock movements:", error);
//         return res.status(500).json({ error: "Internal Server Error" });
//     }
// };

