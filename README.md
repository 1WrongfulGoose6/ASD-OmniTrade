[![Board Status](https://dev.azure.com/AdvSofDevGroup5/346566fe-0863-4f3c-9906-218568a2a078/42082b11-265f-4c6b-8f3a-de293e801a59/_apis/work/boardbadge/cfaa5c7a-773b-4bc3-812e-6bef28dd0b17?columnOptions=1)](https://dev.azure.com/AdvSofDevGroup5/346566fe-0863-4f3c-9906-218568a2a078/_boards/board/t/42082b11-265f-4c6b-8f3a-de293e801a59/Epics/)
[![Build Status](https://dev.azure.com/AdvSofDevGroup5/ASD-OmniTrade/_apis/build/status%2F1WrongfulGoose6.ASD-OmniTrade?branchName=ali%2Fportfolio-mockup)](https://dev.azure.com/AdvSofDevGroup5/ASD-OmniTrade/_build/latest?definitionId=1&branchName=ali%2Fportfolio-mockup)


# OmniTrade - Crypto Trading Platform

A crypto trading website that allows users to create portfolios through buying and selling with market or limit orders. Users can search for crypto coins, observe live market data in charts and see portfolio performance over various time frames. Setting watchlists and creating alerts to always stay on top of the market along with a dedicated news feature. Users may deposit or withdraw currency as well as export trade data in bulk. With an intuitive UI, which allows for a seamless experience across the entire platform.


## Tech Stack

**Client:** React, Next.js, TailwindCSS

**Server:** Node.js


## Run Locally

Clone the project

```bash
  git clone https://github.com/1WrongfulGoose6/ASD-OmniTrade
```

Go to the project directory

```bash
  cd my-project
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```

## Testing
Automated Jest unit tests and Playwright end2end tets run during the pipeline, you can run these tests locally with:

```bash
  npm test
  npm run test:e2e
```

## Design Patterns
For how OmniTrade implements RESTful resource design and supporting patterns (layered architecture, Prisma singleton, repositories/services, cache-aside, retry/backoff, facade, and strategy for alerts), see:

- docs/design-patterns.md — includes Mermaid diagrams of the architecture, request sequence, class relationships, and trade state.

## Authors
 - [Kaigagi](https://github.com/Kaigagi)
 - [Savya-Rai](https://github.com/Savya-Rai)
 - [PrinceAlii](https://github.com/PrinceAlii)
 - [AW1101](https://github.com/AW1101)