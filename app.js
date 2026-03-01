    const fs = require('fs').promises;
    const express = require('express');
    const logger = require('./middleware/logger');
    const app = express();
    const port = process.env.PORT || 3000;
    
    app.use(express.json());
    //In-memory data store
    let products = [
  { id: 1, name: 'Laptop', price: 1200 },
  { id: 2, name: 'Mouse', price: 25 },
  { id: 3, name: 'Keyboard', price: 50 },
  { id: 4, name: 'Monitor', price: 300 },
  { id: 5, name: 'Webcam', price: 80 },
  { id: 6, name: 'Headphones', price: 100 },
  { id: 7, name: 'USB Cable', price: 15 }
];

    let nextProductId = 8; // To keep track of the next available ID

    // 2nd In-memory data store
    const books = [
  {
    "id": 1,
    "title": "The Great Gatsby",
    "author": "F. Scott Fitzgerald",
    "publicationYear": 1925
  },
  {
    "id": 2,
    "title": "To Kill a Mockingbird",
    "author": "Harper Lee",
    "publicationYear": 1960
  },
  {
    "id": 3,
    "title": "1984",
    "author": "George Orwell",
    "publicationYear": 1949
  },
  {
    "id": 4,
    "title": "The Hobbit",
    "author": "J.R.R. Tolkien",
    "publicationYear": 1937
  },
  {
    "id": 5,
    "title": "Brave New World",
    "author": "Aldous Huxley",
    "publicationYear": 1932
  }
]
    app.use(logger);
    //Data Store - In-memory array to hold products
    //Implementing the C of CRUD - Create
    app.post('/products', (req,res) => {
        const newProduct = req.body;

        if(!newProduct.name || !newProduct.price || !newProduct.description){
            return res.status(400).json({error: 'Missing required field(s)'});
        } 

        newProduct.id = nextProductId++;
        products.push(newProduct);
        res.status(201).json(newProduct);
    })

    //Implementing the R of CRUD - Read;
    app.get('/products', (req,res) => {
        const searchName = req.query.name ? req.query.name.toLowerCase() : null;
        const searchDescription = req.query.description ? req.query.description.toLowerCase() : null;

        //const category = req.query.category ? req.query.category.toLowerCase() : null;
        // const price = req.query.price || 100;

        let filteredProducts = products;

        if(searchName && searchDescription){
            filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(searchName) && p.description.toLowerCase().includes(searchDescription));
            
        }
        if(searchName){
            filteredProducts = filteredProducts.filter(p => p.name.toLowerCase().includes(searchName));
            
        }

        if(searchDescription){
            filteredProducts = filteredProducts.filter(p => p.description.toLowerCase().includes(searchDescription));
        }


        
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 4;

        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        paginatedFilteredProducts = filteredProducts.slice(startIndex, endIndex);

        //saving pagination metadata
        let totalProducts = filteredProducts.length;
        let totalPages = Math.ceil(totalProducts / limit);

        res.json({
            page: page,
            limit: limit,
            totalProducts: totalProducts,
            totalPages: totalPages,
            products: paginatedFilteredProducts
        })

    })
    app.get('/products/:id', (req,res) => {
        const productId = parseInt(req.params.id);

        if(isNaN(productId)){
            return res.status(400).json({error: 'Invalid product ID'});
        }
        const product = products.find(p => p.id === productId);

        if(!product){
            res.status(404).json({error: 'Product not found'});
        }

        res.json(product);
    })

    //Implementing the U of CRUD - Update
    app.put('/products/:productId', (req,res) => {
        const productId = parseInt(req.params.productId);
        const productIndex = products.findIndex(p => p.id === productId);

        if(productIndex === -1){
            return res.status(404).json({error: 'Product not found'});
        }

        const updatedProduct = req.body;
        products[productIndex] = updatedProduct
        products[productIndex].id = productId; // Ensure the ID remains unchanged
        res.json(products[productIndex]);
    })

    app.patch('/products/:productId', (req,res) => {
        const productId = parseInt(req.params.productId);
        const productIndex = products.findIndex(p => p.id === productId);
        const updatedFiles = req.body;

        if(productIndex === -1){
            return res.status(404).json({error: 'Product not found'});
        }
        products[productIndex] = {...products[productIndex], ...updatedFiles};
        products[productIndex].id = productId; // Ensure the ID remains unchanged
        res.json(products[productIndex]);

    })

    app.get('/books', (req,res) => {
        res.json(books);
    })

    //Calculation API
    app.post('/api/calculate', (req,res) => {
        const {num1,num2} = req.body;
        if(typeof num1 !== 'number' || typeof num2 !== 'number'){
            return res.status(400).json({error: 'Invalid input, numbers are required'});
        }

        if(Number.isNaN(num1) || Number.isNaN(num2)){
            return res.status(400).json({error: 'Input must be valid numbers'});
        }
        const sum = num1 + num2;
        res.status(201).json({sum: sum});
    })

    const productReview = {}
    app.post('/api/reviews' , (req,res) => {
        const {rating, reviewText} = req.body;
        const productId = parseInt(req.query.productId);
        if(!rating || !reviewText){
            return res.status(400).json({error: 'Missing required field(s)'});
        }
        if(isNaN(productId)){
            return res.status(400).json({error: 'Invalid productId'});
        }

        if(!productReview[productId]){
            productReview[productId] = [];
        }

        const newReview = {
            rating: rating,
            reviewText: reviewText,
            date: new Date().toISOString()
        };

        productReview[productId].push(newReview);

        res.status(201).json({message: 'Review added successfully',
            review: newReview,
            reviewLength: productReview[productId].length
        })

     });

    app.get('/search', (req,res) => {
        let searchValue = req.query.q ? req.query.q.toLowerCase() : null;

        if(!searchValue){
            return res.status(400).json({error: 'Missing search query parameter'});
        }

        let matchedProducts = products.filter(p => p.name.toLowerCase().includes(searchValue) || p.description.toLowerCase().includes(searchValue));
        res.json(matchedProducts);
    })

    app.get('/file', async (req,res) => {
        try{
            const filePath = './sample.txt';
            const content = await fs.readFile(filePath, 'utf8');
            res.send(content);
        } catch(err){
            res.status(500).json({error: 'Failed to read file'});
        }
    });

    app.delete('/products/:productId', (req,res) => {
        const productId = parseInt(req.params.productId);
        const productIndex = products.findIndex(p => p.id === productId);

        if(productIndex === -1){
            return res.status(404).json({error: 'Product not found'});
        }
        products.splice(productIndex, 1);
        res.status(200).json({message: 'Product deleted successfully'});
    })

    app.listen(port, () => {
        console.log(`Server is running on http://localhost:${port}`);
    })

    module.exports = app;