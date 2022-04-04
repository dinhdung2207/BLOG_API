const Category = require('../models/Category')

class CategoryController {
    // [GET]
    async index(req, res) {
        const allCategory = await Category.find({})
        try {
            res.status(200).json(allCategory)
        } catch (error) {
            res.status(500).json(error)
        }

    }

    // [POST]
    async create(req, res) {
        const newCategory = new Category(req.body)
        try {
            const saveCategory = await newCategory.save()
            res.status(200).json(saveCategory)
        } catch (error) {
            return res.status(500).json(error)
        }

    }

    // [DELETE]
    async delete(req, res) {
        const findedCategory =  await Category.findOne({ title: req.params.title })
        try {
            await findedCategory.deleteOne()
            res.status(200).json("Delete category successfully")
        } catch (error) {
            res.status(500).json(error)
        }
    }

    // [PUT]    
    async update(req, res) {
        try {
            const findedCategory = await Category.findOneAndUpdate(req.params.title, {
                $set: req.body,
            });
            res.status(200).json("Update category successfully")
        } catch (error) {
            res.status(500).json(error)
        }
    }
}

module.exports = new CategoryController