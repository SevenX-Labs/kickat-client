# KickAt E-Commerce Storefront

A modern, premium e-commerce web application built with [Next.js](https://nextjs.org) and React. KickAt delivers a high-end, responsive shopping experience focused on aesthetics, smooth micro-interactions, and frictionless user journeys.

## Features

- **Premium UI/UX:** Clean, typography-driven design (using Fraunces and IBM Plex Mono) with carefully tuned color palettes (amber, forest green, warm creams) and micro-animations.
- **Dynamic Homepage:** Features Hero sections, Trust Strips, Pet Categories, Shop by Category, Best Sellers, and an Instagram feed integration.
- **Advanced Product Detail Page (PDP):** Includes interactive image galleries with zoom, responsive tabs (Details, Materials, Size & Fit, Shipping), sticky add-to-cart bars for mobile, and related product carousels.
- **Frictionless Checkout:** A streamlined two-column checkout form with dynamic progress tracking, real-time input validation, interactive trust signals (lock icons, secure messaging), and a simulated premium success state with confetti animations.
- **Smart Cart System:** Slide-out drawer and dedicated cart page featuring dynamic free-shipping progress trackers, promo code application, and empty-state illustrations.
- **Account Dashboard:** A fully overhauled user portal featuring visual order progress trackers, color-coded status pills, and an account snapshot panel.
- **Category Explorer:** Advanced filtering system (grid vs list views, sorting, sub-categories).

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org) (App Router)
- **Library:** React 18
- **Styling:** Vanilla CSS Modules (No Tailwind, for precise, custom styling and component isolation)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Typography:** `next/font` (Google Fonts: Fraunces, Inter, IBM Plex Mono)

## Getting Started

First, install the dependencies:

```bash
npm install
```

Then, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Project Structure

The project uses Next.js App Router conventions:
- `/src/app`: Contains all route pages (`/`, `/shop`, `/cart`, `/checkout`, `/account`, `/product/[id]`).
- `/src/components`: Reusable UI components grouped by feature (`common`, `shop`, `ui`).
- `/src/data`: Contains the mock data (`categoryData.ts`) powering the storefront catalog.

## Contributing
All UI components use modular CSS. When contributing new components, ensure they reside in `/src/components` with an accompanying `.module.css` file to maintain style isolation and the project's premium design language.
