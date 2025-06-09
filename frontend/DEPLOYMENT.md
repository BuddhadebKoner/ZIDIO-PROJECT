# Routing Configuration for SPA Deployment

This project is a Single Page Application (SPA) using React Router. When deploying to hosting providers, you need to configure the server to serve the `index.html` file for all routes to allow client-side routing to work properly.

## Vercel
The `vercel.json` file in this directory handles routing for Vercel deployments.

## Netlify
The `_redirects` file in the `public` directory handles routing for Netlify deployments.

## Other Providers
For other hosting providers, ensure that all routes serve the `index.html` file with a 200 status code.
