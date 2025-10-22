const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

function monthsAgo(months, extraDays = 0) {
  const date = new Date();
  date.setMonth(date.getMonth() - months);
  if (extraDays !== 0) {
    date.setDate(date.getDate() - extraDays);
  }
  return date;
}

async function main() {
  // Ensure repeatable runs by clearing existing users (cascades to dependents)
  await prisma.user.deleteMany();

  const [adminPassword, alicePassword, benPassword] = await Promise.all([
    bcrypt.hash('admin123', 10),
    bcrypt.hash('alice123', 10),
    bcrypt.hash('ben123', 10),
  ]);

  const admin = await prisma.user.create({
    data: {
      name: 'Site Admin',
      email: 'admin@example.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
      blacklisted: false,
      createdAt: monthsAgo(3),
    },
  });
  console.log(`Created admin account for ${admin.email}`);

  const alice = await prisma.user.create({
    data: {
      name: 'Alice Chen',
      email: 'alice@example.com',
      passwordHash: alicePassword,
      createdAt: monthsAgo(3),
      trades: {
        create: [
          {
            symbol: 'AAPL',
            side: 'BUY',
            qty: 12,
            price: 154.25,
            status: 'FILLED',
            createdAt: monthsAgo(2, 10),
          },
          {
            symbol: 'GOOGL',
            side: 'BUY',
            qty: 3,
            price: 2820.1,
            status: 'FILLED',
            createdAt: monthsAgo(2, 5),
          },
        ],
      },
      watchlist: {
        create: [
          { symbol: 'TSLA', createdAt: monthsAgo(2, 20) },
          { symbol: 'MSFT', createdAt: monthsAgo(2, 15) },
        ],
      },
      bookmarks: {
        create: [
          {
            articleId: 'finnhub-article-1',
            title: 'Tech stocks rally on earnings beat',
            url: 'https://news.example.com/tech-stocks-rally',
            createdAt: monthsAgo(2, 12),
          },
        ],
      },
      alerts: {
        create: [
          {
            symbol: 'AAPL',
            operator: '>=',
            threshold: 160,
            createdAt: monthsAgo(2, 9),
          },
          {
            symbol: 'TSLA',
            operator: '<=',
            threshold: 200,
            createdAt: monthsAgo(2, 7),
          },
        ],
      },
      deposits: {
        create: [
          {
            amount: 5000,
            kind: 'DEPOSIT',
            createdAt: monthsAgo(2, 25),
          },
          {
            amount: 1000,
            kind: 'WITHDRAW',
            createdAt: monthsAgo(1, 20),
          },
        ],
      },
      tradeBacklogs: {
        create: [
          {
            asset: 'ETH',
            type: 'Buy',
            amount: 2.5,
            status: 'FILLED',
            date: monthsAgo(2, 18),
          },
        ],
      },
    },
  });
  console.log(`Seeded trading data for ${alice.email}`);

  const ben = await prisma.user.create({
    data: {
      name: 'Ben Romero',
      email: 'ben@example.com',
      passwordHash: benPassword,
      createdAt: monthsAgo(4),
      trades: {
        create: [
          {
            symbol: 'NFLX',
            side: 'SELL',
            qty: 5,
            price: 510.75,
            status: 'FILLED',
            createdAt: monthsAgo(2, 3),
          },
        ],
      },
      watchlist: {
        create: [
          { symbol: 'AAPL', createdAt: monthsAgo(2, 14) },
          { symbol: 'AMZN', createdAt: monthsAgo(2, 6) },
        ],
      },
      bookmarks: {
        create: [
          {
            articleId: 'finnhub-article-42',
            title: 'Bitcoin edges higher after regulatory update',
            url: 'https://news.example.com/bitcoin-update',
            createdAt: monthsAgo(2, 4),
          },
        ],
      },
      alerts: {
        create: [
          {
            symbol: 'BTC',
            operator: '>=',
            threshold: 45000,
            createdAt: monthsAgo(2, 2),
          },
        ],
      },
      deposits: {
        create: [
          {
            amount: 2500,
            kind: 'DEPOSIT',
            createdAt: monthsAgo(2, 21),
          },
        ],
      },
      tradeBacklogs: {
        create: [
          {
            asset: 'BTC',
            type: 'Sell',
            amount: 0.8,
            status: 'PENDING',
            date: monthsAgo(2, 1),
          },
          {
            asset: 'AMZN',
            type: 'Buy',
            amount: 1.2,
            status: 'FILLED',
            date: monthsAgo(2, 16),
          },
        ],
      },
    },
  });
  console.log(`Seeded trading data for ${ben.email}`);

  console.log('Seed data inserted successfully');
}

main()
  .catch((error) => {
    console.error('Failed to seed database:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
