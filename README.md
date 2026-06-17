# RideSafe Rewards 🏍️

> A gamified safety rewards platform for motorbike riders — earn tokens for safe riding, track your score, and redeem rewards. Built in 24 hours at Hackathrone (October 2025).

🔗 **[Live Demo →](https://ride-safe-rewards.vercel.app/)**

---

## The Problem

Motorbike accidents are one of the leading causes of road fatalities in India. Existing safety campaigns rely on awareness alone — there's no tangible incentive for riders to actually change their behaviour. Insurance companies penalise bad driving, but nobody rewards good driving.

RideSafe Rewards flips that model. Instead of punishing unsafe riders, it rewards safe ones.

---

## The Idea

RideSafe Rewards collects telemetry data from the rider's journey — speed patterns, braking behaviour, cornering, and acceleration — and runs it through a safety scoring algorithm. The score is converted into tokens per ride, which accumulate in the rider's wallet and can be redeemed for real-world rewards like vouchers, discounts, and partner offers.

The blockchain layer ensures token transactions are transparent, tamper-proof, and verifiable — making the reward system trustworthy for both riders and reward partners.

---

## Core Features

**📊 Safety Score Engine**
Telemetry data from each ride is processed through a scoring algorithm that evaluates riding behaviour across multiple parameters. Each ride generates a score between 0–100.

**🪙 Token Rewards**
Safety scores are converted to RideSafe tokens at the end of each journey. Consistent safe riding compounds your earnings over time.

**🏆 Leaderboard**
Compete with other riders in your region. The leaderboard gamifies safe riding and creates community accountability.

**💳 Rewards Redemption**
Accumulated tokens can be redeemed for vouchers and partner discounts — creating a real-world incentive loop.

**🔗 Blockchain-Backed Transactions**
Token issuance and redemption are logged on a simulated blockchain layer, ensuring transparency and immutability of reward records.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + TypeScript + Tailwind CSS |
| Backend | Node.js |
| Blockchain | Simulated blockchain layer |
| Deployment | Vercel |
| Build Tool | Vite |

---

## How It Works

```
Ride completed
      ↓
Telemetry data collected (speed, braking, acceleration, cornering)
      ↓
Safety scoring algorithm processes ride data
      ↓
Score (0–100) generated per ride
      ↓
Tokens calculated based on score
      ↓
Tokens added to rider's wallet (blockchain logged)
      ↓
Tokens redeemable for vouchers and rewards
```

---

## Context

This was built as a **proof-of-concept MVP** at **Hackathrone** on **30th October 2025** — a 24-hour team hackathon. The project was built by a 4-person team with this as the team captain's repository.

The goal was to demonstrate the viability of a behaviour-based rewards system for road safety — showing that the right incentive structure could be more effective than traditional awareness campaigns.

> ⚠️ **Note:** This is a hackathon MVP. The telemetry data and token generation are simulated for demonstration purposes. The blockchain component is a proof-of-concept implementation.

---

## Future Scope

- Real-time telemetry via smartphone gyroscope and accelerometer
- Integration with actual blockchain network (Polygon/Solana for low gas fees)
- Insurance company partnerships for premium discounts
- OBD-II device integration for more accurate vehicle data
- Mobile app (React Native) for live ride tracking
- Government road safety program integration

---

## Author

**Praanesh Srinivasan**
B.Tech CSE (Data Science) — VIT Chennai
[GitHub](https://github.com/Praanesh-S) · [LinkedIn](https://linkedin.com/in/praaneshsrinivasan)
