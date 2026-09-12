# Waste2Carbon (W2C)

> **Theme**: Circular Carbon Ecosystem  
> **Platform**: Waste-to-Carbon Value Chain Tracker & MRV Platform

An end-to-end circular marketplace and logistics platform that connects organic/industrial waste generators (farms, food industries, municipalities) with certified carbon-conversion facilities (biochar pyrolysis and anaerobic biogas plants), optimizes collection logistics, and certifies permanent CO2 sequestration per ton of waste diverted from landfills.

---

## 🌟 Key Features

### 1. Waste Producer / Generator Portal
- **Streamlined Feedstock Listing**: Categorize waste by physical and chemical attributes (Dry Organic, Wet Organic, Industrial Organic) rather than generic generator labels.
- **Advance Generation Scheduling**: Plan pickups in advance based on harvest or production cycles to eliminate reactive, expensive logistics.
- **Dynamic IPCC Carbon Calculator**: Real-time evaluation of:
  - Landfill methane avoidance ($tCO_2e$)
  - Stable carbon fixation via biochar pyrolysis or biogas displacement ($tCO_2e$)
  - Certified carbon credits issued ($1\text{ credit} = 1\text{ metric ton } CO_2e$)
  - Estimated revenue and carbon incentive payout.
- **Proximity & Quality Matcher**: Automatically recommends nearby verified conversion facilities with distance, offered buying price, facility ratings, active seller counts, and phone contacts.
- **Pickup Handshake Security**: Displays a 6-digit OTP to show to the truck driver upon arrival.

### 2. Waste Processor Portal
- **Facility Intake Hub**: Real-time capacity utilization progress bar (e.g. 280 / 450 Tons/month).
- **Feedstock Triage**: Accept or decline incoming pickup requests based on distance, volume, and date.
- **Collection Handshake Validation**: Truck drivers or plant operators enter the producer's 6-digit OTP along with the verified scale weight to confirm delivery.
- **Dual-Party Carbon Credit Minting**: Instantly mints certified carbon credits to both generator and processor upon handshake completion.

### 3. Admin & GIS Supervision Hub
- **Interactive Web GIS (Leaflet.js)**: Live spatial map visualizing waste producers, biochar plants, biogas digesters, cluster service radii, and active transport routes.
- **Carbon Sequestration Ledger (MRV)**: Tamper-evident, audit-ready registry with unique cryptographic certificate IDs, verifiable weights, and IPCC protocols.
- **Growth & Impact Analytics**: Interactive visual charts (Recharts) detailing monthly carbon removal and feedstock distribution across conversion pathways.
- **Official Environmental Certificates**: Downloadable and printable Certificate of Verified Carbon Sequestration with QR verification seal.

---

## 🧮 Carbon Sequestration Calculation Engine

Our carbon model adheres to **IPCC Guidelines for National Greenhouse Gas Inventories** and the **European Biochar Certificate (EBC)** standard:

1. **Dry Organic $\to$ Biochar Pyrolysis**:
   $$\text{Avoided Landfill / Burning} = 0.48 \, tCO_2e / \text{ton}$$
   $$\text{Stable Biochar Carbon Fixation} = 0.82 \times \left(\frac{\text{Dry Matter Ratio}}{0.7}\right) \, tCO_2e / \text{ton}$$
   $$\text{Total Sequestered} = \text{Avoided} + \text{Fixed Carbon}$$

2. **Wet Organic $\to$ Anaerobic Biogas Digestion**:
   $$\text{Avoided Landfill Fugitive Methane} = 1.28 \, tCO_2e / \text{ton}$$
   $$\text{Fossil Fuel Displacement} = 0.38 \, tCO_2e / \text{ton}$$

---

## 🚀 Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Mapping & GIS**: Leaflet.js, React-Leaflet, CartoDB Voyager tiles
- **Data Visualization**: Recharts
- **Database & Auth**: Supabase (PostgreSQL, Row-Level Security, Auth)
- **Build Tool**: Vite

---

## ⚙️ Quick Start

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/harshpareshbhaigosalya/Waste2Carbon.git
cd Waste2Carbon
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 3. Supabase Database Setup
Execute the SQL script in `supabase_schema.sql` inside your **Supabase SQL Editor** to create all tables (`profiles`, `processors_info`, `waste_listings`, `pickup_requests`, `carbon_credits_ledger`) and configure Row Level Security (RLS) policies.

---

## 📦 Project Structure

```
├── public/
│   └── leaf.svg
├── src/
│   ├── components/
│   │   ├── admin/
│   │   │   └── AdminDashboard.tsx      # Macro analytics & GIS tracker
│   │   ├── processor/
│   │   │   ├── HandshakeModal.tsx      # OTP verification & scale weigh-in
│   │   │   └── ProcessorDashboard.tsx  # Intake hub & capacity tracker
│   │   ├── producer/
│   │   │   ├── AddWasteModal.tsx       # Dynamic carbon model & matcher
│   │   │   └── ProducerDashboard.tsx   # Producer listings & handshake OTP
│   │   ├── AuthModal.tsx               # Supabase sign-in/sign-up
│   │   ├── CertificateModal.tsx        # Printable official carbon certificate
│   │   ├── MapView.tsx                 # Interactive Leaflet GIS map
│   │   ├── Navbar.tsx                  # Brand & quick role switcher
│   │   └── OnboardingModal.tsx         # Entity classification & GPS setup
│   ├── context/
│   │   └── AppContext.tsx              # Global state, Supabase sync & persistence
│   ├── data/
│   │   └── mockData.ts                 # Verified demo facilities & listings
│   ├── lib/
│   │   ├── carbonCalculator.ts         # IPCC emission factor formulas
│   │   └── supabase.ts                 # Supabase client configuration
│   ├── types/
│   │   └── index.ts                    # TypeScript data definitions
│   ├── App.tsx
│   ├── index.css
│   └── main.tsx
├── supabase_schema.sql                 # Complete PostgreSQL schema
├── index.html
├── package.json
└── vite.config.ts
```

---
## 📸 Project Glimpse

<img width="851" height="722" alt="image" src="https://github.com/user-attachments/assets/550b6d1b-22de-46ea-bb28-9d92c699db5f" />
<img width="1026" height="1364" alt="image" src="https://github.com/user-attachments/assets/67e0ec5b-b526-4769-aad3-8f230fa2f848" />
<img width="1897" height="1071" alt="image" src="https://github.com/user-attachments/assets/fc2ac368-a6b6-4763-bd81-be761366aaaa" />
<img width="820" height="703" alt="image" src="https://github.com/user-attachments/assets/b9dd8d0b-064c-42b2-9e48-dc6a8f4a4c99" />
<img width="916" height="1077" alt="image" src="https://github.com/user-attachments/assets/9fab4978-f884-42b4-bba9-5f12364d6937" />
<img width="1782" height="1509" alt="image" src="https://github.com/user-attachments/assets/4c8ac939-3535-4e61-b783-3c34970e68ad" />
<img width="1684" height="1830" alt="image" src="https://github.com/user-attachments/assets/9ccf211c-e196-443b-a6f3-e94826d3ffeb" />
<img width="1639" height="1341" alt="image" src="https://github.com/user-attachments/assets/04898d6c-4788-4ac2-926b-5b80e096f590" />
<img width="1222" height="526" alt="image" src="https://github.com/user-attachments/assets/73504388-7afc-4d4e-99ce-fc4e95bfa704" />

---


## 📄 License
MIT License. Built for circular climate impact.
