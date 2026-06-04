const Product = require("../models/Product");

const addProduct = async (req, res) => {
    try {
        const { product, price, category } = req.body;
        await Product.create({
            product,
            price,
            category
        });
        res.status(201).json({ message: "Product added successfully" });
    } catch (error) {
        console.error(error);
        res.status(501).json({ message: "Server error" });
    }

}

const getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.status(200).json(products);
    } catch (error){
        res.status(500).json({ message: "Failed to fetch products", error: error.message });
    }
}

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const { price, product, category } = req.body;
        
        // Validate MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid product ID format" });
        }
        
        // Validate input
        if (!price || price < 0 || !product || !category) {
            return res.status(400).json({ message: "Invalid product data" });
        }
        
        const updatedProduct = await Product.findByIdAndUpdate(
            id,
            { price, product, category },
            { new: true, runValidators: true }
        );
        
        if (!updatedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        res.status(200).json({ 
            message: "Product updated successfully", 
            product: updatedProduct 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validate MongoDB ObjectId
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ message: "Invalid product ID format" });
        }
        
        const deletedProduct = await Product.findByIdAndDelete(id);
        
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }
        
        res.status(200).json({ message: "Product deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

const getProductStats = async (req, res) => {
    try {
        // Aggregation for product statistics
        const stats = await Product.aggregate([
            {
                $facet: {
                    totalProducts: [
                        { $count: "count" }
                    ],
                    categoryBreakdown: [
                        {
                            $group: {
                                _id: "$category",
                                count: { $sum: 1 },
                                avgPrice: { $avg: "$price" },
                                minPrice: { $min: "$price" },
                                maxPrice: { $max: "$price" }
                            }
                        },
                        { $sort: { _id: 1 } }
                    ],
                    priceRange: [
                        {
                            $group: {
                                _id: null,
                                avgPrice: { $avg: "$price" },
                                minPrice: { $min: "$price" },
                                maxPrice: { $max: "$price" }
                            }
                        }
                    ]
                }
            }
        ]);

        const data = stats[0];

        res.status(200).json({
            success: true,
            data: {
                totalProducts: data.totalProducts[0]?.count || 0,
                categoryBreakdown: data.categoryBreakdown,
                priceStats: data.priceRange[0] || { avgPrice: 0, minPrice: 0, maxPrice: 0 }
            }
        });
    } catch (error) {
        console.error("Product Stats Error:", error);
        res.status(500).json({ message: "Failed to fetch product statistics" });
    }
}

module.exports = { addProduct, getProducts, updateProduct, deleteProduct, getProductStats };