
const express = require('express');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes.js');
const adminRoutes = require('./routes/adminRoutes.js');
const productRoutes = require('./routes/productRoutes.js');
const { authenticateAdmin } = require('./middleware/adminAuthMiddleware');
const Cart = require('./models/cartSchema');


const app = express();
app.use(express.json());

const uri = 'mongodb://127.0.0.1:27017/EcommerceDB';
mongoose.connect(uri);

const db = mongoose.connection;

db.on('error', (err) => {
  console.error('Database connection error:', err);
});

db.once('open', () => {
  console.log('Database connected successfully');

  app.use('/', authRoutes);
  app.use('/', adminRoutes);
  app.use('/', productRoutes);


  app.get('/', (req, res) => {
    res.send('ECommerce Website Initiated');
  });

  app.get('/addcart/:userId', async (req, res) => {
    const { userId } = req.params;
  
    try {
      const cartItems = await Cart.find({ user: userId }).populate('product');
  
      if (!cartItems) {
        return res.status(404).json({ error: 'Cart not found for the user' });
      }
  
      res.json(cartItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

app.put('/addcart/:userId/:productId', async (req, res) => {
  const { userId, productId } = req.params;
  const { quantity } = req.body;

  try {
    const cartItem = await Cart.findOne({ user: userId, product: productId });

    if (!cartItem) {
      return res.status(404).json({ error: 'Product not found in the user\'s cart' });
    }

    if (quantity !== undefined) {
      cartItem.quantity += quantity;
      cartItem.quantity -= quantity;
      if (cartItem.quantity < 0) {
        cartItem.quantity = 0;
      }
    }

    await cartItem.save();
    res.json(cartItem);
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.delete('/delete-cart/:userId/:productId', async (req, res) => {
  const { userId, productId } = req.params;

  try {
    const result = await Cart.deleteOne({ user: userId, product: productId });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Product not found in the user\'s cart' });
    }

    res.json({ message: 'Product deleted from the cart successfully' });
  } catch (error) {
    console.error('Error deleting product from cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});


app.post('/addcart/:userId/:productId', async (req, res) => {
  const { userId, productId } = req.params;

  try {
    const existingCartItem = await Cart.findOne({ user: userId, product: productId });

    if (existingCartItem) {
      existingCartItem.quantity += 1;
      await existingCartItem.save();
      res.json(existingCartItem);
    } else {
      const cartItem = new Cart({
        user: userId,
        product: productId,
        quantity: 1,
      });

      await cartItem.save();
      res.json(cartItem);
    }
  } catch (error) {
    console.error('Error adding product to cart:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

  
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
});