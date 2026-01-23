// server.js
const express = require('express');
const stripe = require('stripe')('YOUR_STRIPE_SECRET_KEY'); // Replace with your secret key
const app = express();

app.use(express.json());
app.use(express.static('public'));

app.post('/create-checkout-session', async (req, res) => {
    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{
                price: 'price_XXXXX', // Replace with your Stripe Price ID
                quantity: 1,
            }],
            mode: 'subscription',
            success_url: `${req.headers.origin}/success.html`,
            cancel_url: `${req.headers.origin}/cancel.html`,
        });

        res.json({ id: session.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
