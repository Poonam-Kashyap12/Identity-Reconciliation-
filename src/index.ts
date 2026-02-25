import express from "express";
import { PrismaClient } from "@prisma/client";

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.post("/identify", async (req, res) => {
  try {
    const { email, phoneNumber } = req.body;

    // 1️⃣ Validate input
    if (!email && !phoneNumber) {
      return res.status(400).json({
        error: "Provide at least email or phoneNumber",
      });
    }

    // 2️⃣ Find contacts matching email or phone
    const matchingContacts = await prisma.contact.findMany({
      where: {
        OR: [
          email ? { email } : undefined,
          phoneNumber ? { phoneNumber } : undefined,
        ].filter(Boolean) as any,
      },
    });

    // 3️⃣ If no match → create new primary contact
    if (matchingContacts.length === 0) {
      const newContact = await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkPrecedence: "primary",
        },
      });

      return res.json({
        contact: {
          primaryContactId: newContact.id,
          emails: email ? [email] : [],
          phoneNumbers: phoneNumber ? [phoneNumber] : [],
          secondaryContactIds: [],
        },
      });
    }

    // 4️⃣ Get all related contacts (primary + secondaries)
    const contactIds = matchingContacts.map((c) => c.id);
    const linkedIds = matchingContacts
      .map((c) => c.linkedId)
      .filter(Boolean) as number[];

    const allRelatedContacts = await prisma.contact.findMany({
      where: {
        OR: [
          { id: { in: contactIds } },
          { id: { in: linkedIds } },
          { linkedId: { in: contactIds } },
          { linkedId: { in: linkedIds } },
        ],
      },
    });

    // 5️⃣ Find oldest contact → make it primary
    const primaryContact = allRelatedContacts.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    )[0];

    // 6️⃣ Ensure only one primary exists
    for (const contact of allRelatedContacts) {
      if (contact.id !== primaryContact.id) {
        if (
          contact.linkPrecedence !== "secondary" ||
          contact.linkedId !== primaryContact.id
        ) {
          await prisma.contact.update({
            where: { id: contact.id },
            data: {
              linkedId: primaryContact.id,
              linkPrecedence: "secondary",
            },
          });
        }
      }
    }

    // 7️⃣ Check if NEW information exists
    const existingEmails = allRelatedContacts
      .map((c) => c.email)
      .filter((e) => e !== null);

    const existingPhones = allRelatedContacts
      .map((c) => c.phoneNumber)
      .filter((p) => p !== null);

    const emailExists = email ? existingEmails.includes(email) : true;
    const phoneExists = phoneNumber
      ? existingPhones.includes(phoneNumber)
      : true;

    // Only create secondary if new info is provided
    if (!emailExists || !phoneExists) {
      await prisma.contact.create({
        data: {
          email,
          phoneNumber,
          linkedId: primaryContact.id,
          linkPrecedence: "secondary",
        },
      });
    }

    // 8️⃣ Fetch updated full group
    const finalContacts = await prisma.contact.findMany({
      where: {
        OR: [{ id: primaryContact.id }, { linkedId: primaryContact.id }],
      },
    });

    const emails = [
      ...new Set(finalContacts.map((c) => c.email).filter(Boolean)),
    ];

    const phoneNumbers = [
      ...new Set(finalContacts.map((c) => c.phoneNumber).filter(Boolean)),
    ];

    const secondaryContactIds = finalContacts
      .filter((c) => c.linkPrecedence === "secondary")
      .map((c) => c.id);

    return res.json({
      contact: {
        primaryContactId: primaryContact.id,
        emails,
        phoneNumbers,
        secondaryContactIds,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

app.listen(3000, () => {
  console.log("Server running on port 3000 🚀");
});
