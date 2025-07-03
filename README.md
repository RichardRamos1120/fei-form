# Firefighter Equipment Inventory

A React TypeScript application for managing firefighter equipment inventory with a clean, responsive UI built with Tailwind CSS.

## Features

- Comprehensive equipment tracking for firefighters
- Photo upload capabilities for equipment tags
- Collapsible sections for better organization
- Responsive design that works on all devices
- Form validation and user-friendly interface
- Support for "Information Unavailable" entries when data is unknown

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd fei-form
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:5173`

### Building for Production

To create a production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

## Equipment Categories

The form tracks the following equipment:

- **Firefighter Information**: Name, ID, rank, and department
- **Structure Jacket**: Shell and liner details
- **Structure Pants**: Shell and liner details
- **Helmet**: Serial number, size, manufacturer, etc.
- **Protective Hood**: Size and manufacturer information
- **Protective Gloves**: Size and condition tracking
- **Protective Boots**: Size and maintenance records
- **Miscellaneous Equipment**: SCBA, flashlights, radios, etc.

## Tech Stack

- React 18
- TypeScript
- Vite
- Tailwind CSS
- PostCSS

## License

This project is licensed under the MIT License.