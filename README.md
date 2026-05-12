# Four Meme Fork

A Next.js-based web application for creating and trading memecoins on Shibarium. Fork of the [Four Meme](https://four.meme) platform UI.

<img width="1604" height="831" alt="497861953-d8fdc1de-8d16-46d4-a3e7-a508812ab194" src="https://github.com/user-attachments/assets/59334740-db15-4bf7-8dc3-67a56ad44bc5" />
<img width="1631" height="844" alt="497861878-7b3e9fa1-62cb-4bf4-b28f-9cc7ef7f9215" src="https://github.com/user-attachments/assets/1324f52f-adc2-49ae-bffc-81f3c077f434" />
<img width="1596" height="732" alt="497861607-fff60975-383c-4178-ab17-8e70842c1dfa" src="https://github.com/user-attachments/assets/d95e869e-6d1c-4d88-b928-4d664d9648c7" />
<img width="1629" height="908" alt="497861506-49c955b8-45cb-45b0-a6ef-9bfb5383adb1" src="https://github.com/user-attachments/assets/7afb729c-1036-458a-bb29-29fcc9f7b67c" />
<img width="1894" height="938" alt="497860906-5a7ce8bb-43fc-4b6e-894b-a954f2d2c8c3" src="https://github.com/user-attachments/assets/75c2a4be-2978-4871-97c6-f000c8090487" />


## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Application](#running-the-application)
- [Architecture Overview](#architecture-overview)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Contributing](#contributing)

## Getting Started

### Prerequisites

- Node.js (v18 or later recommended)
- Yarn or npm

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/soladdev/fourmeme-fork
   cd fourmeme-fork
   ```

2. Install dependencies:
   ```bash
   yarn install
   ```

### Running the Application

1. Set up your environment variables (see [Environment Variables](#environment-variables) section).

2. Start the development server:
   ```bash
   yarn dev
   ```

3. Open your browser and navigate to `http://localhost:3000`.

## Architecture Overview

Four Meme Fork is built with:

- **Next.js** — React framework for server-side rendering and static site generation
- **React** — UI library
- **Tailwind CSS** — Utility-first styling
- **Wagmi** — React hooks for EVM chains
- **RainbowKit** — Wallet connection
- **Viem** — TypeScript-ready Ethereum interactions
- **lightweight-charts** — Data visualization

The app uses a component-based architecture with reusable UI components and hooks for blockchain state and interactions.

## Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_API_BASE_URL=your-backend-url
NEXT_PUBLIC_BONDING_CURVE_MANAGER_ADDRESS=your-contract-address
NEXT_PUBLIC_WS_BASE_URL=wss://your-backend-url
NEXT_PUBLIC_DOMAIN=https://your-domain.com
CHAINSAFE_API_KEY=your_chainsafe_api_key
CHAINSAFE_BUCKET_ID=your_chainsafe_bucket_id
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `yarn dev` | Start development server |
| `yarn build` | Build for production |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |
| `yarn typechain` | Generate contract types from ABIs |

## Contributing

Contributions are welcome. Please open an issue or submit a pull request for any changes.

## License

MIT
