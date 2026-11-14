// Import packages, initialize an express app, and define the port you will use
const express = require("express");
const { body, validationResult } = require('express-validator');
const app = express();
const port = 3000;


const requestLogger = (req, res, next) => {
    const timestamp = new Date().toISOString();

    console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);

    if (req.method === 'POST' || req.method === 'PUT') {
        console.log('Request Body:', JSON.stringify(req.body, null, 2));
    }

    next();
};

app.use(express.json());
app.use(requestLogger);

// Data for the server
const menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    description: "Beef patty with lettuce, tomato, and cheese on a sesame seed bun",
    price: 12.99,
    category: "entree",
    ingredients: ["beef", "lettuce", "tomato", "cheese", "bun"],
    available: true
  },
  {
    id: 2,
    name: "Chicken Caesar Salad",
    description: "Grilled chicken breast over romaine lettuce with parmesan and croutons",
    price: 11.50,
    category: "entree",
    ingredients: ["chicken", "romaine lettuce", "parmesan cheese", "croutons", "caesar dressing"],
    available: true
  },
  {
    id: 3,
    name: "Mozzarella Sticks",
    description: "Crispy breaded mozzarella served with marinara sauce",
    price: 8.99,
    category: "appetizer",
    ingredients: ["mozzarella cheese", "breadcrumbs", "marinara sauce"],
    available: true
  },
  {
    id: 4,
    name: "Chocolate Lava Cake",
    description: "Warm chocolate cake with molten center, served with vanilla ice cream",
    price: 7.99,
    category: "dessert",
    ingredients: ["chocolate", "flour", "eggs", "butter", "vanilla ice cream"],
    available: true
  },
  {
    id: 5,
    name: "Fresh Lemonade",
    description: "House-made lemonade with fresh lemons and mint",
    price: 3.99,
    category: "beverage",
    ingredients: ["lemons", "sugar", "water", "mint"],
    available: true
  },
  {
    id: 6,
    name: "Fish and Chips",
    description: "Beer-battered cod with seasoned fries and coleslaw",
    price: 14.99,
    category: "entree",
    ingredients: ["cod", "beer batter", "potatoes", "coleslaw", "tartar sauce"],
    available: false
  }
];

// Define routes and implement middleware here

const menuValidation = [
    body('name')
        .isString()
        .withMessage('Name must be a string')
        .bail()
        .isLength({ min: 3 })
        .withMessage('Name must be at least 3 characters long'),

    body('description')
        .isString()
        .withMessage('Description must be a string')
        .bail()
        .isLength({ min: 10 })
        .withMessage('Description must be at least 10 characters long'),

    body('price')
        .isFloat({ gt: 0 })
        .withMessage('Price must be a number greater than 0'),

    body('category')
        .isString()
        .withMessage('Category must be a string')
        .bail()
        .isIn(['appetizer', 'entree', 'dessert', 'beverage'])
        .withMessage('Category must be appetizer, entree, dessert, or beverage'),

    body('ingredients')
        .isArray({ min: 1 })
        .withMessage('Ingredients must be an array with at least one ingredient'),

    body('available')
        .optional()
        .isBoolean()
        .withMessage('Available must be true or false')
];

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);

        return res.status(400).json({
            error: 'Validation failed',
            messages: errorMessages
        });
    }

    // Default availability to true
    if (req.body.available === undefined) {
        req.body.available = true;
    }

    next();
};

app.get('/api/menu', (req, res) => {
    res.status(200).json(menuItems);
});

app.get('/api/menu/:id', (req, res) => {
    const itemId = parseInt(req.params.id);
    const menuItem = menuItems.find(item => item.id === itemId);

    if (!menuItem) {
        return res.status(404).json({
            error: 'Menu item not found'
        });
    }

    res.status(200).json(menuItem);
});

app.post('/api/menu', menuValidation, handleValidationErrors, (req, res) => {
    const { name, description, price, category, ingredients, available } = req.body;

    const newItem = {
        id: Math.max(0, ...menuItems.map(item => item.id)) + 1,
        name,
        description,
        price,
        category,
        ingredients,
        available: available === undefined ? true : available
    };

    menuItems.push(newItem);
    res.status(201).json(newItem);
});

app.put('/api/menu/:id', menuValidation, handleValidationErrors, (req, res) => {
    const itemId = parseInt(req.params.id);
    const menuItem = menuItems.find(item => item.id === itemId);

    if (!menuItem) {
        return res.status(404).json({ error: 'Menu item not found' });
    }

    const { name, description, price, category, ingredients, available } = req.body;

    menuItem.name = name;
    menuItem.description = description;
    menuItem.price = price;
    menuItem.category = category;
    menuItem.ingredients = ingredients;
    menuItem.available = available === undefined ? true : available;

    res.status(200).json(menuItem);
});

app.delete('/api/menu/:id', (req, res) => {
    const itemId = parseInt(req.params.id);
    const itemIndex = menuItems.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
        return res.status(404).json({ error: 'Menu item not found' });
    }

    const deletedItem = menuItems.splice(itemIndex, 1)[0];

    res.status(200).json({
        message: 'Menu item deleted successfully',
        item: deletedItem
    });
});

if (require.main === module) {
    app.listen(port, () => {
        console.log(`Restaurant API running at http://localhost:${port}`);
    });
}

module.exports = app;