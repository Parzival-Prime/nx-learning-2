import { PrismaClient } from "@/generated/prisma/client";

const prisma = new PrismaClient()

export async function initializeConfig() {
    try {
        const existingConfig = await prisma.site_config.findFirst()

        if (!existingConfig) {
            await prisma.site_config.create({
                data: {
                    categories: [
                        "seeds",
                        "saplings",
                        "fertilizers",
                        "soils&substrates",
                        "tools",
                        "pesticides",
                        "pots"
                    ],
                    subCategories: {
                        "seeds": ["flower-seeds/winter", "flower-seeds/summer", "fruits-seeds", "vegetable-seeds/winter", "vegetable-seeds/summer", "aquatic-plant-seeds"],
                        "saplings": ["flowering-plant-saplings", "fruits-plant-saplings", "vegetable-plant-saplings", "aquatic-plant-saplings", "mosses"],
                        "fertilizers": ["crop-fertilizers", "garden-fertilizers", "aquascape-fertilizers"],
                        "soil": ["garden-soil", "aquarium-soil"],
                        "tools": ["farm/field-tools", "gardening-tools", "aquascaping-tools"],
                        "pesticides": ["crop-pesticides", "garden-pesticides"],
                        "pots": ["garden-pots/small", "garden-pots/big", "bonsai-pots", "aquascape-pots"]
                    }
                }
            })
        }
    } catch (error) {
        console.log("Error Initializing site config: ", error)
    }
}