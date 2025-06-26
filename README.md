# TechBlogger

TechBlogger is a modern, full-stack blogging platform designed for tech enthusiasts, writers, and administrators. It provides a seamless experience for both regular users and admins, featuring user authentication, post management, analytics, and a robust API key system for integrations.

## 🌟 Features

- **User Dashboard**: Personalized dashboard for users to manage their posts, view analytics, and update their profile.
- **Admin Panel**: Powerful admin interface for managing users, admins, reports, and platform settings.
- **Role-Based Access Control**: Secure, protected routes for users and admins, with visual alerts and auto-redirects for unauthorized access.
- **Pricing & Subscription Tiers**: Multiple plans (Basic, Starter, Professional, Enterprise) with feature comparison and modern pricing UI.
- **API Key System**: Both users and admins can generate, view, and use API keys for secure API access, with copy/regenerate functionality and usage code snippets.
- **Authentication**: Secure login system with role-based access control (user/admin).
- **Post Management**: Create, edit, and delete blog posts. Users see their own posts; admins can manage all users.
- **Analytics**: Visual charts and stats for both users and admins.
- **Profile Customization**: Upload avatars, update bio, and manage account settings.
- **Modern UI/UX**: Animated stats, feature cards, and improved CSS for a beautiful, responsive experience.

## 🛠️ Tech Stack

- **Frontend**: React.js (with Chart.js, Recharts for analytics, Lucide React for icons)
- **Backend**: Flask (Python) with RESTful API endpoints
- **Database**: SQLite (default, can be swapped for MySQL)
- **Styling**: Custom CSS

## 🧩 Architecture Overview

### Front-End (React)
The front-end is built with React.js, providing a dynamic and responsive user interface. It features:
- **User Dashboard**: Allows users to manage posts, view analytics, and update their profile.
- **Admin Panel**: Enables admins to manage users, admins, reports, and platform settings.
- **API Key Management**: Both users and admins can view, copy, and regenerate their API keys from the settings tab.
- **Charts & Analytics**: Uses Chart.js for visualizing data and statistics.
- **Custom Styling**: All UI components are styled with custom CSS for a modern look.

The React app communicates with the backend via RESTful API calls (using `fetch`).

### Back-End (Flask)
The backend is powered by Flask (Python), exposing RESTful API endpoints for all core functionalities:
- **Authentication**: Handles login and role-based access (user/admin).
- **User & Admin Management**: CRUD operations for users and admins.
- **Post Management**: Endpoints for creating, editing, and retrieving blog posts.
- **API Key Endpoints**: Secure endpoints for generating, retrieving, and updating API keys for both users and admins.
- **CORS Enabled**: Uses `flask-cors` to allow cross-origin requests from the React frontend.

The backend validates API keys for protected endpoints, ensuring secure access.

### Database (SQLite)
The default database is SQLite, a lightweight file-based database ideal for development and small deployments. It stores:
- **Users**: User credentials, profile info, and API keys.
- **Admins**: Admin credentials, roles, and API keys.
- **Posts**: Blog post content, metadata, and author info.
- **Reports/Analytics**: Data for generating charts and statistics.

You can easily swap SQLite for MySQL or PostgreSQL by updating the backend configuration and models.

## 🚀 Getting Started

### Prerequisites
- Node.js & npm
- Python 3.x
- (Optional) Virtualenv for Python

### 1. Clone the Repository
```bash
git clone <repo-url>
cd react-example
```

### 2. Install Frontend Dependencies
```bash
npm install
```

### 3. Install Backend Dependencies
```bash
cd src/components
pip install flask flask-cors
# Or, if requirements.txt is present:
# pip install -r requirements.txt
```

### 4. Run the Backend
```bash
python app.py
# or the relevant backend file
# Backend runs on http://localhost:5000 by default
```

### 5. Run the Frontend
```bash
cd ../..
npm start
# Frontend runs on http://localhost:3000 by default
```

### 6. Build for Production
```bash
npm run build
```

