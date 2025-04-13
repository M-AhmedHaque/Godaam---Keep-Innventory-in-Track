import Image from "../models/image.model.js";
import Product from "../models/product.model.js";
import { uploadOnCloud } from "../utility/cloudinary.js";
import cloudinary from "cloudinary";
import redisClient from "../config/redis.js";
import sequelize from "../db/index.js";

const addProduct = async (req, res) => {

    const transaction = await sequelize.transaction();

    try {
        const { name, description } = req.body;

        if (!name || !description) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const product = await Product.create({ name, description }, { transaction });

        if (req.files && req.files.length > 0) {
            const uploadedImages = [];

            for (const file of req.files) {
                try {
                    const result = await uploadOnCloud(file.path);
                    if (result) {
                        const image = await Image.create(
                            { product_id: product.id, image_url: result.secure_url },
                            { transaction }
                        );
                        uploadedImages.push(image);
                    }
                } catch (uploadError) {
                    console.error("Cloudinary upload failed:", uploadError);
                    
                    for (const img of uploadedImages) {
                        await cloudinary.uploader.destroy(img.image_url);
                    }

                    throw new Error("Image upload failed");
                }
            }
        }

        await transaction.commit();
        await redisClient.del(`allProducts`);
        return res.status(201).json({ message: "Product added successfully", product });

    } catch (error) {
        console.error("Error adding product:", error);

        await transaction.rollback();

        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const getAllProducts = async (req, res) => {
    try {
        const cachedProducts = await redisClient.get("allProducts");
        if (cachedProducts) {
            return res.status(200).json({ message: "Products fetched from cache", products: JSON.parse(cachedProducts) });
        }

        const products = await Product.findAll();

        await redisClient.set("allProducts", JSON.stringify(products), "EX", 600);

        return res.status(200).json({ message: "Products fetched successfully", products });

    } catch (error) {
        console.error("Error fetching products:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const getProductById = async (req, res) => {
    try {
        const productId = req.params.id;

        const cachedProduct = await redisClient.get(`product:${productId}`);
        if (cachedProduct) {
            return res.status(200).json({ message: "Product fetched from cache", product: JSON.parse(cachedProduct) });
        }

        const product = await Product.findByPk(productId);
        if (!product) return res.status(404).json({ error: "Product not found" });

        await redisClient.set(`product:${productId}`, JSON.stringify(product), "EX", 3600);

        return res.status(200).json({ message: "Product fetched successfully", product });

    } catch (error) {
        console.error("Error fetching product:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

const updateProduct = async (req, res) => {
    const transaction = await sequelize.transaction();

    try {
        const { name, description, category, price } = req.body;
        const productId = req.params.id;

        if (!name || !description || !category || !price) {
            return res.status(400).json({ error: "All fields are required." });
        }

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        await Product.update(
            { name, description, category, price },
            { where: { id: productId }, transaction }
        );

        const oldImages = await Image.findAll({ where: { product_id: productId }, transaction });

        for (const img of oldImages) {
            const publicId = img.image_url.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(publicId);
        }

        await Image.destroy({ where: { product_id: productId }, transaction });

        const uploadedImages = [];
        if (req.files && req.files.length > 0) {
            for (const file of req.files) {
                try {
                    const result = await uploadOnCloud(file.path);
                    if (result) {
                        const image = await Image.create(
                            { product_id: productId, image_url: result.secure_url },
                            { transaction }
                        );
                        uploadedImages.push(image);
                    }
                } catch (uploadError) {
                    console.error("Cloudinary upload failed:", uploadError);
                    
                    for (const img of uploadedImages) {
                        const publicId = img.image_url.split("/").pop().split(".")[0];
                        await cloudinary.uploader.destroy(publicId);
                    }

                    throw new Error("Image upload failed");
                }
            }
        }

        await transaction.commit();
        await redisClient.del(`allProducts`);
        await redisClient.del(`product:${productId}`);
        await redisClient.del(`current_stock:${JSON.stringify(req.query)}`);
        await redisClient.del(`stock_movements:${JSON.stringify(req.query)}`);
        await redisClient.del(`supplier_report:${JSON.stringify(req.query)}`);
        await redisClient.del(`profit_sales:${JSON.stringify(req.query)}`);
        return res.status(200).json({ message: "Product updated successfully" });

    } catch (error) {
        console.error("Error updating product:", error);
        await transaction.rollback();
        return res.status(500).json({ error: "Internal Server Error" });
    }
};
const deleteProduct = async (req, res) => {
    const transaction = await sequelize.transaction();
    
    try {
        const productId = req.params.id;

        const product = await Product.findByPk(productId);
        if (!product) {
            return res.status(404).json({ error: "Product not found" });
        }

        const oldImages = await Image.findAll({ where: { product_id: productId } });
        
        for (const img of oldImages) {
            const publicId = img.image_url.split("/").pop().split(".")[0];
            await cloudinary.uploader.destroy(publicId);
        }

        await Image.destroy({ where: { product_id: productId }, transaction });

        await Product.destroy({ where: { id: productId }, transaction });

        await transaction.commit();

        await redisClient.del(`allProducts`);
        await redisClient.del(`product:${productId}`)
        await redisClient.del(`current_stock:${JSON.stringify(req.query)}`);
        await redisClient.del(`stock_movements:${JSON.stringify(req.query)}`);
        await redisClient.del(`supplier_report:${JSON.stringify(req.query)}`);
        await redisClient.del(`profit_sales:${JSON.stringify(req.query)}`);
        return res.status(200).json({ message: "Product deleted successfully" });

    } catch (error) {
        console.error("Error deleting product:", error);
        await transaction.rollback();
        return res.status(500).json({ error: "Internal Server Error" });
    }
};

export {
    addProduct,
    getAllProducts,
    updateProduct,
    deleteProduct,
    getProductById
}
