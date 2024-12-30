const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const session = require('express-session');
const bodyparser = require('body-parser');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();

// Database connection
mongoose.connect('mongodb://127.0.0.1:27017/contact')
  .then(() => console.log('Database connected successfully'))
  .catch((err) => console.log('Database connection error: ', err));

// Define mongoose schemas
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  message: String,
});

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phoneNumber: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetToken: String, // Token for password reset
  resetTokenExpiration: Date, // Token expiration time
});

const Contact = mongoose.model('Contact', contactSchema);
const User = mongoose.model('User', userSchema);

// Configuration
const port = 80;
const saltRounds = 10;

// Express middleware
app.use(express.urlencoded({ extended: true })); // URL-encoded body parsing
app.use(bodyparser.json()); // JSON body parsing
app.use(session({
  secret: 'qwertyuiop[]', // Use a strong secret key in production
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // Set to true in HTTPS environment
}));

// Static files
app.use('/static', express.static(path.join(__dirname, 'static')));

// PUG view engine
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail', // or use another email provider
  auth: {
    user: 'mohdhusamuddin2005@gmail.com', // Replace with your email
    pass: 'movw myga dbil hurv', // Replace with your email app password
  },
});

// Routes
app.get('/', (req, res) => {
  res.status(200).render('home.pug');
});

app.get('/contact', (req, res) => {
  res.status(200).render('contact.pug');
});

app.get('/login', (req, res) => {
  res.status(200).render('login.pug');
});

app.get('/about', (req, res) => {
  res.status(200).render('about.pug');
});

// Protect dashboard route
app.get('/home', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login'); // If user is not logged in, redirect to login page
  }
  res.render('dashboard.pug');
});

app.get('/forgot-password', (req, res) => {
  res.render('forgot-password.pug');
});

app.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.send(`
        <script>
          alert('No user found with that email!');
          window.location.href = '/forgot-password';
        </script>
      `);
    }

    // Generate reset token and expiration time
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // Token valid for 1 hour
    await user.save();

    const resetLink = `http://localhost:${port}/reset-password/${resetToken}`;
    const mailOptions = {
      to: user.email,
      subject: 'Password Reset',
      html: `<p>You requested a password reset.</p><p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        console.error('Error sending email:', err);
        return res.send(`
          <script>
            alert('Error sending email. Please try again later.');
            window.location.href = '/forgot-password';
          </script>
        `);
      }

      res.send(`
        <script>
          alert('Password reset instructions sent to your email!');
          window.location.href = '/login';
        </script>
      `);
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/reset-password/:token', (req, res) => {
  const { token } = req.params;

  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        return res.send(`
          <script>
            alert('Invalid or expired token!');
            window.location.href = '/forgot-password';
          </script>
        `);
      }
      res.render('reset-password.pug', { email: user.email, token });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
});

app.post('/reset-password/:token', (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        return res.send(`
          <script>
            alert('Invalid or expired token!');
            window.location.href = '/forgot-password';
          </script>
        `);
      }

      bcrypt.hash(password, saltRounds, async (err, hashedPassword) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error hashing password');
        }

        user.password = hashedPassword;
        user.resetToken = undefined;
        user.resetTokenExpiration = undefined;

        await user.save();
        res.send(`
          <script>
            alert('Password reset successful! You can now log in.');
            window.location.href = '/login';
          </script>
        `);
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
});

// Contact form route
app.post('/contact', (req, res) => {
  const mydata = new Contact(req.body);
  mydata.save()
    .then(() => {
      res.send(`
        <script>
          alert('Your message has been received. We will contact you soon!');
          window.location.href = '/contact';
        </script>
      `);
    })
    .catch(() => {
      res.status(400).send(`
        <script>
          alert('There was an error saving your message. Please try again.');
          window.location.href = '/contact';
        </script>
      `);
    });
});

// Registration endpoint
app.post('/register', async (req, res) => {
  const { fullName, phoneNumber, email, password, confirmPassword } = req.body;

  if (!fullName || !phoneNumber || !email || !password || !confirmPassword) {
    return res.send(`
      <script>
        alert('All fields are required!');
        window.location.href = '/login';
      </script>
    `);
  }

  if (password !== confirmPassword) {
    return res.send(`
      <script>
        alert('Passwords do not match!');
        window.location.href = '/login';
      </script>
    `);
  }

  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.send(`
      <script>
        alert('Password must be at least 8 characters long and contain both letters and numbers.');
        window.location.href = '/login';
      </script>
    `);
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.send(`
        <script>
          alert('Email is already registered!');
          window.location.href = '/login';
        </script>
      `);
    }

    bcrypt.hash(password, saltRounds, async (err, hashedPassword) => {
      if (err) {
        console.error(err);
        return res.status(500).send('Error hashing password');
      }

      const newUser = new User({
        fullName,
        phoneNumber,
        email,
        password: hashedPassword,
      });

      await newUser.save();
      res.send(`
        <script>
          alert('User registered successfully! You can now log in.');
          window.location.href = '/login';
        </script>
      `);
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Login endpoint
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then((user) => {
      if (!user) {
        return res.send(`
          <script>
            alert('No user found with that email!');
            window.location.href = '/login';
          </script>
        `);
      }

      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err) {
          console.error(err);
          return res.status(500).send('Error comparing passwords');
        }

        if (!isMatch) {
          return res.send(`
            <script>
              alert('Incorrect password!');
              window.location.href = '/login';
            </script>
          `);
        }

        req.session.userId = user._id; // Store user ID in session
        res.redirect('/dashboard');
      });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error logging in');
    });
});

// Logout route
app.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).send('Error logging out');
    }
    res.redirect('/login');
  });
});

// Dashboard route
app.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login'); // If user is not logged in, redirect to login page
  }

  User.findById(req.session.userId)
    .then((user) => {
      if (!user) {
        return res.redirect('/login');
      }
      res.render('dashboard.pug', { fullName: user.fullName });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Internal Server Error');
    });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
