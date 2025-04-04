import Product from "../models/product.model.js";
import Supplier from "../models/supplier.model.js";
import SupplierProduct from "../models/supplier_product.js";
import sequelize from "../db/index.js";
import redisClient from "../config/redis.js";
const CACHE_EXPIRATION = 600;
// add supplier
const addSupplier = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { name, email, contact_info } = req.body;

        if (!name || !contact_info || !email) {
            return res.status(400).json({ error: "All fields are required" });
        }

        // Check if supplier already exists by email (or any other unique field)
        const existingSupplier = await Supplier.findOne({ where: { email } }, { transaction });

        if (existingSupplier) {
            return res.status(400).json({ error: "Supplier with this email already exists." });
        }

        // Create new supplier
        const supplier = await Supplier.create({ name, email, contact_info }, { transaction });
        
        if (!supplier) {
            await transaction.rollback();
            return res.status(400).json({ error: "Error in creating supplier." });
        }

        await transaction.commit();
        
        await redisClient.del("suppliers:all");
        await redisClient.del(`current_stock:${JSON.stringify(req.query)}`);
        await redisClient.del(`stock_movements:${JSON.stringify(req.query)}`);
        await redisClient.del(`supplier_report:${JSON.stringify(req.query)}`);
        await redisClient.del(`profit_sales:${JSON.stringify(req.query)}`);
        

        return res.status(201).json({ message: "Supplier created successfully.", supplier });
    } catch (error) {
        await transaction.rollback();
        console.error("Error adding supplier:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

//  Delete Supplier
const deleteSupplier = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const supplierId = req.params.id;

        // Check if supplier exists
        const supplier = await Supplier.findByPk(supplierId, { transaction });

        if (!supplier) {
            await transaction.rollback();
            return res.status(404).json({ error: "Supplier not found." });
        }

        // Delete associated supplier-product relationships
        await SupplierProduct.destroy({ where: { supplier_id: supplierId }, transaction });

        // Delete the supplier
        await supplier.destroy({ transaction });

        await transaction.commit();

        await redisClient.del("suppliers:all");
        await redisClient.del(`supplier:${supplierId}`);
        await redisClient.del(`supplier:products:${supplierId}`);

        await redisClient.del(`current_stock:${JSON.stringify(req.query)}`);
        await redisClient.del(`stock_movements:${JSON.stringify(req.query)}`);
        await redisClient.del(`supplier_report:${JSON.stringify(req.query)}`);
        await redisClient.del(`profit_sales:${JSON.stringify(req.query)}`);

        return res.status(200).json({ message: "Supplier deleted successfully." });
    } catch (error) {
        await transaction.rollback();
        console.error("Error deleting supplier:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

//  Get All Suppliers
const getAllSuppliers = async (req, res) => {
    try {
        // Fetch all suppliers
        const cacheKey = "suppliers:all";

        // Check cache first
        const cachedSuppliers = await redisClient.get(cacheKey);
        if (cachedSuppliers) {
            return res.status(200).json({ message: "Suppliers fetched from cache.", suppliers: JSON.parse(cachedSuppliers) });
        }

        const suppliers = await Supplier.findAll();
        await redisClient.set(cacheKey, JSON.stringify(suppliers), "EX", CACHE_EXPIRATION);
        return res.status(200).json({ message: "Suppliers fetched successfully.", suppliers });
    } catch (error) {
        console.error("Error fetching suppliers:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const addSupplierToProduct = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { productId, supplierId, costPrice, status } = req.body;

        // Validate input
        if (!productId || !supplierId || !costPrice || !status) {
            return res.status(400).json({ error: "All fields are required." });
        }

        // Fetch the product and supplier to ensure they exist
        const product = await Product.findByPk(productId, { transaction });
        const supplier = await Supplier.findByPk(supplierId, { transaction });

        if (!product || !supplier) {
            await transaction.rollback();
            return res.status(404).json({ error: "Product or Supplier not found." });
        }

        // Create the relationship between product and supplier
        await SupplierProduct.create(
            { supplier_id: supplierId, product_id: productId, cost_price: costPrice, status },
            { transaction }
        );

        await transaction.commit();

        await redisClient.del(`product:suppliers:${productId}`);
        await redisClient.del(`supplier:products:${supplierId}`);

        return res.status(201).json({ message: "Supplier added to product successfully." });

    } catch (error) {
        await transaction.rollback();
        console.error("Error adding supplier to product:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const getSuppliersForProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const cacheKey = `product:suppliers:${productId}`;

        // Check cache first
        const cachedSuppliers = await redisClient.get(cacheKey);
        if (cachedSuppliers) {
            return res.status(200).json({ message: "Suppliers fetched from cache.", suppliers: JSON.parse(cachedSuppliers) });
        }

        // Fetch the product along with its suppliers
        const product = await Product.findByPk(productId, {
            include: { model: Supplier, through: { attributes: ['cost_price', 'status'] } }
        });

        if (!product) {
            return res.status(404).json({ error: "Product not found." });
        }
        await redisClient.setex(cacheKey, CACHE_EXPIRATION, JSON.stringify(product.Suppliers));
        return res.status(200).json({ message: "Suppliers fetched successfully.", suppliers: product.Suppliers });
    } catch (error) {
        console.error("Error fetching suppliers for product:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const getProductsBySupplier = async (req, res) => {
    try {
        const supplierId = req.params.id;
        const cacheKey = `supplier:products:${supplierId}`;

        // Check cache first
        const cachedProducts = await redisClient.get(cacheKey);
        if (cachedProducts) {
            return res.status(200).json({ message: "Products fetched from cache.", products: JSON.parse(cachedProducts) });
        }
        // Fetch the supplier along with its products
        const supplier = await Supplier.findByPk(supplierId, {
            include: { model: Product, through: { attributes: ['cost_price', 'status'] } }
        });

        if (!supplier) {
            return res.status(404).json({ error: "Supplier not found." });
        }
        await redisClient.setex(cacheKey, CACHE_EXPIRATION, JSON.stringify(supplier.Products));
        return res.status(200).json({ message: "Products fetched successfully.", products: supplier.Products });
    } catch (error) {
        console.error("Error fetching products for supplier:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export {addSupplier,deleteSupplier,getAllSuppliers,getProductsBySupplier,getSuppliersForProduct,addSupplierToProduct}