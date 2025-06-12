
# Vyapar Sahayak - Modern POS & Inventory Solution 🛒

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-15.x-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.x-blue?logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.x-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Firebase](https://img.shields.io/badge/Firebase-SDK_v11-orange?logo=firebase)](https://firebase.google.com/)
[![Genkit](https://img.shields.io/badge/Genkit-AI_Toolkit-brightgreen?logo=google-cloud)](https://firebase.google.com/docs/genkit)

**Vyapar Sahayak** (व्यापार सहायक - Business Assistant) is a modern, intuitive Point of Sale (POS) and inventory management application designed specifically for small shopkeepers. Built with a cutting-edge tech stack, it aims to simplify daily operations, streamline billing, manage stock efficiently, and provide insightful data.

---

## ✨ Key Features

*   **🏠 Dashboard Overview:** Quick stats on total products, low stock items, today's sales, and bills generated.
    *   `[Illustrative GIF: Dashboard showing animated stats and quick action cards]`
*   **📦 Product Management:**
    *   Easily add, edit, and delete products.
    *   Categorize items and manage prices.
    *   Track quantity and set minimum stock thresholds for alerts.
    *   Search and filter product list.
*   **🧾 Multi-Lingual Bill Generation:**
    *   Swiftly add products to a cart.
    *   Update quantities or remove items from the cart.
    *   Automatic calculation of subtotals and grand total.
    *   Record customer name and phone number (optional).
    *   Generate and view bill summaries.
    *   AI-powered product suggestions (premium).
    *   Interface available in **English, Hinglish, and Hindi** for ease of use.
*   **📓 Ledger Book (Udhaar Khata):**
    *   Manage credits (receivables) and debits (payables).
    *   Track amounts owed by customers or owed to suppliers.
    *   Record transaction details like name, amount, phone, description, and date.
    *   `[Illustrative GIF: Adding a new entry to Udhaar Khata and viewing totals]`
*   **📜 Bill History:**
    *   View a comprehensive list of all generated bills.
    *   Expandable accordion view to see itemized details for each bill.
    *   Search and sort bills by date, amount, customer, or bill number.
*   **⚙️ Customizable Settings:**
    *   Switch between **Dark** and **Light** themes.
    *   Multi-language support (**English, Hinglish, Hindi**) for the entire application.
    *   Set a global low stock threshold.
    *   Toggle pop-up notifications.
*   **🗣️ Voice Commands & Chat Assistant (AI-Powered):**
    *   **Voice Dictation:** Speak to fill in forms or input text (basic).
    *   **Chat Assistant:** Ask questions, navigate the app, or get quick information using predefined commands (basic).
    *   **Premium AI Features:**
        *   Direct voice command execution (e.g., "Add Parle-G to cart").
        *   AI-driven product suggestions during billing.
    *   `[Illustrative GIF: User interacting with the voice command dialog and chatbot]`
*   **👤 User Profile:**
    *   View profile information.
    *   Edit name and email.
    *   (Premium) Option to change profile picture.
*   **📞 Contact Page:** Information about the developer.
*   **📱 Responsive Design:** Adapts to various screen sizes for use on desktops, tablets, and mobiles.

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or later recommended)
*   npm (usually comes with Node.js) or yarn
*   A Firebase project set up with:
    *   **Firestore** enabled
    *   **Authentication** (Email/Password or other methods as needed)
    *   **Storage** (if image uploads are implemented for premium features)
*   A Google Cloud Project with the **Vertex AI API** enabled for Genkit AI features.

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://your-repository-url/vyapar-sahayak.git
    cd vyapar-sahayak
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Set up Environment Variables:**
    Create a `.env` file in the root of your project and add your Firebase project configuration details:

    ```env
    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket_url
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

    # For Genkit AI features
    GOOGLE_API_KEY=your_google_cloud_api_key_for_vertex_ai
    ```
    *   Replace `your_...` with your actual Firebase and Google Cloud credentials.
    *   **Important for `GOOGLE_API_KEY`**: This key is used by Genkit to interact with Google AI models (like Gemini). Ensure it has access to the Vertex AI API.
    *   **Important for `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`**: Ensure this is the correct URL (e.g., `your-project-id.appspot.com`). Incorrect configuration here is a common source of "storage/unknown" errors.

### Running the Application

Vyapar Sahayak uses Next.js for the frontend and Genkit for AI flow development.

1.  **Start the Next.js development server:**
    This will run the main application.
    ```bash
    npm run dev
    ```
    The application will typically be available at `http://localhost:9002`.

2.  **Start the Genkit development server (optional, for AI feature development):**
    If you are working on or testing AI flows with Genkit, run this in a separate terminal:
    ```bash
    npm run genkit:dev
    # or for watching changes
    # npm run genkit:watch
    ```
    This usually starts the Genkit development UI at `http://localhost:4000`.

---

## 🛠️ Tech Stack

*   **Frontend:**
    *   [Next.js](https://nextjs.org/) (v15) - React framework for server-side rendering and static site generation.
    *   [React](https://reactjs.org/) (v18) - JavaScript library for building user interfaces.
    *   [TypeScript](https://www.typescriptlang.org/) - Superset of JavaScript that adds static typing.
*   **UI & Styling:**
    *   [ShadCN UI](https://ui.shadcn.com/) - Beautifully designed, accessible, and customizable UI components.
    *   [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework for rapid UI development.
    *   [Lucide React](https://lucide.dev/) - Simply beautiful open-source icons.
    *   [Framer Motion](https://www.framer.com/motion/) - For animations and transitions.
*   **Backend & Database:**
    *   [Firebase](https://firebase.google.com/)
        *   **Firestore:** NoSQL cloud database for storing products, bills, ledger entries, etc.
        *   **Firebase Authentication:** For user management (if implemented).
        *   **Firebase Storage:** For storing images like profile pictures or product images (premium features).
*   **AI Functionality:**
    *   [Genkit (by Firebase)](https://firebase.google.com/docs/genkit) - Toolkit for building, deploying, and managing AI-powered features.
    *   [Google AI (Gemini Models via Vertex AI)](https://ai.google/gemini/) - For language understanding and generation.
*   **State Management & Data Fetching:**
    *   React Context API (for theme, language, settings).
    *   React Hooks (`useState`, `useEffect`, `useCallback`, `useMemo`).
    *   `@tanstack/react-query` (could be integrated for more robust data fetching if needed, currently uses direct service calls).
*   **Forms:**
    *   [React Hook Form](https://react-hook-form.com/) - Performant, flexible, and extensible forms with easy-to-use validation.
    *   [Zod](https://zod.dev/) - TypeScript-first schema declaration and validation library.
*   **Internationalization (i18n):**
    *   Custom implementation using React Context and JSON locale files for English, Hinglish, and Hindi.
*   **Development Tools:**
    *   ESLint, Prettier (assumed for code quality).
    *   VS Code with IDX.AI extensions (as per `.vscode/settings.json`).

---

## 🔑 Key Functionality Deep Dive

### Product Management
Add, view, edit, and delete products in your inventory. Each product can have a name, category, price, quantity, and an optional minimum stock threshold. The system will alert you for low-stock items based on these thresholds.
`[Illustrative GIF: Navigating to products page, adding a new product, editing an existing one, and seeing a low-stock badge]`

### Billing (Multi-Lingual POS)
The billing interface allows for quick addition of products to a customer's cart. Search for products, adjust quantities, and see the total amount update in real-time. Customer details can be optionally added. The interface is available in English, Hinglish, and Hindi, making it accessible to a wider range of users.
`[Illustrative GIF: Searching for products, adding to cart, changing quantity, generating a bill, and switching language in the billing interface]`

### Ledger Book (Udhaar Khata)
Keep track of all credit and debit transactions. Easily add entries for money owed to you (receivable) or money you owe to others (payable). View summarized totals for receivables and payables.
`[Illustrative GIF: Adding a payable and receivable entry, showing the main totals update]`

### AI-Powered Features
Vyapar Sahayak leverages Genkit to integrate AI:
*   **Voice Dictation:** Speak into forms instead of typing.
*   **Chat Assistant:** Use natural language or select predefined commands to navigate the app or query information (e.g., "Show me products", "What's [Customer X]'s due?").
*   **Product Suggestions (Premium):** During billing, the AI can suggest relevant products based on sales history and current cart items.
    `[Illustrative GIF: User interacting with chatbot to navigate, then using voice to ask about stock, then AI suggesting items during billing]`

---

## 🎨 UI & Styling

The application boasts a modern and clean user interface:
*   **ShadCN UI Components:** Provides a set of beautifully designed and accessible components that are highly customizable.
*   **Tailwind CSS:** Enables rapid styling with a utility-first approach, ensuring consistency and maintainability.
*   **Theming:** Supports both Dark and Light themes, which can be toggled from the settings page. The theme is persisted in local storage.
    `[Illustrative GIF: Showing the app in light mode, then toggling to dark mode]`

---

## 🌐 Internationalization

Vyapar Sahayak is designed for a diverse user base, offering full application support for:
*   English
*   Hinglish (Hindi written in Roman script)
*   Hindi (Devanagari script)

Language can be easily switched from the settings page or the top bar, ensuring all labels, buttons, and messages are displayed in the chosen language.

---

## 🔮 Future Scope / Potential Enhancements

*   **Printable Bills:** Allow users to generate and print physical copies of bills.
*   **User Authentication:** Implement user accounts for data privacy and multi-user shops.
*   **Advanced Analytics & Reports:** Provide more detailed sales reports, profit tracking, and inventory analysis.
*   **Barcode Scanning:** Integrate barcode scanning for faster product addition to cart.
*   **Offline Mode:** Allow basic billing and product viewing even without an internet connection, syncing data when online.
*   **Supplier Management:** Track suppliers and purchase orders.
*   **Cloud Backup & Sync:** More robust cloud synchronization for data safety.
*   **Mobile App:** Native mobile application for Android/iOS.

---

## 👤 Developer

This application is developed by **Priyansh Srivastava**.

---

Feel free to explore the codebase and enhance Vyapar Sahayak further!
