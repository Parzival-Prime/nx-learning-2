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
                        "soils-substrates",
                        "tools",
                        "pesticides",
                        "pots-planters",
                        "aquascaping",
                    ],

                    subCategories: {
                        seeds: [
                            "flower-seeds-winter",
                            "flower-seeds-summer",
                            "vegetable-seeds-winter",
                            "vegetable-seeds-summer",
                            "fruit-seeds",
                            "herb-seeds",
                            "aquatic-plant-seeds",
                            "grass-lawn-seeds"
                        ],

                        saplings: [
                            "flowering-plant-saplings",
                            "vegetable-plant-saplings",
                            "fruit-plant-saplings",
                            "indoor-plant-saplings",
                            "aquatic-plant-saplings",
                            "bonsai-plants",
                            "mosses"
                        ],

                        fertilizers: [
                            "organic-fertilizers",
                            "chemical-fertilizers",
                            "liquid-fertilizers",
                            "slow-release-fertilizers",
                            "garden-fertilizers",
                            "crop-fertilizers",
                            "aquascape-fertilizers"
                        ],

                        "soils-substrates": [
                            "garden-soil",
                            "potting-soil",
                            "organic-compost",
                            "vermicompost",
                            "coco-peat",
                            "aquarium-soil",
                            "aquarium-sand",
                            "gravel-substrate",
                            "lava-rocks"
                        ],

                        tools: [
                            "gardening-tools",
                            "farm-tools",
                            "field-tools",
                            "pruning-tools",
                            "watering-tools",
                            "aquascaping-tools",
                            "soil-testing-tools"
                        ],

                        pesticides: [
                            "organic-pesticides",
                            "chemical-pesticides",
                            "crop-pesticides",
                            "garden-pesticides",
                            "fungicides",
                            "insecticides"
                        ],

                        "pots-planters": [
                            "garden-pots-small",
                            "garden-pots-big",
                            "ceramic-pots",
                            "plastic-pots",
                            "clay-pots",
                            "bonsai-pots",
                            "hanging-planters",
                            "aquascape-pots"
                        ],

                        aquascaping: [
                            "aquarium-plants",
                            "driftwood",
                            "rocks-stones",
                            "aquarium-decor",
                            "co2-equipment",
                            "aquarium-filters",
                            "aquarium-lighting"
                        ]
                    }

                }
            })
        }
    } catch (error) {
        console.log("Error Initializing site config: ", error)
    }
}