const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const User = require('./schemas/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cors = require('cors');
const sendEmail = require('./utils/sendEmail');
const upload = require('./utils/upload');
const Link = require('./schemas/Link');
const File = require('./schemas/File');

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const stripe_secret_key = process.env.STRIPE_SECRET_KEY;
const stripe_publishable_key = process.env.STRIPE_PUBLISHABLE_KEY;

const app = express();
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
const morgan = require('morgan');
app.use(morgan('dev'));

const mongoURI = process.env.MONGO_URI;

// Connect to MongoDB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.error('Failed to connect to MongoDB', err);
});

// Register Route
app.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Check if the user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user
  const user = new User({ name, email, password: hashedPassword });
  await user.save();

  const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '12h' });

  res.status(201).json({ message: 'User registered successfully', token });
});

// Login Route
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  // Check if the password is correct
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ error: 'Invalid email or password' });
  }

  // Create a JWT token
  const token = jwt.sign({ userId: user._id }, 'your_jwt_secret', { expiresIn: '12h' });

  res.json({ token });
});

app.get('/l/:url', async (req, res) => {
  const url = req.params.url;
  const link = await Link.findOne({ url: url }).populate('files');
  link.number_of_views += 1;
  await link.save();
  if (!link) {
    return res.status(404).json({ error: 'Link not found' });
  }
  res.json({ link });
});

// Middleware to protect routes
const authMiddleware = (req, res, next) => {
  const authHeader = req.header('Authorization');
  if (!authHeader) {
    return res.status(401).json({ error: 'Access denied' });
  }

  const token = authHeader.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ error: 'Access denied' });
  }

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Logout Route
app.post('/logout', authMiddleware, (req, res) => {
    // For stateless JWT, the client should just discard the token.
    // Optionally, you can implement token blacklisting on the server.
    res.json({ message: 'Logged out successfully' });
  });

// Protected Route
app.get('/user', authMiddleware, async (req, res) => {
    let user = req.user;
    const userId = req.user.userId;
    user = await User.findById(userId);
    if (!user) {
    return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user: { name: user.name, email: user.email, balance: user.balance, stripeAccountId: user.stripeAccountId, stripeOnboardingExited: user.stripeOnboardingExited } });
    });

app.post('/stripe_onboarding_exit', authMiddleware, async (req, res) => {
  let user = req.user;
  const userId = req.user.userId;
  user = await User.findById(userId);
  const { accountId } = req.body;

  try {
    const user = await User.findOne({ _id: userId, stripeAccountId: accountId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.stripeOnboardingExited = true;
    await user.save();

    res.json({ message: 'Stripe onboarding exited successfully' });
  } catch (error) {
    console.error('Error updating stripeOnboardingExited:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/link/:linkId/user', async (req, res) => {
  const linkId = req.params.linkId;
  const link = await Link.findById(linkId);
  const userId = link.user;
  const user = await User.findById(userId);
  res.json({ user });
});

app.post('/create-checkout-session', async (req, res) => {
  const { id, name, price, quantity } = req.body; // Get product information from the request body
  const link = await Link.findById(id).populate('user'); // Find the link and populate the user

  if (!link) {
    return res.status(404).json({ error: 'Link not found' });
  }

  const userId = link.user; // Extract the user from the populated link
  const user = await User.findById(userId);
  const connectedAccountId = user.stripeAccountId; // Ensure this is correctly fetched


  try {
    const session = await stripe.checkout.sessions.create(
      {
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: name,
              },
              unit_amount: price * 100, // Convert price to cents
            },
            quantity: quantity,
          },
        ],
        payment_intent_data: {
          application_fee_amount: 123,
        },
        mode: 'payment',
        ui_mode: 'embedded',
        return_url: `http://localhost:5173/checkout/return?session_id={CHECKOUT_SESSION_ID}&connected_account_id=${connectedAccountId}`,
        metadata: {
          linkId: id,
        },
      },
      {
        stripeAccount: connectedAccountId, // Use the actual connected account ID
      }
    );
    res.json({ clientSecret: session.client_secret });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/checkout-session/:sessionId/:connectedAccountId', async (req, res) => {
  const { sessionId, connectedAccountId } = req.params;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      stripeAccount: connectedAccountId,
    });
    res.json(session);
  } catch (error) {
    console.error('Error fetching checkout session:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  console.log(email);
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ error: 'Email not found' });
  }
  const token = crypto.randomBytes(20).toString('hex');

  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  const resetUrl = `http://localhost:5173/reset-password/?token=${token}`;

  await sendEmail(email, 'Reset Password', `Please click on the following link to reset your password: ${resetUrl}`);
  res.json({ message: 'Email sent successfully' });
});

app.post('/reset-password', async (req, res) => {
  const { password, token, email } = req.body;
  const user = await User.findOne({ resetPasswordToken: token });
  if (!user) {
    return res.status(404).json({ error: 'Invalid token' });
  }
  if (user.email !== email) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  user.resetPasswordToken = null;
  user.resetPasswordExpires = null;
  await user.save();
  res.json({ message: 'Password reset successfully' });
});

