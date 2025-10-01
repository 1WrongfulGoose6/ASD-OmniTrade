// prisma/seed.js
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcrypt'); //for hashing
const prisma = new PrismaClient()

async function main() {


    // Create an admin
    const adminPassword = await bcrypt.hash("admin123", 10);
    const admin = await prisma.user.create({
        data: {
        name: "Admin",
        email: "admin@example.com",
        passwordHash: adminPassword, 
        },
    })
    console.log("✅ Created admin:", admin.email)




    // Create a default user
    const user = await prisma.user.create({
        data: {
            name: "Henry",
            email: "henry@example.com",
            passwordHash: "henry123", // in real use, hash it!
        },
    })

    console.log("✅ Created user:", user.email)

    // Create a trade for that user
    await prisma.trade.create({
        data: {
            userId: user.id,
            symbol: "AAPL",
            side: "BUY",
            qty: 10,
            price: 150.5,
            status: "FILLED",
        },
    })

    // Create a trade backlog entry for that user
    await prisma.tradeBacklog.create({
        data: {
            userId: user.id,
            asset: "TSLA",
            type: "SELL",
            amount: 5.2,
            status: "Completed",
        },
    })

    console.log("✅ Seed data inserted")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