### 7. Run Tests
```bash
npm test
```

The app will be available at [http://localhost:3000](http://localhost:3000).

## 🏷️ Pricing & Subscription Tiers

TechBlogger now offers multiple subscription plans:
- **Basic**: Free access to public blog posts, community forum, newsletter, and analytics.
- **Starter**: Adds web development consultation, more posts per month, and email support.
- **Professional**: Advanced web development, priority support, 1-on-1 calls, and custom project planning.
- **Enterprise**: Full-scale solutions, unlimited posts, dedicated support, and priority features.

Compare features and choose a plan in the **Services** section of the app.

## 🛡️ Role-Based Access Control

- **Protected Routes**: Only users with the correct role can access user/admin dashboards.
- **Visual Alerts**: Unauthorized access triggers animated alerts and auto-redirects.
- **Manual Redirect**: "Go Now" button for immediate navigation.
- **Security**: All role checks are validated on both frontend and backend.

## 🏠 Enhanced Home & Community Features

- **Animated Stats**: See live stats for readers, articles, authors, and views.
- **Featured Articles**: Curated list of trending and new articles.
- **Community Support**: Connect with developers worldwide.

## 🏗️ Code Structure

```
react-example/
├── public/                # Static assets (images, icons, etc.)
├── src/
│   ├── components/
│   │   ├── Admin.js       # Admin dashboard (user/admin management, reports, settings)
│   │   ├── User.js        # User dashboard (posts, analytics, settings)
│   │   ├── ...            # Other React components & backend scripts
│   ├── App.js             # Main React app
│   └── index.js           # React entry point
├── package.json           # Frontend dependencies
└── ...
```

## 🔑 API Key System

Both admins and users have access to a personal API key, which can be used to authenticate requests to protected API endpoints.

- **View API Key**: In the settings tab, users and admins can see their API key.
- **Copy/Regenerate**: Buttons allow copying or regenerating the key. Regeneration updates the backend.
- **Example Usage**: Code snippets are provided for Node.js (axios) and Python (requests) to show how to use the API key.

**Sample usage:**
```js
// Node.js (axios)
const axios = require('axios');
axios.get('http://localhost:5000/api/protected', {
  headers: { 'x-api-key': 'YOUR_API_KEY' }
})
.then(res => console.log(res.data));
```
```python
# Python (requests)
import requests
response = requests.get(
    'http://localhost:5000/api/protected',
    headers={'x-api-key': 'YOUR_API_KEY'}
)
print(response.json())
```

## 👤 User Experience
- **Users**: Can manage their posts, view analytics, update their profile, and use their API key for integrations.
- **Admins**: Have full control over users, admins, reports, and platform settings. Admins can also manage their own API key.

## 📂 Backend API Endpoints (Sample)
- `/api/users` - Get all users
- `/api/users/<username>/apikey` - Get or update a user's API key
- `/api/admins` - Get all admins
- `/api/admins/<admin_id>/apikey` - Get or update an admin's API key
- `/api/posts/user/<username>` - Get posts for a user
- `/auth/user-only` - Authenticate user
- `/auth/admin` - Authenticate admin

## 📝 Customization
- Update styles in `*.css` files for your branding.
- Extend backend endpoints as needed for more features.
- Swap SQLite for another database if desired.

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## 📄 License
MIT 

## 🚢 Deployment

You can deploy the frontend and backend separately. For example:

### Deploying the Backend (Flask) to Heroku
1. Add a `Procfile`:
   ```
   web: python src/components/app.py
   ```
2. Commit your code and push to Heroku.

### Deploying the Frontend (React) to Vercel/Netlify
1. Push your code to GitHub.
2. Connect your repo to Vercel or Netlify and follow their deployment steps.

> Make sure to update API URLs to use your deployed backend! 

## 🙏 Credits

- [React](https://reactjs.org/)
- [Flask](https://flask.palletsprojects.com/)
- [Chart.js](https://www.chartjs.org/)
- [Random User API](https://randomuser.me/) (for demo avatars) 
