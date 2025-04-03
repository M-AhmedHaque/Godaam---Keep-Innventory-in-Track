import { Op } from "sequelize";
import StockMovement from "../models/stockMovement.model.js";
import StoreStock from "../models/storeStock.model.js";
import Store from "../models/store.model.js";
import Product from "../models/product.model.js";
import Supplier from "../models/supplier.model.js";
import SupplierProduct from "../models/supplierProduct.model.js";
import User from "../models/user.model.js";
/**
 * Get Stock Movement Report with Filtering
 */
const getStockMovements = async (req, res) => {
  try {
      const { store_id, product_id, supplier_id, movement_type, start_date, end_date, user_id } = req.query;
      
      const whereClause = {};
      if (store_id) whereClause.store_id = store_id;
      if (product_id) whereClause.product_id = product_id;
      if (supplier_id) whereClause.supplier_id = supplier_id;
      if (movement_type) whereClause.movement_type = movement_type;
      if (user_id) whereClause.user_id = user_id;
      if (start_date && end_date) {
          whereClause.movement_date = { [Op.between]: [new Date(start_date), new Date(end_date)] };
      }

      const stockMovements = await StockMovement.findAll({
          where: whereClause,
          include: [
              { model: Product, attributes: ["id", "name"] },
              { model: Store, attributes: ["id", "name"] },
              { model: Supplier, attributes: ["id", "name"] },
              { model: User, attributes: ["id", "name"] } // Correct import
          ],
          order: [["movement_date", "DESC"]]
      });

      res.json(stockMovements);
  } catch (error) {
      res.status(500).json({ error: error.message });
  }
};


/**
 * Get Current Stock Report with Filtering
 */
const getCurrentStock = async (req, res) => {
    try {
        const { store_id, product_id, supplier_id, min_quantity, max_quantity } = req.query;
        
        const whereClause = {};
        if (store_id) whereClause.store_id = store_id;
        if (product_id) whereClause.product_id = product_id;
        if (supplier_id) whereClause.supplier_id = supplier_id;
        if (min_quantity) whereClause.quantity = { [Op.gte]: parseInt(min_quantity) };
        if (max_quantity) whereClause.quantity = { ...whereClause.quantity, [Op.lte]: parseInt(max_quantity) };

        const stockData = await StoreStock.findAll({
            where: whereClause,
            include: [
                { model: Product, attributes: ["id", "name"] },
                { model: Store, attributes: ["id", "name"] },
                { model: Supplier, attributes: ["id", "name"] }
            ],
            order: [["last_updated", "DESC"]]
        });

        res.json(stockData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get Supplier Report with Filtering
 */
const getSupplierReport = async (req, res) => {
    try {
        const { supplier_id, start_date, end_date } = req.query;
        
        const whereClause = {};
        if (supplier_id) whereClause.supplier_id = supplier_id;
        if (start_date && end_date) {
            whereClause.createdAt = { [Op.between]: [new Date(start_date), new Date(end_date)] };
        }

        const supplierData = await SupplierProduct.findAll({
            where: whereClause,
            include: [
                { model: Supplier, attributes: ["id", "name"] },
                { model: Product, attributes: ["id", "name"] }
            ],
            order: [["createdAt", "DESC"]]
        });

        res.json(supplierData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

/**
 * Get Profit and Sales Report
 */const getProfitAndSalesReport = async (req, res) => {
  try {
    const { store_id, product_id, start_date, end_date } = req.query;
    
    const whereClause = { movement_type: "sale" };
    if (store_id) whereClause.store_id = store_id;
    if (product_id) whereClause.product_id = product_id;
    if (start_date && end_date) {
        whereClause.movement_date = { [Op.between]: [new Date(start_date), new Date(end_date)] };
    }

    const salesData = await StockMovement.findAll({
        where: whereClause,
        include: [
            { model: Product, attributes: ["id", "name"] },
            { model: SupplierProduct, attributes: ["cost_price"] }  // Get cost price from SupplierProduct
        ]
    });

    let totalRevenue = 0, totalCost = 0, totalProfit = 0;

    salesData.forEach(sale => {
        const sellingPrice = sale.purchase_price || 0; // Assuming selling_price is stored in StockMovement
        const costPrice = sale.SupplierProduct?.cost_price || 0;  

        totalRevenue += sale.quantity * sellingPrice;
        totalCost += sale.quantity * costPrice;
    });

    totalProfit = totalRevenue - totalCost;

    res.json({ totalRevenue, totalCost, totalProfit });
} catch (error) {
    res.status(500).json({ error: error.message });
}
};

export {getSupplierReport,getProfitAndSalesReport,getStockMovements,getCurrentStock}