app.post("/account_session", async (req, res) => {
    try {
      const { account } = req.body;
  
      const accountSession = await stripe.accountSessions.create({
        account: account,
        components: {
          balances: {
            enabled: true,
            features: {
              instant_payouts: true,
              standard_payouts: true,
              edit_payout_schedule: true,
            },
          },
          payments: {
            enabled: true,
            features: {
              refund_management: true,
              dispute_management: true,
              capture_payments: true,
              destination_on_behalf_of_charge_management: false,
            },
          },
          payouts: {
            enabled: true,
            features: {
              instant_payouts: true,
              standard_payouts: true,
              edit_payout_schedule: true,
            },
          },
          account_onboarding: { enabled: true },
          account_management: {enabled: true},
          notification_banner: {enabled: true},
        },
      });
  
      res.json({
        client_secret: accountSession.client_secret,
      });
    } catch (error) {
      console.error(
        "An error occurred when calling the Stripe API to create an account session",
        error
      );
      res.status(500);
      res.send({ error: error.message });
    }
  });

  app.post("/account", authMiddleware, async (req, res) => {
    let user = req.user;
    const userId = req.user.userId;
    user = await User.findById(userId);
    try {
      const account = await stripe.accounts.create({
        controller: {
          stripe_dashboard: {
            type: "none",
          },
          fees: {
            payer: "application"
          },
        },
        capabilities: {
          card_payments: {requested: true},
          transfers: {requested: true}
        },
        country: "EE",
      });
      user.stripeAccountId = account.id;
      await user.save();
      res.json({
        account: account.id,
      });
    } catch (error) {
      console.error(
        "An error occurred when calling the Stripe API to create an account",
        error
      );
      res.status(500);
      res.send({ error: error.message });
    }
  });

  app.post('/create-link', authMiddleware, upload, async (req, res) => {
    let user = req.user;
    const userId = req.user.userId;
    user = await User.findById(userId);
    const { name, permalink, price, url } = req.body;
  
    // Check if the permalink already exists
    const existingLink = await Link.findOne({ permalink });
    if (existingLink) {
      return res.status(400).json({ error: 'Permalink already exists' });
    }
  
    // Create File documents for each uploaded file
    const fileDocs = await Promise.all(req.files.map(async (file) => {
      const fileDoc = new File({
        unique_permalink: `${url}-${file.originalname}`,
        file_name: file.originalname,
        file_type: file.mimetype,
      });
      await fileDoc.save();
      return fileDoc._id;
    }));
  
    // Create a new link
    const link = new Link({ name, unique_permalink: permalink, price, files: fileDocs, user: user._id, url });
    await link.save();
  
    res.status(201).json({ message: 'Link created successfully', link });
  });

  app.get('/links', authMiddleware, async (req, res) => {
    const userId = req.user.userId; // Assuming `authMiddleware` sets `req.user`
  
    // Fetch links for the user and populate the files
    const links = await Link.find({ user: userId }).populate('files');
  
    res.status(200).json({ links });
  });
  app.get('/links/:id', authMiddleware,  async (req, res) => {
    const userId = req.user.userId; // Assuming `authMiddleware` sets `req.user`
  
    // Fetch links for the user and populate the files
    const link = await Link.findById(req.params.id).populate('files');
  
    res.status(200).json({ link });
  });

  app.get('/links-paid/:id', async (req, res) => {
  
    // Fetch links for the user and populate the files
    const link = await Link.findById(req.params.id).populate('files');
    link.number_of_downloads += 1;
    await link.save();
    res.status(200).json({ link });
  });

app.put('/links/:id', authMiddleware, async (req, res) => {
  const userId = req.user.userId; // Assuming `authMiddleware` sets `req.user`
  const linkId = req.params.id;
  const { name, price } = req.body;

  try {
    // Find the link by ID and ensure it belongs to the authenticated user
    const link = await Link.findOne({ _id: linkId, user: userId });
    if (!link) {
      return res.status(404).json({ error: 'Link not found or not authorized' });
    }

    // Update the link details
    link.name = name || link.name;
    link.price = price || link.price;
    await link.save();

    res.status(200).json({ message: 'Link updated successfully', link });
  } catch (error) {
    console.error('Error updating link:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/links/:id', authMiddleware, async (req, res) => {
  const userId = req.user.userId; // Assuming `authMiddleware` sets `req.user`
  const linkId = req.params.id;

  try {
    // Find the link by ID and ensure it belongs to the authenticated user
    const link = await Link.findOne({ _id: linkId, user: userId });
    if (!link) {
      return res.status(404).json({ error: 'Link not found or not authorized' });
    }

    // Delete associated files
    await File.deleteMany({ _id: { $in: link.files } });

    // Delete the link
    await Link.deleteOne({ _id: linkId });

    res.status(200).json({ message: 'Link and associated files deleted successfully' });
  } catch (error) {
    console.error('Error deleting link and files:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Webhook endpoint
app.post('/webhook', bodyParser.raw({ type: 'application/json' }), (req, res) => {
  const sig = req.headers['stripe-signature'];
  const endpointSecret = 'your_webhook_secret'; // Replace with your webhook secret

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('⚠️  Webhook signature verification failed.', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const sessionCompleted = event.data.object;
      // Handle the checkout session completed event
      console.log('Checkout session completed:', sessionCompleted);
      break;
    case 'checkout.session.async_payment_succeeded':
      const paymentSucceeded = event.data.object;
      // Handle the payment succeeded event
      console.log('Payment succeeded:', paymentSucceeded);
      break;
    case 'checkout.session.async_payment_failed':
      const paymentFailed = event.data.object;
      // Handle the payment failed event
      console.log('Payment failed:', paymentFailed);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a response to acknowledge receipt of the event
  res.json({ received: true });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});





